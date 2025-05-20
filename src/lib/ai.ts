import OpenAI, { ClientOptions } from "openai";
import { RequestOptions } from "openai/core.mjs";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources.mjs";

export class AI {
  private ai: OpenAI;
  private model?: string;

  constructor(options?: ClientOptions & { model?: string }) {
    this.ai = new OpenAI(options);
    this.model = options?.model;
  }

  chat = async (content: string) => {
    return fetch(`${this.ai.baseURL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.ai.baseURL}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model || "deepseek-r1:1.5b",
        messages: [{ role: "user", content }],
        stream: false,
      }),
    }).then((response) => response.json());
  };

  chatCompletionsCreate(
    body: Omit<ChatCompletionCreateParamsNonStreaming, "model">,
    options?: RequestOptions
  ) {
    return this.ai.chat.completions.create(
      { ...body, model: this.model || "deepseek-r1:1.5b" },
      options
    );
  }
}
