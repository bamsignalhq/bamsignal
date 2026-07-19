import { useMemo, useState } from "react";
import { AuthPage } from "../AuthPage";
import { navigateToPath } from "../../constants/routes";
import { SIGNAL_CONCIERGE_ROUTES, signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import type { AuthMeta, AuthMode, UserProfile } from "../../types";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

export type ConciergeAuthView = "signIn" | "signUp" | "forgotPin" | "verifyEmail";

type SignalConciergeClientAuthPageProps = Omit<SignalConciergePageShellProps, "children"> & {
  view: ConciergeAuthView;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void | Promise<void>;
  message?: string;
  onMessage: (msg: string) => void;
};

const VIEW_COPY: Record<
  ConciergeAuthView,
  { title: string; lede: string; mode: AuthMode }
> = {
  signIn: {
    title: "Client Sign In",
    lede: "Private access for Signal Concierge™ clients. Username and PIN only.",
    mode: "login"
  },
  signUp: {
    title: "Create Client Access",
    lede: "Begin your Signal Concierge™ application with a private client account. Not a Discover dating signup.",
    mode: "signup"
  },
  forgotPin: {
    title: "Reset PIN",
    lede: "Recover your Concierge client PIN securely. We never ask for a password.",
    mode: "reset"
  },
  verifyEmail: {
    title: "Verify Email",
    lede: "Confirm your email to continue your Concierge application.",
    mode: "verify"
  }
};

export function SignalConciergeClientAuthPage({
  view,
  onAuthenticated,
  message,
  onMessage,
  ...shell
}: SignalConciergeClientAuthPageProps) {
  const copy = VIEW_COPY[view];
  const [mode, setMode] = useState<AuthMode>(copy.mode);

  const headings = useMemo(() => copy, [copy]);

  return (
    <SignalConciergePageShell {...shell}>
      <section className="sc-client-auth" aria-labelledby="sc-auth-title">
        <div className="sc-client-auth__panel signal-concierge-glass">
          <p className="sc-section__eyebrow">Signal Concierge™</p>
          <h1 id="sc-auth-title" className="sc-client-auth__title">
            {headings.title}
          </h1>
          <p className="sc-client-auth__lede">{headings.lede}</p>

          <AuthPage
            mode={mode}
            onModeChange={(next) => {
              setMode(next);
              navigateToPath(
                next === "signup"
                  ? signalConciergePathForRoute("signUp")
                  : signalConciergePathForRoute("signIn")
              );
            }}
            onAuthenticated={async (profile, meta) => {
              await onAuthenticated(profile, meta);
              navigateToPath(SIGNAL_CONCIERGE_ROUTES.dashboard, true);
            }}
            message={message}
            onMessage={onMessage}
            embedded
            onLogoClick={() => navigateToPath(SIGNAL_CONCIERGE_ROUTES.landing)}
          />

          <nav className="sc-client-auth__nav" aria-label="Concierge account links">
            {view !== "signIn" ? (
              <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(SIGNAL_CONCIERGE_ROUTES.signIn)}>
                Client Sign In
              </button>
            ) : null}
            {view !== "signUp" ? (
              <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(SIGNAL_CONCIERGE_ROUTES.signUp)}>
                Create Client Access
              </button>
            ) : null}
            {view !== "forgotPin" ? (
              <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(SIGNAL_CONCIERGE_ROUTES.forgotPin)}>
                Forgot PIN
              </button>
            ) : null}
            <button type="button" className="signal-concierge-header__link" onClick={() => navigateToPath(SIGNAL_CONCIERGE_ROUTES.apply)}>
              Apply for Signal Concierge™
            </button>
          </nav>
        </div>
      </section>
    </SignalConciergePageShell>
  );
}
