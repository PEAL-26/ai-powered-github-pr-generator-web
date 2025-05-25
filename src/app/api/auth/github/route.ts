import { appConfigs } from "@/configs/app";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }

  const { githubClientId, githubClientSecret, githubRedirectUrl } =
    appConfigs();
    
  const githubAccessTokenParams = [
    `client_id=${githubClientId}`,
    `client_secret=${githubClientSecret}`,
    `redirect_uri=${githubRedirectUrl}`,
  ];

  try {
    const { code } = await req.json();
    const response = await fetch(
      `https://github.com/login/oauth/access_token?code=${code}&${githubAccessTokenParams.join(
        "&"
      )}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    ).then((response) => response.json());
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.json(
      {
        message: "Error authenticating with GitHub",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
