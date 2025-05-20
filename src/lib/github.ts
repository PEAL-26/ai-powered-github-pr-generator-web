import { Octokit } from "octokit";
import { GITHUB_API } from "@/constants/constants";

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

  listAllOwners = async () => {
    const [organizations, user] = await Promise.all([
      this.octokit.request("GET /user/orgs").then((response) => response.data),
      this.octokit.request("GET /user").then((response) => response.data),
    ]);

    const owners = [
      accountToOwner(user, "user"),
      ...organizations.map((data) => accountToOwner(data, "organization")),
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
    return fetch(`${this.apiUrl}/repos/${owner}/${repo}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
  };

  getBranches = async ({ owner, repo }: { owner: string; repo: string }) => {
    return fetch(`${this.apiUrl}/repos/${owner}/${repo}/branches`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
  };

  getHeadBranch = async ({ owner, repo }: { owner: string; repo: string }) => {
    return fetch(`${this.apiUrl}/repos/${owner}/${repo}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
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
    return fetch(
      `${this.apiUrl}/repos/${owner}/${repo}/commits?sha=${branch}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
      }
    ).then((response) => response.json());
  };

  getUnmergedCommits = async ({
    owner,
    repo,
    sourceBranch,
    targetBranch,
  }: {
    owner: string;
    repo: string;
    sourceBranch: string;
    targetBranch: string;
  }) => {
    return fetch(
      `${this.apiUrl}/repos/${owner}/${repo}/compare/${targetBranch}...${sourceBranch}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
      }
    ).then((response) => response.json());
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
    return fetch(`${this.apiUrl}/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        head: sourceBranch,
        base: targetBranch,
        body,
      }),
    });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function accountToOwner(data: any, type?: "user" | "organization") {
  return {
    id: data.id,
    type,
    avatar_url: data.avatar_url,
    description: data?.bio || data?.description,
    events_url: data.events_url,
    login: data.login,
    node_id: data.node_id,
    repos_url: data.repos_url,
    url: data.url,
  };
}
