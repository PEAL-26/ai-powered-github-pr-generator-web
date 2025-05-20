import { COOKIES } from "@/constants/constants";
import { encryptData } from "@/helpers/encryption";
import { cookies as cookiesNext } from "next/headers";

interface SettingsData {
  aiApiKey?: string;
  aiApiUrl?: string;
  aiModel?: string;
}

export async function saveSettingsAction(data: SettingsData) {
  "use server";
  const { aiApiKey, aiApiUrl, aiModel } = data;
  const cookies = await cookiesNext();

  if (aiApiKey !== undefined) {
    cookies.set(
      COOKIES.SETTINGS_AI_API_KEY,
      aiApiKey ? encryptData(aiApiKey) : "",
      {
        secure: true,
      }
    );
  }
  if (aiApiUrl !== undefined) {
    cookies.set(COOKIES.SETTINGS_AI_API_URL, aiApiUrl || "", { secure: true });
  }

  if (aiModel !== undefined) {
    cookies.set(COOKIES.SETTINGS_AI_MODEL, aiModel || "", { secure: true });
  }
}
