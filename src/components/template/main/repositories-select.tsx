import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  Command,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  ChevronsUpDownIcon,
  GithubIcon,
  Loader2Icon,
  LockIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Github } from "@/lib/github";

export type Repository = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
};

export type Owner = {
  id: number;
  login: string;
  avatar_url: string;
  type?: "user" | "organization";
};

export type Message = {
  type: "success" | "error";
  content: string;
  scope?: string;
};

interface Props {
  auth: {
    token: string;
    user: { name: string; avatar: string; login: string };
  };
  disabled?: boolean;
  onRepositoryChange?(repository: Repository): void;
}

export function RepositoriesSelect(props: Props) {
  const { onRepositoryChange, auth, disabled } = props;

  const { github } = useMemo(() => {
    const github = new Github(auth.token);
    return { github };
  }, [auth]);

  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useState("");

  const [currentRepository, setCurrentRepository] = useState<
    Repository | undefined
  >();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoadingRepositories, SetIsLoadingRepositories] = useState(false);

  const [currentOwner, setCurrentOwner] = useState<Owner | undefined>();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);

  const [message, setMessage] = useState<Message | undefined>();

  const listRepositories = async (owner?: Owner) => {
    try {
      if (disabled) return;
      if (!owner) return;
      if (isLoadingRepositories) return;

      setMessage(undefined);
      SetIsLoadingRepositories(true);
      setFilter("");

      const response = await github.listRepositories({
        owner: owner.login,
        ownerType: owner.type,
      });

      setRepositories(
        response.map((data) => ({
          id: data.id,
          name: data.name,
          fullName: data.full_name,
          private: data.private,
        }))
      );
    } catch (error) {
      setMessage({
        type: "error",
        scope: "list_repositories",
        content: "Error listing repositories.",
      });
      console.error(error);
    } finally {
      SetIsLoadingRepositories(false);
    }
  };

  const listOwners = useCallback(async () => {
    try {
      if (disabled) return;
      if (isLoadingOwners) return;

      setMessage(undefined);
      setIsLoadingOwners(true);
      setRepositories([]);
      const response = await github.listAllOwners();
      setOwners(response);
    } catch (error) {
      setMessage({
        type: "error",
        scope: "list_owners",
        content: "Error listing owners.",
      });
      console.error(error);
    } finally {
      setIsLoadingOwners(false);
    }
  }, [disabled, github, isLoadingOwners]);

  const handleSelectOwner = (owner: Owner) => {
    if (currentOwner?.id === owner.id) return;
    setCurrentOwner(owner);
    listRepositories(owner);
  };

  const handleSelectRepository = (repository: Repository) => {
    setCurrentRepository(repository);
    onRepositoryChange?.(repository);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    listOwners();
    listRepositories(currentOwner);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, github]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        role="combobox"
        disabled={disabled}
        className={cn(
          "w-full justify-between",
          !currentRepository && "text-muted-foreground"
          //   className
        )}
      >
        <div className="flex items-center gap-2">
          <GithubIcon />
          {currentRepository
            ? currentRepository?.fullName
            : "Select a repository"}
        </div>
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      <CommandDialog modal open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={filter}
            onValueChange={setFilter}
          />
          <CommandList>
            <div className="grid grid-cols-3">
              {/* Owners */}
              <div>
                {isLoadingOwners &&
                  (message?.type !== "error"
                    ? true
                    : message?.scope === "list_owners"
                    ? false
                    : true) && (
                    <CommandLoading className="flex justify-center py-6">
                      <Loader2Icon className="size-4 animate-spin" />
                    </CommandLoading>
                  )}
                {!isLoadingOwners &&
                  message?.type === "error" &&
                  message?.scope === "list_owners" && (
                    <CommandEmpty className="flex flex-col justify-center items-center py-4 gap-2">
                      {message.content}
                      <Button
                        className="bg-transparent hover:cursor-pointer w-fit h-fit"
                        variant="secondary"
                        onClick={listOwners}
                      >
                        <RefreshCwIcon
                          size={20}
                          className={cn("", isLoadingOwners && "animate-spin")}
                        />
                      </Button>
                    </CommandEmpty>
                  )}
                {!isLoadingOwners &&
                  (message?.type !== "error"
                    ? true
                    : message?.scope === "list_owners"
                    ? false
                    : true) &&
                  owners.length === 0 && (
                    <CommandEmpty>No owners found.</CommandEmpty>
                  )}
                {!isLoadingOwners &&
                  (message?.type !== "error"
                    ? true
                    : message?.scope === "list_owners"
                    ? false
                    : true) &&
                  owners.length > 0 && (
                    <CommandGroup heading="Owners">
                      {owners.map((owner, index) => (
                        <CommandItem
                          key={owner.id}
                          value={owner.login}
                          className={cn(
                            "",
                            index > 0 && "mt-1",
                            currentOwner?.id === owner.id && "bg-accent"
                          )}
                          onSelect={() => handleSelectOwner(owner)}
                        >
                          <Avatar className="size-6">
                            <AvatarImage
                              src={owner.avatar_url}
                              alt={owner.login}
                              className="size-6"
                            />
                            <AvatarFallback>
                              {owner.login.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          {owner.login}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
              </div>

              {/* Repositories */}
              <div className="col-span-2 flex">
                <div className="h-full w-[1px] bg-accent" />
                {currentOwner ? (
                  <>
                    {isLoadingRepositories &&
                      (message?.type !== "error"
                        ? true
                        : message?.scope === "list_repositories"
                        ? false
                        : true) && (
                        <CommandLoading className="flex justify-center items-center w-full h-full py-6">
                          <Loader2Icon className="size-4 animate-spin" />
                        </CommandLoading>
                      )}
                    {!isLoadingRepositories &&
                      message?.type === "error" &&
                      message?.scope === "list_repositories" && (
                        <div className="flex flex-col justify-center items-center py-4 gap-2 w-full h-full">
                          {message?.content}
                          <Button
                            className="bg-transparent hover:cursor-pointer w-fit h-fit"
                            variant="secondary"
                            onClick={() => listRepositories(currentOwner)}
                          >
                            <RefreshCwIcon
                              size={20}
                              className={cn(
                                "",
                                isLoadingRepositories && "animate-spin"
                              )}
                            />
                          </Button>
                        </div>
                      )}
                    {!isLoadingRepositories &&
                      (message?.type !== "error"
                        ? true
                        : message?.scope === "list_repositories"
                        ? false
                        : true) &&
                      repositories.filter(
                        (repo) =>
                          repo.fullName
                            .toLowerCase()
                            .includes(filter.toLowerCase().trim()) ||
                          repo.name
                            .toLowerCase()
                            .includes(filter.toLowerCase().trim())
                      ).length === 0 && (
                        <div className="flex w-full h-full justify-center items-center">
                          No repositories found.
                        </div>
                      )}
                    {!isLoadingRepositories &&
                      (message?.type !== "error"
                        ? true
                        : message?.scope === "list_repositories"
                        ? false
                        : true) &&
                      repositories.filter(
                        (repo) =>
                          repo.fullName
                            .toLowerCase()
                            .includes(filter.toLowerCase().trim()) ||
                          repo.name
                            .toLowerCase()
                            .includes(filter.toLowerCase().trim())
                      ).length > 0 && (
                        <CommandGroup
                          heading="Repositories"
                          className="max-h-[300px] overflow-y-auto w-full"
                        >
                          {repositories
                            .filter(
                              (repo) =>
                                repo.fullName
                                  .toLowerCase()
                                  .includes(filter.toLowerCase().trim()) ||
                                repo.name
                                  .toLowerCase()
                                  .includes(filter.toLowerCase().trim())
                            )
                            .map((repository, index) => (
                              <CommandItem
                                key={repository.id}
                                value={repository.fullName}
                                className={cn(
                                  "",
                                  index > 0 && "mt-1",
                                  currentRepository?.id === repository.id &&
                                    "bg-accent"
                                )}
                                onSelect={() =>
                                  handleSelectRepository(repository)
                                }
                              >
                                <GithubIcon />
                                {repository.name}
                                {repository.private && <LockIcon />}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      )}
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <span>No owner selected</span>
                  </div>
                )}
              </div>
            </div>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
