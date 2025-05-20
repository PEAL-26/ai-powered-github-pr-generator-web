"use client";

import Cookie from "js-cookie";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Github } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { COOKIES } from "@/constants/constants";

interface Props {
  configs: { githubClientId: string };
  onLogin?(props: {
    token: string;
    user: { name: string; avatar: string; login: string };
  }): void;
}

const gitHubConfigs = ({ githubClientId }: { githubClientId: string }) => {
  const githubAutorizeUrl = "https://github.com/login/oauth/authorize";
  const githubAuthorizeParams = [
    `client_id=${githubClientId}`,
    `redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URL}`,
    "scope=repo",
    "allow_signup=true",
  ];

  return { githubAutorizeUrl, githubAuthorizeParams };
};

export function Login(props: Props) {
  const { onLogin, configs } = props;
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  const { githubAuthorizeParams, githubAutorizeUrl } = gitHubConfigs(configs);

  useEffect(() => {
    (async () => {
      try {
        const code = params.get("code");
        if (code) {
          setLoading(true);
          const headers = new Headers();
          const responseToken = (await fetch(`/api/auth/github?code=${code}`, {
            method: "POST",
            body: JSON.stringify({ code }),
          }).then((response) => response.json())) as {
            access_token: string;
            scope: string;
            token_type: string;
          };

          if (!responseToken?.access_token) {
            throw responseToken;
          }

          const token = responseToken.access_token;

          headers.append("Authorization", `Bearer ${token}`);
          const responseUser = await fetch("https://api.github.com/user", {
            method: "GET",
            headers,
          }).then((response) => response.json());

          if (!responseUser?.name) {
            throw responseUser;
          }

          const user = {
            name: responseUser.name,
            avatar: responseUser.avatar_url,
            login: responseUser.login,
          };

          Cookie.set(COOKIES.TOKEN, token, {
            expires: 7,
            path: "/",
          });
          Cookie.set(COOKIES.USER, JSON.stringify(user), {
            expires: 7,
            path: "/",
          });
          onLogin?.({ token, user });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [onLogin, params]);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>GitHub Authentication</CardTitle>
        <CardDescription>
          Login with GitHub to access your repositories
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link
          onClick={() => {
            setLoading(true);
          }}
          href={`${githubAutorizeUrl}?${githubAuthorizeParams.join("&")}`}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting to GitHub
            </>
          ) : (
            <>
              <Github className="mr-2 h-5 w-5" />
              Login with GitHub
            </>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
