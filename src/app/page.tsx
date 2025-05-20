import { MainTemplate } from "@/components/template/main";
import { appConfigs } from "@/configs/app";
import { cookies as cookiesNext } from "next/headers";

export default async function Home() {
  const cookies = await cookiesNext();
  const configs = appConfigs(cookies);

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        AI-Powered GitHub PR Generator
      </h1>

      <MainTemplate configs={configs} />
    </main>
  );
}
