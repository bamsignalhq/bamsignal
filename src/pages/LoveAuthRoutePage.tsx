import { useEffect, useRef, useState } from "react";
import { AuthPage } from "./AuthPage";
import { RelationshipJourneyPage } from "./RelationshipJourneyPage";
import { JourneySecureReady } from "../components/journey/secure/JourneySecureReady";
import type { AuthMeta, AuthMode, UserProfile } from "../types";
import type { JourneyDraft } from "../types/journey";
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_PATH,
  navigateToPath,
  type AuthPath
} from "../constants/routes";
import { hasRestorableSignupVerify } from "../utils/signupPersistence";
import { readJourneyDraft } from "../utils/journeyDraft";

type LoveAuthRoutePageProps = {
  path: AuthPath;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void;
  message?: string;
  onMessage: (msg: string) => void;
};

/** Local-only modes that must not rewrite the URL or bounce through Home. */
const LOCAL_AUTH_MODES: ReadonlySet<AuthMode> = new Set([
  "verify",
  "reset",
  "existing",
  "forgot-username"
]);

type AuthPhase = "journey" | "ready" | "auth";

const READY_HANDOFF_MS = 720;

function initialPhase(path: AuthPath): AuthPhase {
  if (path !== AUTH_SIGNUP_PATH) return "auth";
  if (hasRestorableSignupVerify()) return "auth";
  return "journey";
}

function initialAuthMode(path: AuthPath): AuthMode {
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
  const [phase, setPhase] = useState<AuthPhase>(() => initialPhase(path));
  const [mode, setMode] = useState<AuthMode>(() => initialAuthMode(path));
  const [journeyHandoff, setJourneyHandoff] = useState<JourneyDraft | null>(() => readJourneyDraft());
  const readyTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (readyTimer.current != null) {
        window.clearTimeout(readyTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (LOCAL_AUTH_MODES.has(mode)) return;
    if (pathMode === "signup" && hasRestorableSignupVerify()) {
      setPhase("auth");
      setMode("verify");
      return;
    }
    if (pathMode === "login") {
      setPhase("auth");
      setMode("login");
      return;
    }
    if (pathMode === "signup" && phase === "auth") {
      setMode("signup");
    }
  }, [pathMode, mode, phase]);

  if (phase === "journey" && pathMode === "signup") {
    return (
      <RelationshipJourneyPage
        onYouChapterComplete={(draft) => {
          setJourneyHandoff(draft);
          setPhase("ready");
          if (readyTimer.current != null) {
            window.clearTimeout(readyTimer.current);
          }
          readyTimer.current = window.setTimeout(() => {
            readyTimer.current = null;
            setPhase("auth");
            setMode("signup");
          }, READY_HANDOFF_MS);
        }}
        onLogin={() => {
          navigateToPath(AUTH_LOGIN_PATH);
          setPhase("auth");
          setMode("login");
        }}
      />
    );
  }

  if (phase === "ready") {
    return <JourneySecureReady firstName={journeyHandoff?.name} />;
  }

  return (
    <AuthPage
      mode={mode}
      journeyHandoff={journeyHandoff}
      useJourneyShell
      onJourneyBack={() => {
        if (readyTimer.current != null) {
          window.clearTimeout(readyTimer.current);
          readyTimer.current = null;
        }
        setPhase("journey");
        setMode("signup");
      }}
      onModeChange={(next) => {
        if (LOCAL_AUTH_MODES.has(next)) {
          setMode(next);
          return;
        }
        if (next === "signup" && !hasRestorableSignupVerify()) {
          setPhase("journey");
          navigateToPath(AUTH_SIGNUP_PATH);
          setMode("signup");
          return;
        }
        navigateToPath(next === "signup" ? AUTH_SIGNUP_PATH : AUTH_LOGIN_PATH);
        setPhase("auth");
        setMode(next);
      }}
      onAuthenticated={onAuthenticated}
      message={message}
      onMessage={onMessage}
      onLogoClick={() => {
        navigateToPath(AUTH_LOGIN_PATH);
        setPhase("auth");
        setMode("login");
      }}
    />
  );
}
