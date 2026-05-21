import { COOKIES } from "@/constants/constants";
import { decryptData } from "@/helpers/encryption";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

function getDecryptSettings(settings?: RequestCookie) {
  if (settings) {
    return decryptData(settings.value);
  }

  return null;
}

export function appConfigs(cookies?: ReadonlyRequestCookies) {
  const settingsAIApiUrl = cookies?.get(COOKIES.SETTINGS_AI_API_URL)?.value;
  const settingsAIModel = cookies?.get(COOKIES.SETTINGS_AI_MODEL)?.value;
  const settingsAIApiKey = getDecryptSettings(
    cookies?.get(COOKIES.SETTINGS_AI_API_KEY)
  );

  return {
    githubRedirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL || "",
    githubClientId: process.env.GITHUB_CLIENT_ID || "",
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    aiApiUrl:
      settingsAIApiUrl || process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:11434/api",
    aiApiKey: settingsAIApiKey || process.env.AI_API_KEY || "",
    aiModel:
      settingsAIModel ||
      process.env.NEXT_PUBLIC_AI_MODEL ||
      process.env.PUBLIC_NEXT_AI_MODEL ||
      "deepseek-r1:1.5b",
  };
}
