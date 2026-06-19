import { useEffect, useState } from "react";
import { resendCooldownRemaining } from "../utils/signupPersistence";

type ResendCooldownProps = {
  codeSentAt: number;
  cooldownSec?: number;
  busy: boolean;
  onResend: () => void;
};

/** Isolated countdown so the auth page does not re-render every second. */
export function ResendCooldown({ codeSentAt, cooldownSec = 60, busy, onResend }: ResendCooldownProps) {
  const [remaining, setRemaining] = useState(() => resendCooldownRemaining(codeSentAt, cooldownSec));

  useEffect(() => {
    setRemaining(resendCooldownRemaining(codeSentAt, cooldownSec));
    const timer = window.setInterval(() => {
      setRemaining(resendCooldownRemaining(codeSentAt, cooldownSec));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeSentAt, cooldownSec]);

  if (remaining > 0) {
    return <span className="auth-verify__timer">Resend available in {remaining}s</span>;
  }

  return (
    <button type="button" className="link-btn link-btn--accent" onClick={onResend} disabled={busy}>
      {busy ? "Sending…" : "Resend code"}
    </button>
  );
}
