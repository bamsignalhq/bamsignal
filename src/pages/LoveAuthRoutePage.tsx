import { useEffect, useState } from "react";
import { AuthPage } from "./AuthPage";
import type { AuthMeta, AuthMode, UserProfile } from "../types";
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_PATH,
  navigateToPath,
  type AuthPath
} from "../constants/routes";

type LoveAuthRoutePageProps = {
  path: AuthPath;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void;
  message?: string;
  onMessage: (msg: string) => void;
};

export function LoveAuthRoutePage({
  path,
  onAuthenticated,
  message,
  onMessage
}: LoveAuthRoutePageProps) {
  const pathMode: AuthMode = path === AUTH_SIGNUP_PATH ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(pathMode);

  useEffect(() => {
    if (mode === "verify" || mode === "reset") return;
    setMode(pathMode);
  }, [pathMode, mode]);

  return (
    <AuthPage
      mode={mode}
      onModeChange={(next) => {
        if (next === "verify" || next === "reset") {
          setMode(next);
          return;
        }
        navigateToPath(next === "signup" ? AUTH_SIGNUP_PATH : AUTH_LOGIN_PATH);
        setMode(next);
      }}
      onAuthenticated={onAuthenticated}
      message={message}
      onMessage={onMessage}
    />
  );
}
