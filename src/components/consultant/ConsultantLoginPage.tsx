import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AppLogo } from "../AppLogo";
import { SIGNAL_CONCIERGE_BRAND } from "../../constants/signalConcierge";
import { navigateToPath } from "../../constants/routes";
import {
  getCurrentConsultant,
  loginConsultant,
  resolveConciergeConsultantEntry
} from "../../utils/consultantSession";
import type { Theme } from "../../types";

type ConsultantLoginPageProps = {
  theme: Theme;
  onToggleTheme: () => void;
  onAuthed: () => void;
};

export function ConsultantLoginPage({ onAuthed }: ConsultantLoginPageProps) {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const ok = loginConsultant(email, pin);
    if (!ok) {
      setMessage("Invalid consultant email or PIN.");
      setBusy(false);
      return;
    }

    const session = getCurrentConsultant();
    const entry = resolveConciergeConsultantEntry(session);
    navigateToPath(entry.route, true);
    onAuthed();
    setBusy(false);
  };

  return (
    <div className="consultant-login">
      <div className="consultant-login__card">
        <div className="consultant-login__brand">
          <AppLogo size="md" showText />
          <p className="consultant-login__eyebrow">{SIGNAL_CONCIERGE_BRAND}</p>
          <h1>Consultant Portal</h1>
          <p>Sign in to your private workspace. Members belong to BamSignal.</p>
        </div>

        <form className="consultant-login__form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            <span>Work email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ada.okafor@bamsignal.com"
              required
            />
          </label>
          <label>
            <span>PIN</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="••••"
              required
            />
          </label>
          {message ? <p className="consultant-login__message">{message}</p> : null}
          <button type="submit" className="consultant-login__submit" disabled={busy}>
            {busy ? <Loader2 size={18} className="consultant-login__spinner" aria-hidden /> : null}
            <span>{busy ? "Signing in…" : "Sign in"}</span>
          </button>
        </form>

        <p className="consultant-login__hint">
          Local session only — architecture preview. Active consultants from the directory can sign in
          with PIN <code>2468</code>.
        </p>
      </div>
    </div>
  );
}
