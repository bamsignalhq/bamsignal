import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import type { UserProfile } from "../types";
import { fetchSecuritySettingsRemote, setTwoFactorRemote } from "../services/accountSecurity";

type TwoFactorSettingsCardProps = {
  user: Pick<UserProfile, "email" | "phone">;
  onMessage: (message: string, success?: boolean) => void;
};

export function TwoFactorSettingsCard({ user, onMessage }: TwoFactorSettingsCardProps) {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<"email" | "whatsapp">("email");
  const [whatsappAvailable, setWhatsappAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchSecuritySettingsRemote(user).then((settings) => {
      if (!settings) return;
      setEnabled(settings.twoFactorEnabled);
      setMethod(settings.twoFactorMethod === "whatsapp" ? "whatsapp" : "email");
      setWhatsappAvailable(settings.whatsappAvailable);
    });
  }, [user.email, user.phone]);

  const save = async (nextEnabled: boolean, nextMethod: "email" | "whatsapp") => {
    setBusy(true);
    const result = await setTwoFactorRemote(user, nextEnabled, nextMethod);
    setBusy(false);
    if (!result?.ok) {
      onMessage("We couldn't update login protection right now.");
      return;
    }
    setEnabled(nextEnabled);
    if (result.twoFactorMethod === "whatsapp" || result.twoFactorMethod === "email") {
      setMethod(result.twoFactorMethod);
    }
    onMessage(
      nextEnabled ? "Extra login protection is on." : "Extra login protection is off.",
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
          disabled={busy}
          onChange={(e) => void save(e.target.checked, method)}
        />
      </div>
      {enabled ? (
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
