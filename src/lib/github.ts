import { Octokit } from "octokit";
import { GITHUB_API } from "@/constants/constants";
import { Owner } from "@/types";

interface Options {
  apiUrl?: string;
}

export class Github {
  private apiUrl: string;
  private octokit: Octokit;

  constructor(private token: string, options?: Options) {
    const { apiUrl = GITHUB_API } = options || {};
    this.apiUrl = apiUrl;
    this.octokit = new Octokit({ auth: token });
  }

  listRepositories = async (options?: {
    owner?: string;
    ownerType?: "user" | "organization";
  }) => {
    const { owner, ownerType } = options || {};

    if (ownerType === "organization" && owner) {
      return this.octokit
        .request("GET /orgs/{org}/repos", {
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
          org: owner,
          sort: "updated",
          direction: "desc",
          type: "all",
        })
        .then((response) => response.data);
    }

    return this.octokit
      .request("GET /user/repos", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        sort: "updated",
        direction: "desc",
        affiliation: "owner",
      })
      .then((response) => response.data);
  };

  listAllRepositories = async () => {
    return this.octokit
      .request("GET /user/repos", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        sort: "updated",
        direction: "desc",
      })
      .then((response) => response.data);
  };

  listAllOwners = async (): Promise<Owner[]> => {
    const [organizations, user] = await Promise.all([
      this.octokit.request("GET /user/orgs").then((response) => response.data),
      this.octokit.request("GET /user").then((response) => response.data),
    ]);

    const owners: Owner[] = [
      accountToOwner(user, "user"),
      ...organizations.map((data: {
        id: number;
        login: string;
        avatar_url: string;
        events_url: string;
        node_id: string;
        repos_url: string;
        url: string;
        description?: string | null;
      }) =>
        accountToOwner(data, "organization")
      ),
    ];

    return owners;
  };

  getRepositoryByOwner = async ({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }) => {
    return this.octokit
      .request("GET /repos/{owner}/{repo}", {
        owner,
        repo,
      })
      .then((response) => response.data);
  };

  getBranches = async ({ owner, repo }: { owner: string; repo: string }) => {
    return this.octokit
      .request("GET /repos/{owner}/{repo}/branches", {
        owner,
        repo,
      })
      .then((response) => response.data);
  };

  getHeadBranch = async ({ owner, repo }: { owner: string; repo: string }) => {
    return this.getRepositoryByOwner({ owner, repo });
  };

  getCommits = async ({
    owner,
    branch,
    repo,
  }: {
    owner: string;
    branch: string;
    repo: string;
  }) => {
    return this.octokit
      .request("GET /repos/{owner}/{repo}/commits", {
        owner,
        repo,
        sha: branch,
      })
      .then((response) => response.data);
  };

  listUnmergedCommits = async ({
    owner,
    repo,
    headBranch,
    baseBranch,
  }: {
    owner: string;
    repo: string;
    baseBranch: string;
    headBranch: string;
  }) => {
    return this.octokit
      .request("GET /repos/{owner}/{repo}/compare/{base}...{head}", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        owner,
        repo,
        base: baseBranch,
        head: headBranch,
      })
      .then((response) => response.data);
  };

  listPullRequests = async (input: {
    owner: string;
    repo: string;
    baseBranch?: string;
    headBranch?: string;
    state?: "all" | "open" | "closed";
  }) => {
    const { owner, repo, baseBranch, headBranch, state } = input;
    return this.octokit
      .request("GET /repos/{owner}/{repo}/pulls", {
        owner,
        repo,
        base: baseBranch,
        head: headBranch,
        state,
      })
      .then((response) => response.data);
  };

  createPullRequest = async ({
    owner,
    repo,
    title,
    sourceBranch,
    targetBranch,
    body,
  }: {
    owner: string;
    repo: string;
    sourceBranch: string;
    targetBranch: string;
    title: string;
    body: string;
  }) => {
    return this.octokit.request("POST /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      title,
      head: sourceBranch,
      base: targetBranch,
      body,
    });
  };
}

function accountToOwner(
  data: {
    id: number;
    login: string;
    avatar_url: string;
    events_url: string;
    node_id: string;
    repos_url: string;
    url: string;
    bio?: string | null;
    description?: string | null;
  },
  type?: "user" | "organization"
) {
  return {
    id: data.id,
    type,
    avatar_url: data.avatar_url,
    description: (data?.bio || data?.description) ?? undefined,
    events_url: data.events_url,
    login: data.login,
    node_id: data.node_id,
    repos_url: data.repos_url,
    url: data.url,
  };
}
