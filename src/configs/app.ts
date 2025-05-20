import { COOKIES } from "@/constants/constants";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export function appConfigs(cookies?: ReadonlyRequestCookies) {
  const settingsAIApiUrl = cookies?.get(COOKIES.SETTINGS_AI_API_URL);
  const settingsAIApiKey = cookies?.get(COOKIES.SETTINGS_AI_API_KEY);

  return {
    githubRedirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    aiApiUrl: settingsAIApiUrl || process.env.NEXT_PUBLIC_AI_API_URL,
    aiApiKey: settingsAIApiKey || process.env.AI_API_KEY,
  };
}
