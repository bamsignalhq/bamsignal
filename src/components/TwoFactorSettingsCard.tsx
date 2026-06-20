import { useCallback, useEffect, useMemo, useState } from "react";
import { Shield } from "lucide-react";
import type { UserProfile } from "../types";
import { resolveMemberIdentity } from "../utils/authIdentity";
import { fetchSecuritySettingsRemote, setTwoFactorRemote } from "../services/accountSecurity";

type TwoFactorSettingsCardProps = {
  user: Pick<UserProfile, "email" | "phone" | "username">;
  onMessage: (message: string, success?: boolean) => void;
};

type LoadState = "loading" | "ready" | "error";

export function TwoFactorSettingsCard({ user, onMessage }: TwoFactorSettingsCardProps) {
  const resolvedUser = useMemo(
    () => resolveMemberIdentity(user),
    [user.email, user.phone, user.username]
  );
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<"email" | "whatsapp">("email");
  const [whatsappAvailable, setWhatsappAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoadState("loading");
    const result = await fetchSecuritySettingsRemote(resolvedUser);
    if (!result.settings) {
      setLoadState("error");
      return;
    }
    setEnabled(result.settings.twoFactorEnabled);
    setMethod(result.settings.twoFactorMethod === "whatsapp" ? "whatsapp" : "email");
    setWhatsappAvailable(result.settings.whatsappAvailable);
    setLoadState("ready");
  }, [resolvedUser]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const save = async (nextEnabled: boolean, nextMethod: "email" | "whatsapp") => {
    if (busy || loadState !== "ready") return;
    setBusy(true);
    const result = await setTwoFactorRemote(resolvedUser, nextEnabled, nextMethod);
    setBusy(false);
    if (!result?.ok) {
      onMessage(result?.error || "We couldn't save two-factor authentication. Please try again.");
      return;
    }
    setEnabled(nextEnabled);
    if (result.twoFactorMethod === "whatsapp" || result.twoFactorMethod === "email") {
      setMethod(result.twoFactorMethod);
    }
    onMessage(
      nextEnabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled.",
      true
    );
  };

  return (
    <section className="card profile-privacy-card" aria-label="Two-factor authentication">
      <div className="settings-row settings-row--toggle">
        <span>
          <strong className="settings-row__title">
            <Shield size={18} aria-hidden /> Two-factor authentication
          </strong>
          <span className="account-settings-hint">Enable extra login protection</span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={busy || loadState !== "ready"}
          aria-busy={loadState === "loading" || busy}
          onChange={(e) => void save(e.target.checked, method)}
        />
      </div>

      {loadState === "loading" ? (
        <p className="account-settings-hint" role="status">
          Loading security settings…
        </p>
      ) : null}

      {loadState === "error" ? (
        <div className="account-settings-retry">
          <p className="account-settings-hint" role="alert">
            We couldn&apos;t load your security settings.
          </p>
          <button type="button" className="btn-secondary btn-sm" onClick={() => void loadSettings()}>
            Retry
          </button>
        </div>
      ) : null}

      {loadState === "ready" && enabled ? (
        <div className="auth-2fa-method">
          <label className="profile-form-row profile-form-row--stack">
            <span className="profile-form-row__label">Verification method</span>
            <select
              className="profile-form-row__input"
              value={method}
              disabled={busy}
              onChange={(e) => {
                const next = e.target.value === "whatsapp" ? "whatsapp" : "email";
                setMethod(next);
                void save(true, next);
              }}
            >
              <option value="email">Email code</option>
              {whatsappAvailable ? <option value="whatsapp">WhatsApp code</option> : null}
            </select>
          </label>
          {!whatsappAvailable ? (
            <p className="account-settings-hint">
              WhatsApp codes are available when your phone is verified and messaging is healthy.
            </p>
          ) : null}
          <p className="account-settings-hint">
            Trusted devices stay signed in for 30 days. New devices or browsers need a code.
          </p>
        </div>
      ) : null}
    </section>
  );
}
