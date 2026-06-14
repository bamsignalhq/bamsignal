import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { DEMO_ADMIN, matchDemoAdmin } from "../constants/demoAccounts";
import { ADMIN_HUB_PATH, navigateToPath } from "../constants/routes";
import { friendlyAuthError, supabase } from "../services/supabase";
import { setAdminSession } from "../utils/adminSession";

type AdminAuthPageProps = {
  onAuthed: () => void;
  onBack: () => void;
};

export function AdminAuthPage({ onAuthed, onBack }: AdminAuthPageProps) {
  const [email, setEmail] = useState(import.meta.env.DEV ? DEMO_ADMIN.email : "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const signIn = async () => {
    setBusy(true);
    setMessage("");
    try {
      if (matchDemoAdmin(email, password)) {
        setAdminSession(DEMO_ADMIN.email);
        navigateToPath(ADMIN_HUB_PATH);
        onAuthed();
        return;
      }

      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (error) throw error;
        if (data.session) {
          setAdminSession(email.trim().toLowerCase());
          navigateToPath(ADMIN_HUB_PATH);
          onAuthed();
          return;
        }
      }

      setMessage("Invalid admin credentials.");
    } catch (error) {
      setMessage(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-shell__glow" aria-hidden />
        <div className="auth-card auth-card--fintech">
          <div className="auth-brand">
            <AppLogo size="lg" />
          </div>
          <h1 className="auth-title">Operations access</h1>
          <p className="auth-sub">Approved admin accounts only.</p>

          {import.meta.env.DEV && (
            <p className="auth-dev-hint">
              Dev: <strong>{DEMO_ADMIN.email}</strong> / <strong>{DEMO_ADMIN.password}</strong>
            </p>
          )}

          <div className="auth-fields">
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
          </div>

          <button type="button" className="btn-primary btn-full btn-auth" onClick={signIn} disabled={busy}>
            {busy ? <Loader2 className="spin" size={20} /> : "Enter console"}
          </button>

          <button type="button" className="link-btn auth-switch" onClick={onBack}>
            ← Back to BamSignal
          </button>

          {message && <p className="auth-message">{message}</p>}
        </div>
      </div>
    </main>
  );
}
