/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Cookie from "js-cookie";
import { useEffect, useState } from "react";
import { Login } from "./login";
import { MainContent } from "./content";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  configs: any;
  saveSettingsAction: (data: any) => void;
}

export function MainTemplate(props: Props) {
  const { configs, saveSettingsAction } = props;
  const router = useRouter();

  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{
    name: string;
    avatar: string;
    login: string;
  } | null>(null);

  const handleLogout = () => {
    setUser(null);
    setToken("");
    Cookie.remove("gitHub.pr.generator.user");
    Cookie.remove("gitHub.pr.generator.token");
    router.replace("/");
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const userCookie = Cookie.get("gitHub.pr.generator.user");
      const tokenCookie = Cookie.get("gitHub.pr.generator.token");
      const user = userCookie ? JSON.parse(userCookie) : null;
      setUser(user);
      setToken(tokenCookie || "");
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 size={60} className="animate-spin" />
      </div>
    );
  }

  if (!user || !token) {
    return (
      <Login
        configs={configs}
        onLogin={({ user, token }) => {
          setUser(user);
          setToken(token);
          setIsLoading(false);
          router.replace("/");
        }}
      />
    );
  }

  return (
    <MainContent
      auth={{ user, token }}
      configs={configs}
      onLogout={handleLogout}
      saveSettingsAction={saveSettingsAction}
    />
  );
}
