import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { DEMO_ADMIN, matchDemoAdmin } from "../constants/demoAccounts";
import { ADMIN_HUB_PATH, navigateToPath } from "../constants/routes";
import { friendlyAuthError, supabase } from "../services/supabase";
import { verifyAdminSession } from "../services/plans";
import {
  getAdminLastRoute,
  persistAdminSession,
  snapshotMemberSessionBeforeAdminLogin
} from "../utils/adminSession";

type AdminAuthMode = "login" | "forgot" | "recovery" | "change-password";

type AdminAuthPageProps = {
  onAuthed: () => void;
  onBack: () => void;
  allowPasswordChange?: boolean;
  onPasswordChanged?: () => void;
};

export function AdminAuthPage({
  onAuthed,
  onBack,
  allowPasswordChange = false,
  onPasswordChanged
}: AdminAuthPageProps) {
  const [mode, setMode] = useState<AdminAuthMode>(allowPasswordChange ? "change-password" : "login");
  const [email, setEmail] = useState(import.meta.env.DEV ? DEMO_ADMIN.email : "ops@bamsignal.com");
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
        setMessage("Choose a new admin password.");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [allowPasswordChange]);

  const finishAuthed = async (sessionEmail: string, accessToken?: string) => {
    await persistAdminSession(sessionEmail, accessToken);
    navigateToPath(getAdminLastRoute() || ADMIN_HUB_PATH);
    onAuthed();
  };

  const signIn = async () => {
    setBusy(true);
    setMessage("");
    try {
      await snapshotMemberSessionBeforeAdminLogin();

      if (matchDemoAdmin(email, password)) {
        await persistAdminSession(DEMO_ADMIN.email);
        navigateToPath(getAdminLastRoute() || ADMIN_HUB_PATH);
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
          setMessage("Invalid admin credentials.");
          return;
        }
        const ok = await verifyAdminSession(token);
        if (!ok) {
          await supabase.auth.signOut();
          setMessage("This account does not have admin access.");
          return;
        }
        await finishAuthed(email.trim().toLowerCase(), token);
        return;
      }

      setMessage("Invalid admin credentials.");
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
        setMessage("Enter your admin email.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/admin/auth`
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
        setMessage("Admin password updated.");
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

  const title =
    mode === "forgot"
      ? "Reset admin password"
      : mode === "recovery" || mode === "change-password"
        ? "Set new admin password"
        : "Operations access";

  return (
    <main className="auth-page admin-auth-page">
      <div className="auth-shell">
        <div className="auth-shell__glow" aria-hidden />
        <div className="auth-card auth-card--fintech">
          <div className="auth-brand">
            <AppLogo size="lg" />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">
            {mode === "login"
              ? "Approved admin accounts only."
              : mode === "forgot"
                ? "We will email a secure reset link."
                : "Choose a strong password for console access."}
          </p>

          {import.meta.env.DEV && mode === "login" && (
            <p className="auth-dev-hint">
              Dev: <strong>{DEMO_ADMIN.email}</strong> / <strong>{DEMO_ADMIN.password}</strong>
            </p>
          )}

          <div className="auth-fields">
            {mode === "login" || mode === "forgot" ? (
              <label className="auth-field">
                <span>Admin email</span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ops@bamsignal.com"
                />
              </label>
            ) : null}

            {mode === "login" ? (
              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                />
              </label>
            ) : null}

            {(mode === "recovery" || mode === "change-password") && (
              <>
                <label className="auth-field">
                  <span>New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </label>
                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                  />
                </label>
              </>
            )}
          </div>

          {mode === "login" && (
            <button type="button" className="btn-primary btn-full btn-auth" onClick={signIn} disabled={busy}>
              {busy ? <Loader2 className="spin" size={20} /> : "Enter console"}
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

          {!allowPasswordChange && mode !== "change-password" && (
            <button type="button" className="link-btn auth-switch" onClick={onBack}>
              Back to BamSignal
            </button>
          )}

          {message && <p className="auth-message">{message}</p>}
        </div>
      </div>
    </main>
  );
}
