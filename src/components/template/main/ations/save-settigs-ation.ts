import { COOKIES } from "@/constants/constants";
import { cookies as cookiesNext } from "next/headers";

export async function saveSettingsAction(data: any) {
  const { aiApiKey, aiApiUrl } = data;
  const cookies = await cookiesNext();
  cookies.set(COOKIES.SETTINGS_AI_API_KEY, aiApiKey, { secure: true });
  cookies.set(COOKIES.SETTINGS_AI_API_URL, aiApiUrl, { secure: true });
}
