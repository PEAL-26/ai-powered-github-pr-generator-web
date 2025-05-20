"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitCommit,
  GitPullRequest,
  Loader2,
  Sparkles,
  LogOut,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Github } from "@/lib/github";
import { AI } from "@/lib/ai";
import { useSearchParams } from "next/navigation";
import { RepositoriesSelect, Repository } from "./repositories-select";
import { AISettings, SettingsModal } from "./settings-modal";

interface Props {
  auth: {
    token: string;
    user: { name: string; avatar: string; login: string };
  };
  configs: {
    aiApiKey: string;
    aiApiUrl: string;
    aiModel: string;
  };
  onLogout?(): void;
  saveSettingsAction: (data: AISettings) => void;
}

type Commit = {
  id: string;
  sha: string;
  author: string;
  date: string;
  message: string;
};

export function MainContent(props: Props) {
  const { configs, auth, onLogout, saveSettingsAction } = props;

  const { github, user, ai } = useMemo(() => {
    const github = new Github(auth.token);
    const ai = new AI({
      baseURL: configs.aiApiUrl,
      apiKey: configs.aiApiKey,
      model: configs.aiModel,
      dangerouslyAllowBrowser: true,
    });
    const user = auth.user;
    return { github, user, ai };
  }, [auth, configs]);

  const [openAllCommitsModal, setOpenAllCommitsModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [baseBranch, setBaseBranch] = useState("");
  const [headBranch, setHeadBranch] = useState("");
  const [commits, setCommits] = useState<Commit[]>([]);
  const [pullRequest, setPullRequest] = useState<
    { title?: string; description?: string } | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; content: string; scope?: string } | undefined
  >(undefined);

  const params = useSearchParams();

  const handleLogout = () => {
    onLogout?.();
    //setRepositories([]);
    setSelectedRepo(null);
    setBranches([]);
    setBaseBranch("main");
    setHeadBranch("");
    setCommits([]);
    setPullRequest(undefined);
    setSuccess(false);
  };

  const handleRepoSelect = async (repository: Repository) => {
    setSelectedRepo(repository);

    try {
      const branches = await github.getBranches({
        owner: user.login,
        repo: repository.name,
      });

      setBranches(branches.map((b: { name: string }) => b.name));
      setCommits([]);
      setBaseBranch("");
      setHeadBranch("");
      setPullRequest(undefined);
      setLoading(false);
      setSuccess(false);
      setGenerating(false);
    } catch (error) {
      console.error(error);
      return setMessage({
        type: "error",
        content: `Não foi possível carregar as branches do repositório ${repository.name}`,
      });
    }
  };

  const fetchCommits = useCallback(async () => {
    if (generating) return;
    if (loading) return;
    if (success) return;

    try {
      setMessage(undefined);
      if (!selectedRepo) {
        return setMessage({
          type: "error",
          content: "Selecione o repositório primeiro.",
        });
      }

      if (!headBranch) {
        return setMessage({
          type: "error",
          content: "Selecione a Branch de Comparação",
        });
      }

      setLoading(true);
      setGenerating(false);
      setPullRequest(undefined);
      setMessage(undefined);
      setSuccess(false);

      const { commits } = await github.getUnmergedCommits({
        owner: user.login,
        repo: selectedRepo.name,
        targetBranch: baseBranch,
        sourceBranch: headBranch,
      });

      commits.sort(
        (
          a: { commit: { committer: { date: string } } },
          b: { commit: { committer: { date: string } } }
        ) => {
          return (
            new Date(b.commit.committer.date).getTime() -
            new Date(a.commit.committer.date).getTime()
          );
        }
      );

      setCommits(
        commits.map(
          (c: {
            node_id: string;
            sha: string;
            commit: {
              message: string;
              committer: { date: string };
            };
            author: { login: string };
          }) => ({
            id: c.node_id,
            sha: c.sha,
            message: c.commit.message,
            author: c.author.login,
            date: new Date(c.commit.committer.date).toLocaleString(),
          })
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    baseBranch,
    generating,
    github,
    headBranch,
    loading,
    selectedRepo,
    success,
    user.login,
  ]);

  const generatePullRequest = async () => {
    try {
      if (commits.length === 0) return;
      setGenerating(true);
      setPullRequest(undefined);
      setMessage(undefined);
      const response = await ai.chatCompletionsCreate({
        messages: [
          {
            role: "user",
            content: `Você é um assistente especializado em desenvolvimento de software e boas práticas de Git.
            Vou fornecer uma lista de mensagens de commit e quero que você gere:
            
            1. Um título claro e conciso para o pull request (máximo de 72 caracteres)
            2. Uma descrição detalhada que:
               - Explique o propósito geral das mudanças
               - Destaque as alterações mais importantes
               - Inclua quaisquer observações relevantes para os revisores
               - Formate a descrição em Markdown
            
            As mensagens de commit são:
            ${commits.map((c) => c.message).join("\n")}
            
            Retorne a resposta em formato JSON com a seguinte estritamente a estrutura (na estrutura deve ter apenas o title e a description e nada mais) a baixo:
            {
              "title": "Título do PR aqui",
              "description": "Descrição detalhada aqui\\n- Com\\n- Markdown\\n- Formatado"
            }
            
            O título deve ser em inglês (se possível) e seguir o padrão convencional commit (ex: "feat: add new authentication module").
            A descrição pode ser em português.
            
            OBS: o conteúdo do title e da description, não pode ser em momento algum object
            `,
          },
        ],
      });

      const messageContent = response.choices
        .flatMap((c) => c.message.content)
        .join("\n");

      const [data] = messageContent.match(/\{[\s\S]*\}/) || [];
      const dataJSON: { title: string; description: string } | undefined = data
        ? (() => {
            try {
              return JSON.parse(data);
            } catch (error) {
              console.error(error);
              return undefined;
            }
          })()
        : undefined;

      if (dataJSON) {
        setPullRequest(dataJSON);
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        content: "Não foi possível gerar o pull request.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const createPullRequest = async () => {
    try {
      if (!selectedRepo?.name) {
        return setMessage({
          type: "error",
          content: "Selecione um repositório",
        });
      }
      if (!pullRequest?.title) {
        return setMessage({
          type: "error",
          content: "Insira o título da PR",
        });
      }

      setLoading(true);
      setMessage(undefined);
      await github.createPullRequest({
        owner: user.login,
        repo: selectedRepo.name,
        targetBranch: baseBranch,
        sourceBranch: headBranch,
        title: pullRequest?.title,
        body: pullRequest?.description || "",
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setMessage(undefined);
        setPullRequest(undefined);
        setCommits([]);
      }, 500);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        content: "Não foi possível criar o pull request.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const repositoryName = params.get("repository_name");
      const baseBranch = params.get("base_branch");
      const headBranch = params.get("head_branch");

      if (!repositoryName) return;
      if (!baseBranch) return;
      if (!headBranch) return;

      const repository = await github.getRepositoryByOwner({
        owner: user.login,
        repo: repositoryName,
      });

      setSelectedRepo(repository);
      setBaseBranch(baseBranch);
      setHeadBranch(headBranch);

      await fetchCommits();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [github, params, user.login]);

  const iconMessage = {
    error: <TriangleAlertIcon className="mr-2 h-5 w-5" />,
    success: <InfoIcon className="mr-2 h-5 w-5" />,
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            <Image
              height={40}
              width={40}
              src={user?.avatar || "/placeholder.svg"}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">Connected to GitHub</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <SettingsModal
            saveSettingsAction={saveSettingsAction}
            defaultConfigs={configs}
          />
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "relative my-8 p-4 border text-center",
            message.type === "error" &&
              "border-red-200 bg-red-50 rounded-lg text-red-800",
            message.type === "success" &&
              "border-green-200 bg-green-50 rounded-lg text-green-800"
          )}
        >
          <h3 className="font-bold text-lg mb-2 flex items-center justify-center">
            {iconMessage[message.type]}
            {message.type === "error" && "Oops, algo deu errado!"}
            {message.type === "success" && "Yep, Operação feita com sucesso."}
          </h3>
          <p>{message.content}</p>
          <button
            className="absolute top-3 right-3 hover:cursor-pointer"
            onClick={() => setMessage(undefined)}
          >
            <XIcon size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Repositores */}
        <Card>
          <CardHeader>
            <CardTitle>Repository Information</CardTitle>
            <CardDescription>
              Select your repository and branches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repository">Repository</Label>
              <div className="flex items-center gap-2">
                <RepositoriesSelect
                  disabled={generating}
                  auth={auth}
                  onRepositoryChange={handleRepoSelect}
                />
              </div>
            </div>

            {selectedRepo && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base-branch">Base Branch</Label>
                  <Select
                    disabled={generating}
                    value={baseBranch}
                    onValueChange={(value) => {
                      setBaseBranch(value);
                      setLoading(false);
                    }}
                  >
                    <SelectTrigger id="base-branch" className="w-full">
                      <SelectValue placeholder="Select base branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head-branch">Compare Branch</Label>
                  <Select
                    disabled={generating}
                    value={headBranch}
                    onValueChange={(value) => {
                      setHeadBranch(value);
                      setLoading(false);
                    }}
                  >
                    <SelectTrigger id="head-branch" className="w-full">
                      <SelectValue placeholder="Select head branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={fetchCommits}
              disabled={!selectedRepo || !headBranch || loading || generating}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Commits
                </>
              ) : (
                <>
                  <GitCommit className="mr-2 h-4 w-4" />
                  Fetch Commits
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Commits */}
        <Card>
          <CardHeader>
            <CardTitle>Commits</CardTitle>
            <CardDescription>Recent commits from your branch</CardDescription>
          </CardHeader>
          <CardContent>
            {commits.length > 0 ? (
              <div className="space-y-4">
                {commits.slice(0, 3).map((commit) => (
                  <div key={commit.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <GitCommit className="h-3 w-3" />
                      <span className="font-mono">
                        {commit.sha.substring(0, 7)}
                      </span>
                      <span>by {commit.author}</span>
                      <span className="ml-auto">{commit.date}</span>
                    </div>
                    <p className="text-sm">{commit.message}</p>
                  </div>
                ))}
                {/* {commits.length > 3 && ( */}
                <div className="flex items-center justify-center">
                  <Button
                    variant="link"
                    className="text-xs text-blue-500 hover:cursor-pointer hover:no-underline"
                    onClick={() => setOpenAllCommitsModal(true)}
                  >
                    Ver Todos Commits
                  </Button>
                </div>
                {/* )} */}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GitCommit className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No commits loaded yet</p>
                <p className="text-sm">Fetch commits to generate a PR</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={generatePullRequest}
              disabled={commits.length === 0 || generating}
              className="w-full sticky bottom-0"
              variant="secondary"
            >
              <Sparkles
                className={cn("mr-2 h-4 w-4", generating && "animate-bounce")}
              />
              {generating ? "Generating..." : "Generate PR with AI"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Pull Request */}
      {pullRequest && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pull Request</CardTitle>
            <CardDescription>
              AI-generated pull request based on your commits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pr-title">Title</Label>
              <Input
                id="pr-title"
                value={pullRequest.title}
                onChange={(e) =>
                  setPullRequest((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-description">Description</Label>
              <Textarea
                id="pr-description"
                rows={8}
                value={pullRequest.description}
                onChange={(e) =>
                  setPullRequest((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={createPullRequest}
              disabled={!pullRequest || loading}
              className="w-full"
              variant="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating PR
                </>
              ) : (
                <>
                  <GitPullRequest className="mr-2 h-4 w-4" />
                  Create Pull Request
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {success && (
        <div className="mt-8 p-4 border border-green-200 bg-green-50 rounded-lg text-green-800 text-center">
          <h3 className="font-bold text-lg mb-2 flex items-center justify-center">
            <GitPullRequest className="mr-2 h-5 w-5" />
            Pull Request Created Successfully!
          </h3>
          <p>Your pull request has been created and is ready for review.</p>
        </div>
      )}

      {openAllCommitsModal && (
        <div
          className="z-50 fixed inset-0 bg-black/50 flex items-center justify-center w-screen h-screen overflow-auto"
          onClick={() => {
            setOpenAllCommitsModal(false);
          }}
        >
          <div
            className="w-lg relative"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  All Commits
                  <Button
                    variant="ghost"
                    className="absolute top-3 right-4 p-0 hover:cursor-pointer"
                    onClick={() => setOpenAllCommitsModal(false)}
                  >
                    <XIcon size={16} />
                  </Button>
                </CardTitle>
                <CardDescription>All commits from your branch</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100vh-66px)] overflow-y-auto">
                <div className="space-y-4">
                  {commits.map((commit) => (
                    <div key={commit.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <GitCommit className="h-3 w-3" />
                        <span className="font-mono">
                          {commit.sha.substring(0, 7)}
                        </span>
                        <span>by {commit.author}</span>
                        <span className="ml-auto">{commit.date}</span>
                      </div>
                      <p className="text-sm">{commit.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
