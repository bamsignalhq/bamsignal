import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { OtpCodeInput } from "./OtpCodeInput";

type Login2faModalProps = {
  open: boolean;
  method: "email" | "whatsapp";
  maskedEmail?: string | null;
  maskedPhone?: string | null;
  busy?: boolean;
  message?: string;
  onClose: () => void;
  onResend: () => void;
  onVerify: (code: string) => void;
};

export function Login2faModal({
  open,
  method,
  maskedEmail,
  maskedPhone,
  busy,
  message,
  onClose,
  onResend,
  onVerify
}: Login2faModalProps) {
  const [code, setCode] = useState("");

  if (!open) return null;

  const destination =
    method === "whatsapp"
      ? maskedPhone
        ? `WhatsApp ending ${maskedPhone}`
        : "your verified WhatsApp number"
      : maskedEmail
        ? maskedEmail
        : "your email";

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card auth-2fa-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-2fa-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="auth-2fa-modal__icon">
          <ShieldCheck size={28} />
        </div>
        <h2 id="login-2fa-title">Verify it's you</h2>
        <p className="auth-2fa-modal__lede">
          Extra login protection is on. Enter the code we sent to {destination}.
        </p>
        <OtpCodeInput value={code} onChange={setCode} verifying={busy} />
        {message ? <p className="auth-2fa-modal__message">{message}</p> : null}
        <button
          type="button"
          className="btn-primary btn-full"
          disabled={busy || code.trim().length < 6}
          onClick={() => onVerify(code.trim())}
        >
          {busy ? "Verifying…" : "Verify and continue"}
        </button>
        <button type="button" className="btn-secondary btn-full" disabled={busy} onClick={onResend}>
          Resend code
        </button>
      </div>
    </div>
  );
}
