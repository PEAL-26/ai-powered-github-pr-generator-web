import OpenAI, { ClientOptions } from "openai";
import { RequestOptions } from "openai/core.mjs";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources.mjs";

export class AI {
  private ai: OpenAI;
  constructor(options?: ClientOptions) {
    this.ai = new OpenAI(options);
  }

  chat = async (content: string) => {
    return fetch(`${this.ai.baseURL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.ai.baseURL}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content }],
        stream: false,
      }),
    }).then((response) => response.json());
  };

  chatCompletionsCreate(
    body: ChatCompletionCreateParamsNonStreaming,
    options?: RequestOptions
  ) {
    return this.ai.chat.completions.create(body, options);
  }
}
