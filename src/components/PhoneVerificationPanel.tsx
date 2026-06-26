import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { OtpDigitInput } from "./OtpDigitInput";
import type { UserProfile } from "../types";
import { USER_MESSAGES } from "../constants/userMessages";
import { isValidNigerianPhone, normalizeNigerianPhone } from "../utils/authIdentity";
import {
  confirmWhatsappVerification,
  startWhatsappVerification,
  submitVerificationSelfie
} from "../services/whatsappVerification";
import { PHOTO_FILE_ACCEPT, validatePhotoFile } from "../utils/photoUpload";
import { photoUploadUserMessage } from "../constants/photos";
import { useAndroidBack } from "../hooks/useAndroidBack";

type PhoneVerificationPanelProps = {
  user: UserProfile;
  phoneVerified: boolean;
  profilePhoto?: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  onPhoneVerified: (phone: string) => void;
  onSelfieSubmitted: (selfie: string) => void;
  onMessage?: (message: string) => void;
};

const RESEND_SECONDS = 60;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatPhoneDisplay(local: string): string {
  if (local.length !== 11) return local;
  return `${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`;
}

export function PhoneVerificationPanel({
  user,
  phoneVerified,
  profilePhoto,
  verificationStatus = "none",
  onPhoneVerified,
  onSelfieSubmitted,
  onMessage
}: PhoneVerificationPanelProps) {
  const [phone, setPhone] = useState(() => digitsOnly(user.phone || ""));
  const [editingPhone, setEditingPhone] = useState(false);
  const [draftPhone, setDraftPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState<"idle" | "sending" | "verifying">("idle");
  const [inlineError, setInlineError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const inFlightRef = useRef(false);

  const phoneReady = phone.length === 11 && isValidNigerianPhone(phone);

  useEffect(() => {
    if (!codeSent || resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeSent, resendSeconds]);

  useAndroidBack(() => {
    if (editingPhone) {
      setEditingPhone(false);
      return true;
    }
    return false;
  });

  const sendOtp = useCallback(async () => {
    if (!isValidNigerianPhone(phone) || inFlightRef.current) return;
    inFlightRef.current = true;
    setBusy("sending");
    setInlineError("");

    try {
      const result = await startWhatsappVerification(phone, user.email);
      if (!result.ok) {
        if (result.errorCode !== "cancelled") {
          setInlineError(result.error || USER_MESSAGES.otpSendFailed);
        }
        return;
      }
      setCodeSent(true);
      setCode("");
      setResendSeconds(RESEND_SECONDS);
      onMessage?.(result.message || "Code sent on WhatsApp.");
    } finally {
      inFlightRef.current = false;
      setBusy("idle");
    }
  }, [onMessage, phone, user.email]);

  const verifyCode = useCallback(
    async (nextCode: string) => {
      if (nextCode.length !== 6 || busy === "verifying" || inFlightRef.current) return;
      inFlightRef.current = true;
      setBusy("verifying");
      setInlineError("");

      try {
        const result = await confirmWhatsappVerification(phone, nextCode, user.email);
        if (!result.ok) {
          if (result.errorCode !== "cancelled") {
            setInlineError(result.error || USER_MESSAGES.otpVerifyFailed);
          }
          return;
        }
        setCodeSent(false);
        setCode("");
        setResendSeconds(0);
        onPhoneVerified(normalizeNigerianPhone(phone));
        onMessage?.(result.message || "Phone verified successfully.");
      } finally {
        inFlightRef.current = false;
        setBusy("idle");
      }
    },
    [busy, onMessage, onPhoneVerified, phone, user.email]
  );

  const saveChangedNumber = () => {
    const next = digitsOnly(draftPhone);
    if (!isValidNigerianPhone(next)) {
      setInlineError("Enter a valid 11-digit Nigerian number.");
      return;
    }
    setPhone(next);
    setCodeSent(false);
    setCode("");
    setInlineError("");
    setEditingPhone(false);
  };

  const uploadSelfie = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !phoneVerified) return;

    const validation = await validatePhotoFile(file);
    if (!validation.ok) {
      onMessage?.(photoUploadUserMessage(validation.code));
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const verificationSelfie = String(reader.result || "");
      setBusy("verifying");
      try {
        const result = await submitVerificationSelfie({
          email: user.email,
          phone: normalizeNigerianPhone(phone || user.phone),
          name: user.name,
          profilePhoto,
          verificationSelfie
        });
        if (!result.ok) {
          onMessage?.(result.error || "Couldn't submit verification right now.");
          return;
        }
        onSelfieSubmitted(verificationSelfie);
        onMessage?.("Trusted Member review submitted. We'll update your profile shortly.");
      } finally {
        setBusy("idle");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <section className="card verification-card verification-card--minimal">
        {!phoneVerified && (
          <div className="wa-verify">
            {editingPhone ? (
              <>
                <h3 className="wa-verify__title">Change number</h3>
                <label className="wa-verify__field">
                  <span className="visually-hidden">Phone number</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    className="wa-verify__phone-input"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(digitsOnly(e.target.value))}
                    placeholder="08012345678"
                    maxLength={11}
                  />
                </label>
                <button type="button" className="btn-primary btn-full wa-verify__cta" onClick={saveChangedNumber}>
                  Save number
                </button>
                <button
                  type="button"
                  className="wa-verify__link"
                  onClick={() => {
                    setEditingPhone(false);
                    setInlineError("");
                  }}
                >
                  Cancel
                </button>
              </>
            ) : !phoneReady ? (
              <>
                <h3 className="wa-verify__title">Verify your number</h3>
                <p className="wa-verify__copy">Enter your Nigerian WhatsApp number.</p>
                <label className="wa-verify__field">
                  <span className="visually-hidden">Phone number</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    className="wa-verify__phone-input"
                    value={phone}
                    onChange={(e) => {
                      setPhone(digitsOnly(e.target.value));
                      setCodeSent(false);
                      setCode("");
                      setInlineError("");
                    }}
                    placeholder="08012345678"
                    maxLength={11}
                  />
                </label>
              </>
            ) : !codeSent ? (
              <>
                <h3 className="wa-verify__title">Verify your number</h3>
                <p className="wa-verify__copy">We&apos;ll send a WhatsApp code to</p>
                <p className="wa-verify__phone">{formatPhoneDisplay(phone)}</p>
                {inlineError ? (
                  <p className="wa-verify__alert" role="alert">
                    {inlineError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="btn-primary btn-full wa-verify__cta"
                  onClick={sendOtp}
                  disabled={busy === "sending"}
                >
                  {busy === "sending" ? (
                    <>
                      <Loader2 size={18} className="wa-verify__spinner" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    "Receive Code"
                  )}
                </button>
                <button
                  type="button"
                  className="wa-verify__link"
                  onClick={() => {
                    setDraftPhone(phone);
                    setEditingPhone(true);
                    setInlineError("");
                  }}
                >
                  Change number
                </button>
              </>
            ) : (
              <>
                <p className="wa-verify__success" role="status">
                  <CheckCircle2 size={20} aria-hidden />
                  Code sent
                </p>
                <p className="wa-verify__copy">Check your WhatsApp.</p>
                <OtpDigitInput
                  value={code}
                  onChange={setCode}
                  verifying={busy === "verifying"}
                  onComplete={verifyCode}
                />
                {inlineError ? (
                  <p className="wa-verify__alert" role="alert">
                    {inlineError}
                  </p>
                ) : null}
                <div className="wa-verify__footer">
                  <span className="wa-verify__hint">Didn&apos;t receive it?</span>
                  {resendSeconds > 0 ? (
                    <span className="wa-verify__countdown" aria-live="polite">
                      Resend in {resendSeconds}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="wa-verify__link"
                      onClick={sendOtp}
                      disabled={busy === "sending"}
                    >
                      Resend code
                    </button>
                  )}
                  <button
                    type="button"
                    className="wa-verify__link"
                    onClick={() => {
                      setCodeSent(false);
                      setCode("");
                      setInlineError("");
                      setDraftPhone(phone);
                      setEditingPhone(true);
                    }}
                  >
                    Edit number
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {phoneVerified && (
          <div className="verification-card__head">
            <ShieldCheck size={22} aria-hidden />
            <div>
              <h3>Trusted Member</h3>
              <p className="verification-card__sub">
                {verificationStatus === "approved"
                  ? "You're a Trusted Member."
                  : verificationStatus === "pending"
                    ? "Your photo is under private review."
                    : "Phone verified. Complete your selfie review."}
              </p>
            </div>
            <span className="verification-phone-row__verified" aria-label="Phone verified">
              <CheckCircle2 size={24} />
            </span>
          </div>
        )}

        {phoneVerified && verificationStatus !== "approved" && verificationStatus !== "pending" && (
          <div className="verification-card__block">
            <p>Take a clear selfie for private identity review. It is never shown publicly.</p>
            <button
              type="button"
              className="btn-primary"
              disabled={busy !== "idle"}
              onClick={() => document.getElementById("verification-selfie-input")?.click()}
            >
              Take selfie
            </button>
            <input
              id="verification-selfie-input"
              type="file"
              accept={PHOTO_FILE_ACCEPT}
              className="photo-upload-grid__input"
              onChange={uploadSelfie}
            />
          </div>
        )}

        {phoneVerified && verificationStatus === "pending" && (
          <p className="verification-card__status">
            Review in progress — your verification photo remains private.
          </p>
        )}
      </section>
    </>
  );
}
