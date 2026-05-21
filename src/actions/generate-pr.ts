"use server";

import { AI } from "@/lib/ai";
import { appConfigs } from "@/configs/app";
import { cookies as cookiesNext } from "next/headers";

export async function generatePullRequestAction(commitMessages: string[]) {
  if (commitMessages.length === 0) {
    throw new Error("No commit messages provided");
  }

  const cookies = await cookiesNext();
  const configs = appConfigs(cookies);

  const ai = new AI({
    baseURL: configs.aiApiUrl,
    apiKey: configs.aiApiKey,
    model: configs.aiModel,
  });

  const prompt = `Você é um assistente especializado em desenvolvimento de software e boas práticas de Git.
Vou fornecer uma lista de mensagens de commit e quero que você gere um Título e uma Descrição para um Pull Request.

REGRAS PARA O TÍTULO:
- Deve ser em INGLÊS.
- Deve seguir o padrão Conventional Commits (ex: "feat: add user authentication", "fix: resolve memory leak").
- Máximo de 72 caracteres.

REGRAS PARA A DESCRIÇÃO:
- Deve ser em PORTUGUÊS.
- Use Markdown para formatação.
- Inclua uma visão geral das mudanças.
- Use uma lista com bullets para destacar as alterações técnicas mais importantes.
- Se houver mudanças na UI, adicione uma seção "Mudanças na Interface".

MENSAGENS DE COMMIT:
${commitMessages.join("\n")}

Retorne a resposta ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "title": "Título aqui",
  "description": "Descrição formatada em Markdown aqui"
}

IMPORTANTE: Retorne APENAS o objeto JSON. Não inclua blocos de código (\`\`\`json), comentários ou qualquer outro texto.`;

  try {
    const response = await ai.createCompletions({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content || "";
    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const dataJSON: { title: string; description: string } = JSON.parse(jsonMatch[0]);
    return dataJSON;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate PR content");
  }
}
