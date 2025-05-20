import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

async function sleep(time = 3000) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

async function getPRDescriptionFromAI(commits: string[], maxRetries = 3) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false,
        //args: ["--no-sandbox"],
      });

      const page = await browser.newPage();
      await page.setJavaScriptEnabled(true);

      // Tente diferentes serviços em falhas consecutivas
      const services = [
        {
          url: "https://chat.deepseek.com/",
          outputSelector: ".message-content",
          inputSelector: "#chat-input",
        },
        {
          url: "https://poe.com/",
          outputSelector: ".ChatMessageContent_text__",
          inputSelector: "textarea",
        },
        // { url: "https://www.phind.com/", outputSelector: ".answer" , inputSelector: ""},
        {
          url: "https://chatgpt.com/",
          outputSelector: "textarea",
          inputSelector: "textarea",
        },
      ];

      const service = services[retries % services.length];

      await page.goto(service.url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await sleep(2000 + Math.random() * 3000);

      const prompt = `Você é um assistente especializado em desenvolvimento de software e boas práticas de Git.
      Vou fornecer uma lista de mensagens de commit e quero que você gere:
      
      1. Um título claro e conciso para o pull request (máximo de 72 caracteres)
      2. Uma descrição detalhada que:
         - Explique o propósito geral das mudanças
         - Destaque as alterações mais importantes
         - Inclua quaisquer observações relevantes para os revisores
         - Formate a descrição em Markdown
      
      As mensagens de commit são:
      ${commits.join("\n")}
      
      Retorne a resposta em formato JSON com a seguinte estrutura:
      {
        "title": "Título do PR aqui",
        "description": "Descrição detalhada aqui\\n- Com\\n- Markdown\\n- Formatado"
      }
      
      O título deve ser em inglês (se possível) e seguir o padrão convencional commit (ex: "feat: add new authentication module").
      A descrição pode ser em português se preferir.`;

      console.log(service);

      const filled = await page
      .waitForFunction(
        ({prompt, selector}) => {
          const input = document.querySelector(selector) as any;
          input.value = prompt;
          return input?.value.length === prompt.length;
        },
        {},
        {prompt, selector:service.inputSelector}
      )
      .then((response) => response.jsonValue());

      await page.type(service.inputSelector, prompt);

      return;

      await sleep(1000);
      await page.keyboard.press("Enter");

      await page.waitForSelector(service.outputSelector, { timeout: 60000 });
      await sleep(5000);

      const response = await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        return elements[elements.length - 1]?.textContent || "";
      }, service.outputSelector);

      // Processamento da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      console.log();

      return { title: "teste", description: "" };
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        title: "PR: Multiple changes",
        description: response,
      };
    } catch (error) {
      lastError = error;
      console.warn(`Tentativa ${retries + 1} falhou:`, error.message);
    } finally {
      if (browser) await browser.close();
      retries++;
      if (retries < maxRetries) await new Promise((r) => setTimeout(r, 5000));
    }
  }

  throw lastError || new Error("Todas as tentativas falharam");
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const { commits } = await req.json();
    if (!commits || commits?.length === 0) {
      return NextResponse.json(
        {
          message: "Commits cannot be empty",
        },
        { status: 400 }
      );
    }

    const result = getPRDescriptionFromAI(commits);

    return NextResponse.json(
      { title: "Titulo", description: "Descrição" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("AI error:", error);
    return NextResponse.json(
      {
        message: "Error scraping AI",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
