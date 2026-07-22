import { useMemo, useState } from "react";
import { AuthPage } from "../../pages/AuthPage";
import { navigateToPath } from "../../constants/routes";
import { CONCIERGE_ROUTES, conciergePathForRoute } from "../../constants/conciergeRoutes";
import type { AuthMeta, AuthMode, UserProfile } from "../../types";
import { ConciergeShell } from "./ConciergeShell";
import {
  getRememberedConciergeUsername,
  setRememberedConciergeUsername
} from "../../utils/conciergeRemember";
import { markWorkspaceAvailable, resolveSwitchPath, selectWorkspace, appendPassportAuditEvent, bindPassportIdentity } from "../../passport";
import type { Theme } from "../../types";

export type ConciergeAuthView =
  | "login"
  | "signup"
  | "forgotPin"
  | "forgotUsername"
  | "verifyEmail";

type ConciergeAuthPageProps = {
  view: ConciergeAuthView;
  theme: Theme;
  onToggleTheme: () => void;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void | Promise<void>;
  message?: string;
  onMessage: (msg: string) => void;
};

const VIEW_COPY: Record<ConciergeAuthView, { title: string; lede: string; mode: AuthMode }> = {
  login: {
    title: "Welcome back",
    lede: "Sign in to your Signal Concierge™ client account. Username and PIN only — not Discover login.",
    mode: "login"
  },
  signup: {
    title: "Become a Concierge client",
    lede: "Create private client access to begin your Concierge application. This is not a standard BamSignal Discover signup.",
    mode: "signup"
  },
  forgotPin: {
    title: "Reset your PIN",
    lede: "Recover your Concierge client PIN securely. We never ask for a password.",
    mode: "reset"
  },
  forgotUsername: {
    title: "Forgot username?",
    lede: "Verify ownership with the email or phone on your account, then we reveal your username.",
    mode: "forgot-username"
  },
  verifyEmail: {
    title: "Verify your email",
    lede: "Confirm your email to continue Concierge onboarding.",
    mode: "verify"
  }
};

function pathForAuthMode(mode: AuthMode): string {
  if (mode === "signup") return conciergePathForRoute("signup");
  if (mode === "reset") return conciergePathForRoute("forgotPin");
  if (mode === "forgot-username") return conciergePathForRoute("forgotUsername");
  if (mode === "verify") return conciergePathForRoute("verifyEmail");
  return conciergePathForRoute("login");
}

/**
 * Dedicated Concierge auth chrome. Reuses AuthPage + backend APIs without changing member /love routes.
 */
export function ConciergeAuthPage({
  view,
  theme,
  onToggleTheme,
  onAuthenticated,
  message,
  onMessage
}: ConciergeAuthPageProps) {
  const copy = VIEW_COPY[view];
  const [mode, setMode] = useState<AuthMode>(copy.mode);
  const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedConciergeUsername()));
  const headings = useMemo(() => copy, [copy]);

  return (
    <ConciergeShell theme={theme} onToggleTheme={onToggleTheme}>
      <section className="sc-client-auth concierge-auth" aria-labelledby="concierge-auth-title">
        <div className="sc-client-auth__panel signal-concierge-glass">
          <p className="sc-section__eyebrow">Signal Concierge™</p>
          <h1 id="concierge-auth-title" className="sc-client-auth__title">
            {headings.title}
          </h1>
          <p className="sc-client-auth__lede">{headings.lede}</p>

          {view === "login" ? (
            <label className="concierge-auth__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me on this device</span>
            </label>
          ) : null}

          <AuthPage
            mode={mode}
            onModeChange={(next) => {
              setMode(next);
              navigateToPath(pathForAuthMode(next));
            }}
            onAuthenticated={async (profile, meta) => {
              bindPassportIdentity({
                username: profile.username,
                email: profile.email,
                phone: profile.phone,
                emailVerified: Boolean(profile.email),
                phoneVerified: Boolean(profile.phoneVerified),
                productId: "bamsignal"
              });
              markWorkspaceAvailable("concierge");
              selectWorkspace("concierge", { setPreferred: true });
              appendPassportAuditEvent({
                category: "authentication",
                action: meta?.isNewSignup ? "auth.concierge.signup" : "auth.concierge.login",
                workspaceId: "concierge",
                personaId: "premium-concierge"
              });
              if (rememberMe && profile.username) {
                setRememberedConciergeUsername(profile.username);
              } else if (!rememberMe) {
                setRememberedConciergeUsername(null);
              }
              await onAuthenticated(profile, meta);
              // New Concierge clients go to onboarding; returning clients to dashboard.
              if (meta?.isNewSignup) {
                navigateToPath(CONCIERGE_ROUTES.onboarding, true);
              } else {
                navigateToPath(resolveSwitchPath("concierge"), true);
              }
            }}
            message={message}
            onMessage={onMessage}
            embedded
            onLogoClick={() => navigateToPath(CONCIERGE_ROUTES.landing)}
          />

          <nav className="sc-client-auth__nav" aria-label="Concierge account links">
            {view !== "login" ? (
              <button
                type="button"
                className="signal-concierge-header__link"
                onClick={() => navigateToPath(CONCIERGE_ROUTES.login)}
              >
                Sign In
              </button>
            ) : null}
            {view !== "signup" ? (
              <button
                type="button"
                className="signal-concierge-header__link"
                onClick={() => navigateToPath(CONCIERGE_ROUTES.signup)}
              >
                Become a Concierge
              </button>
            ) : null}
            {view !== "forgotPin" ? (
              <button
                type="button"
                className="signal-concierge-header__link"
                onClick={() => navigateToPath(CONCIERGE_ROUTES.forgotPin)}
              >
                Forgot PIN
              </button>
            ) : null}
            {view !== "forgotUsername" ? (
              <button
                type="button"
                className="signal-concierge-header__link"
                onClick={() => navigateToPath(CONCIERGE_ROUTES.forgotUsername)}
              >
                Forgot username
              </button>
            ) : null}
          </nav>
        </div>
      </section>
    </ConciergeShell>
  );
}
