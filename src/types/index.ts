export type AIConfigs = {
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;
  githubClientId: string;
};

export type UserAuth = {
  token: string;
  user: {
    name: string;
    avatar: string;
    login: string;
  };
};

export type Commit = {
  id: string;
  sha: string;
  author: string;
  date: string;
  message: string;
};

export type PullRequestContent = {
  title: string;
  description: string;
};

export type Owner = {
  id: number;
  login: string;
  avatar_url: string;
  type?: "user" | "organization";
};

export type Repository = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
};

export type Message = {
  type: "success" | "error";
  content: string;
  scope?: string;
};
