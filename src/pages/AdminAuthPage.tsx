import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { DEMO_ADMIN, matchDemoAdmin } from "../constants/demoAccounts";
import { HARD_AUTH_PATH, HARD_HUB_PATH, navigateToPath } from "../constants/routes";
import { friendlyAuthError, supabase } from "../services/supabase";
import { verifyAdminSession } from "../services/plans";
import {
  getHardLastRoute,
  persistHardSession,
  snapshotMemberSessionBeforeHardLogin
} from "../utils/adminSession";

type AuthMode = "login" | "forgot" | "recovery" | "change-password";

type AdminAuthPageProps = {
  onAuthed: () => void;
  onBack?: () => void;
  allowPasswordChange?: boolean;
  onPasswordChanged?: () => void;
};

export function AdminAuthPage({
  onAuthed,
  allowPasswordChange = false,
  onPasswordChanged
}: AdminAuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(allowPasswordChange ? "change-password" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase || allowPasswordChange) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
        setMessage("Choose a new password.");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [allowPasswordChange]);

  const finishAuthed = async (sessionEmail: string, accessToken?: string) => {
    await persistHardSession(sessionEmail, accessToken);
    navigateToPath(getHardLastRoute() || HARD_HUB_PATH);
    onAuthed();
  };

  const signIn = async () => {
    setBusy(true);
    setMessage("");
    try {
      await snapshotMemberSessionBeforeHardLogin();

      if (import.meta.env.DEV && matchDemoAdmin(email, password)) {
        await persistHardSession(DEMO_ADMIN.email);
        navigateToPath(getHardLastRoute() || HARD_HUB_PATH);
        onAuthed();
        return;
      }

      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (error) throw error;
        const token = data.session?.access_token;
        if (!token) {
          setMessage("Invalid credentials.");
          return;
        }
        const ok = await verifyAdminSession(token);
        if (!ok) {
          await supabase.auth.signOut();
          setMessage("This account does not have console access.");
          return;
        }
        await finishAuthed(email.trim().toLowerCase(), token);
        return;
      }

      setMessage("Invalid credentials.");
    } catch (error) {
      setMessage(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async () => {
    setBusy(true);
    setMessage("");
    try {
      if (!supabase) throw new Error("Authentication is not configured.");
      const target = email.trim().toLowerCase();
      if (!target) {
        setMessage("Enter your email.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/hard/auth`
      });
      if (error) throw error;
      setMessage("Password reset link sent. Check your inbox.");
    } catch (error) {
      setMessage(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const applyNewPassword = async () => {
    setBusy(true);
    setMessage("");
    try {
      if (!supabase) throw new Error("Authentication is not configured.");
      if (newPassword.length < 8) {
        setMessage("Use at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      if (allowPasswordChange) {
        setMessage("Password updated.");
        setNewPassword("");
        setConfirmPassword("");
        onPasswordChanged?.();
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const sessionEmail = data.session?.user?.email?.toLowerCase() || email.trim().toLowerCase();
      if (token && (await verifyAdminSession(token))) {
        await finishAuthed(sessionEmail, token);
        return;
      }
      setMode("login");
      setMessage("Password updated. Sign in with your new password.");
    } catch (error) {
      setMessage(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const loginTitle = allowPasswordChange || mode === "recovery" ? "BamSignal" : "BamSignal";
  const loginSubtitle =
    mode === "forgot"
      ? "Password reset"
      : mode === "recovery" || mode === "change-password"
        ? "Set new password"
        : "Command Center";

  return (
    <main className="auth-page hard-auth-page">
      <div className="auth-shell">
        <div className="auth-shell__glow" aria-hidden />
        <div className="auth-card auth-card--fintech hard-auth-card">
          <div className="auth-brand">
            <AppLogo size="lg" />
          </div>
          <h1 className="auth-title">{loginTitle}</h1>
          <p className="auth-sub">{loginSubtitle}</p>

          <div className="auth-fields">
            {(mode === "login" || mode === "forgot") && (
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}

            {mode === "login" && (
              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}

            {(mode === "recovery" || mode === "change-password") && (
              <>
                <label className="auth-field">
                  <span>New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
              </>
            )}
          </div>

          {mode === "login" && (
            <button type="button" className="btn-primary btn-full btn-auth" onClick={signIn} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="spin" size={20} /> Authenticating…
                </>
              ) : (
                "Access Console"
              )}
            </button>
          )}

          {mode === "forgot" && (
            <button type="button" className="btn-primary btn-full btn-auth" onClick={sendReset} disabled={busy}>
              {busy ? <Loader2 className="spin" size={20} /> : "Send reset link"}
            </button>
          )}

          {(mode === "recovery" || mode === "change-password") && (
            <button type="button" className="btn-primary btn-full btn-auth" onClick={applyNewPassword} disabled={busy}>
              {busy ? <Loader2 className="spin" size={20} /> : "Save password"}
            </button>
          )}

          {mode === "login" && (
            <button type="button" className="link-btn auth-switch" onClick={() => setMode("forgot")}>
              Forgot password?
            </button>
          )}

          {(mode === "forgot" || mode === "recovery") && (
            <button type="button" className="link-btn auth-switch" onClick={() => setMode("login")}>
              Back to sign in
            </button>
          )}

          {mode === "change-password" && (
            <button type="button" className="link-btn auth-switch" onClick={onPasswordChanged}>
              Back to console
            </button>
          )}

          {message && <p className="auth-message">{message}</p>}

          {!allowPasswordChange && mode === "login" && (
            <p className="hard-auth-foot">Internal Systems</p>
          )}
        </div>
      </div>
    </main>
  );
}
