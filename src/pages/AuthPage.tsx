import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppLogo } from "../components/AppLogo";
import type { AuthMeta, AuthMode, UserProfile } from "../types";
import { DEMO_USER, matchDemoUser, seedDemoMemberProfile } from "../constants/demoAccounts";
import { friendlyAuthError, supabase } from "../services/supabase";
import { trackEvent } from "../utils/analytics";
import {
  emailForUsername,
  isStrongPin,
  isValidNigerianPhone,
  isValidPin,
  isValidUsername,
  normalizeNigerianPhone,
  normalizeUsername,
  rememberUsernameEmail,
  profileFromSessionUser
} from "../utils/authIdentity";

type AuthPageProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void;
  message?: string;
  onMessage: (msg: string) => void;
  embedded?: boolean;
};

const emptySignup = {
  name: "",
  username: "",
  phone: "",
  email: "",
  pin: "",
  confirmPin: ""
};

export function AuthPage({
  mode,
  onModeChange,
  onAuthenticated,
  message,
  onMessage,
  embedded
}: AuthPageProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", pin: "" });
  const [signupForm, setSignupForm] = useState(emptySignup);
  const [verifyCode, setVerifyCode] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [pendingSignup, setPendingSignup] = useState<UserProfile | null>(null);

  const phoneDigits = (value: string) => normalizeNigerianPhone(value);
  const pinDigits = (value: string) => value.replace(/\D/g, "").slice(0, 6);

  const signIn = async () => {
    const username = normalizeUsername(loginForm.username);
    if (!isValidUsername(username)) {
      onMessage("Enter a valid username.");
      return;
    }
    if (!isValidPin(loginForm.pin)) {
      onMessage("Enter your PIN.");
      return;
    }

    setBusy("login");
    onMessage("");
    try {
      if (matchDemoUser(username, loginForm.pin)) {
        rememberUsernameEmail(DEMO_USER.username, DEMO_USER.profile.email);
        seedDemoMemberProfile();
        onAuthenticated(DEMO_USER.profile, { isNewSignup: false });
        return;
      }

      const email = emailForUsername(username);
      if (supabase && email) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: loginForm.pin
        });
        if (error) throw error;
        onAuthenticated(profileFromSessionUser(data.user!), { isNewSignup: false });
        return;
      }

      onMessage("Account not found. Check your username and PIN.");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const signUp = async () => {
    const name = signupForm.name.trim();
    const username = normalizeUsername(signupForm.username);
    const email = signupForm.email.trim().toLowerCase();
    const phone = phoneDigits(signupForm.phone);

    if (name.length < 2) {
      onMessage("Enter your full name.");
      return;
    }
    if (!isValidUsername(username)) {
      onMessage("Username must be 3–24 characters (letters, numbers, underscore).");
      return;
    }
    if (!isValidNigerianPhone(phone)) {
      onMessage("Put your correct WhatsApp number.");
      return;
    }
    if (!email.includes("@")) {
      onMessage("Enter a valid email.");
      return;
    }
    if (!isStrongPin(signupForm.pin)) {
      onMessage("Choose a stronger PIN.");
      return;
    }
    if (signupForm.pin !== signupForm.confirmPin) {
      onMessage("PINs do not match.");
      return;
    }

    setBusy("signup");
    onMessage("");
    trackEvent("signup_started");

    const profile: UserProfile = { name, username, email, phone };

    try {
      if (supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password: signupForm.pin,
          options: {
            data: { phone, name, username }
          }
        });
        if (error) throw error;
        rememberUsernameEmail(username, email);
        setPendingSignup(profile);
        onModeChange("verify");
        return;
      }

      rememberUsernameEmail(username, email);
      onAuthenticated(profile, { isNewSignup: true });
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const verifySignup = async (code = verifyCode) => {
    if (!pendingSignup || code.length !== 6) return;
    setBusy("verify");
    onMessage("");
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: pendingSignup.email,
          token: code,
          type: "email"
        });
        if (error) throw error;
        if (data.session?.user) {
          onAuthenticated(profileFromSessionUser(data.session.user), { isNewSignup: true });
          return;
        }
      }
      onAuthenticated(pendingSignup, { isNewSignup: true });
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const sendReset = async () => {
    setBusy("reset");
    try {
      if (supabase && resetEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/love/login`
        });
        if (error) throw error;
        onMessage("Reset link sent.");
      } else {
        onMessage("Enter your email.");
      }
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className={`auth-page ${embedded ? "auth-page--embedded" : ""}`}>
      <div className="auth-shell">
        <div className="auth-shell__glow" aria-hidden />
        <div className="auth-card auth-card--fintech">
          <div className="auth-brand">
            <AppLogo size="lg" />
          </div>

          {mode === "login" && (
            <>
              <h1 className="auth-title">Login</h1>
              {import.meta.env.DEV && (
                <p className="auth-dev-hint">
                  Demo: <strong>{DEMO_USER.username}</strong> / <strong>{DEMO_USER.pin}</strong>
                </p>
              )}
              <div className="auth-fields">
                <label className="auth-field">
                  <span>Username</span>
                  <input
                    autoComplete="username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="yourname"
                  />
                </label>
                <label className="auth-field">
                  <span>PIN</span>
                  <input
                    className="auth-code-input"
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    maxLength={6}
                    value={loginForm.pin}
                    onChange={(e) => setLoginForm({ ...loginForm, pin: pinDigits(e.target.value) })}
                    placeholder="••••••"
                  />
                </label>
              </div>
              <button type="button" className="btn-primary btn-full btn-auth" onClick={signIn} disabled={busy === "login"}>
                {busy === "login" ? <Loader2 className="spin" size={20} /> : "Login"}
              </button>
              <div className="auth-links auth-links--stack">
                <button type="button" className="link-btn" onClick={() => onModeChange("reset")}>
                  Forgot PIN?
                </button>
                <button type="button" className="link-btn link-btn--accent" onClick={() => onModeChange("signup")}>
                  Create account
                </button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <>
              <h1 className="auth-title">Sign up</h1>
              <div className="auth-fields">
                <label className="auth-field">
                  <span>Full name</span>
                  <input
                    autoComplete="name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    placeholder="Ada Okonkwo"
                  />
                </label>
                <label className="auth-field">
                  <span>Username</span>
                  <input
                    autoComplete="username"
                    value={signupForm.username}
                    onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                    placeholder="ada"
                  />
                </label>
                <label className="auth-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={11}
                    value={signupForm.phone}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, phone: phoneDigits(e.target.value).slice(0, 11) })
                    }
                    placeholder="08012345678"
                  />
                </label>
                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="auth-field">
                  <span>Choose PIN</span>
                  <input
                    className="auth-code-input"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={6}
                    value={signupForm.pin}
                    onChange={(e) => setSignupForm({ ...signupForm, pin: pinDigits(e.target.value) })}
                    placeholder="••••••"
                  />
                </label>
                <label className="auth-field">
                  <span>Confirm PIN</span>
                  <input
                    className="auth-code-input"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={6}
                    value={signupForm.confirmPin}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPin: pinDigits(e.target.value) })}
                    placeholder="••••••"
                  />
                </label>
              </div>
              <button type="button" className="btn-primary btn-full btn-auth" onClick={signUp} disabled={busy === "signup"}>
                {busy === "signup" ? <Loader2 className="spin" size={20} /> : "Continue"}
              </button>
              <button type="button" className="link-btn auth-switch" onClick={() => onModeChange("login")}>
                Already have an account? Login
              </button>
            </>
          )}

          {mode === "verify" && (
            <>
              <h1 className="auth-title">Verify email</h1>
              <p className="auth-sub auth-sub--tight">
                Code sent to {pendingSignup?.email || "your email"}.
              </p>
              <label className="auth-field">
                <span>Code</span>
                <input
                  className="auth-code-input"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(pinDigits(e.target.value))}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
              </label>
              <button
                type="button"
                className="btn-primary btn-full btn-auth"
                onClick={() => verifySignup()}
                disabled={busy === "verify" || verifyCode.length !== 6}
              >
                {busy === "verify" ? <Loader2 className="spin" size={20} /> : "Verify"}
              </button>
            </>
          )}

          {mode === "reset" && (
            <>
              <h1 className="auth-title">Reset PIN</h1>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <button type="button" className="btn-primary btn-full btn-auth" onClick={sendReset} disabled={busy === "reset"}>
                {busy === "reset" ? <Loader2 className="spin" size={20} /> : "Send link"}
              </button>
              <button type="button" className="link-btn auth-switch" onClick={() => onModeChange("login")}>
                Back to login
              </button>
            </>
          )}

          {message && <p className="auth-message">{message}</p>}
        </div>
      </div>
    </main>
  );
}
