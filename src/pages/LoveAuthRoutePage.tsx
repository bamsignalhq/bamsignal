import { useEffect, useState } from "react";
import { AuthPage } from "./AuthPage";
import type { AuthMeta, AuthMode, UserProfile } from "../types";
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_PATH,
  navigateToPath,
  type AuthPath
} from "../constants/routes";
import { hasRestorableSignupVerify } from "../utils/signupPersistence";

type LoveAuthRoutePageProps = {
  path: AuthPath;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void;
  message?: string;
  onMessage: (msg: string) => void;
};

/** Local-only modes that must not rewrite the URL or bounce through Home. */
const LOCAL_AUTH_MODES: ReadonlySet<AuthMode> = new Set(["verify", "reset", "existing"]);

function initialAuthMode(path: AuthPath): AuthMode {
  // Never hijack /love/login into Verify — that created the registration trap loop.
  if (path === AUTH_SIGNUP_PATH && hasRestorableSignupVerify()) return "verify";
  return path === AUTH_SIGNUP_PATH ? "signup" : "login";
}

export function LoveAuthRoutePage({
  path,
  onAuthenticated,
  message,
  onMessage
}: LoveAuthRoutePageProps) {
  const pathMode: AuthMode = path === AUTH_SIGNUP_PATH ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(() => initialAuthMode(path));

  useEffect(() => {
    if (LOCAL_AUTH_MODES.has(mode)) return;
    // Restore in-progress email verify only from the signup route — never from login.
    if (pathMode === "signup" && hasRestorableSignupVerify()) {
      setMode("verify");
      return;
    }
    setMode(pathMode);
  }, [pathMode, mode]);

  return (
    <AuthPage
      mode={mode}
      onModeChange={(next) => {
        if (LOCAL_AUTH_MODES.has(next)) {
          setMode(next);
          return;
        }
        navigateToPath(next === "signup" ? AUTH_SIGNUP_PATH : AUTH_LOGIN_PATH);
        setMode(next);
      }}
      onAuthenticated={onAuthenticated}
      message={message}
      onMessage={onMessage}
      onLogoClick={() => {
        // Auth logo must return to the auth landing — never the public homepage.
        navigateToPath(AUTH_LOGIN_PATH);
        setMode("login");
      }}
    />
  );
}
