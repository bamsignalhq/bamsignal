import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { UserProfile } from "../types";
import { USER_MESSAGES } from "../constants/userMessages";
import { isValidNigerianPhone, normalizeNigerianPhone } from "../utils/authIdentity";
import {
  confirmWhatsappVerification,
  startWhatsappVerification,
  submitVerificationSelfie
} from "../services/whatsappVerification";
import { moderatePhotoUpload } from "../utils/mediaModeration";
import { PHOTO_FILE_ACCEPT, validatePhotoFile } from "../utils/photoUpload";
import { PHOTO_UPLOAD_FAIL } from "../constants/photos";

type PhoneVerificationPanelProps = {
  user: UserProfile;
  phoneVerified: boolean;
  profilePhoto?: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  onPhoneVerified: (phone: string) => void;
  onSelfieSubmitted: (selfie: string) => void;
  onMessage?: (message: string) => void;
};

type ModalView = "closed" | "confirm" | "change";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
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
  const [modalView, setModalView] = useState<ModalView>("closed");
  const [draftPhone, setDraftPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState<"idle" | "sending" | "verifying">("idle");
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  const phoneReady = phone.length === 11 && isValidNigerianPhone(phone);
  const codeReady = code.length === 6;

  useEffect(() => {
    if (!codeSent || phoneVerified) return;
    window.setTimeout(() => codeInputRef.current?.focus({ preventScroll: true }), 120);
  }, [codeSent, phoneVerified]);

  const sendOtp = async () => {
    if (!isValidNigerianPhone(phone)) return;
    setBusy("sending");
    try {
      const result = await startWhatsappVerification(phone);
      if (!result.ok) {
        onMessage?.(result.error || USER_MESSAGES.otpSendFailed);
        return;
      }
      setModalView("closed");
      setCodeSent(true);
      setCode("");
      onMessage?.("Code sent to WhatsApp.");
    } finally {
      setBusy("idle");
    }
  };

  const verifyCode = async () => {
    if (!codeReady || busy === "verifying") return;
    setBusy("verifying");
    try {
      const result = await confirmWhatsappVerification(phone, code);
      if (!result.ok) {
        onMessage?.(result.error || USER_MESSAGES.otpVerifyFailed);
        return;
      }
      setCodeSent(false);
      setCode("");
      onPhoneVerified(normalizeNigerianPhone(phone));
      onMessage?.("Phone verified.");
    } finally {
      setBusy("idle");
    }
  };

  const saveChangedNumber = () => {
    const next = digitsOnly(draftPhone);
    if (!isValidNigerianPhone(next)) {
      onMessage?.("Enter a valid 11-digit Nigerian number.");
      return;
    }
    setPhone(next);
    setCodeSent(false);
    setCode("");
    setModalView("confirm");
  };

  const uploadSelfie = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !phoneVerified) return;

    const validation = await validatePhotoFile(file);
    if (!validation.ok) {
      onMessage?.(PHOTO_UPLOAD_FAIL);
      return;
    }

    const verdict = await moderatePhotoUpload(file, "selfie");
    if (!verdict.allowed) {
      onMessage?.(PHOTO_UPLOAD_FAIL);
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
        onMessage?.("Verification submitted. We'll review it shortly.");
      } finally {
        setBusy("idle");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <section className="card verification-card">
        <div className="verification-card__head">
          <ShieldCheck size={22} aria-hidden />
          <div>
            <h3>Verification</h3>
            <p className="verification-card__sub">
              {verificationStatus === "approved"
                ? "Your profile is verified."
                : verificationStatus === "pending"
                  ? "Your selfie is under review."
                  : "Verify your WhatsApp number to continue."}
            </p>
          </div>
        </div>

        <div className="verification-phone-row">
          <label className="verification-phone-row__field">
            <span className="profile-form-row__label">Phone number</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(digitsOnly(e.target.value));
                setCodeSent(false);
                setCode("");
              }}
              placeholder="08012345678"
              disabled={phoneVerified}
              maxLength={11}
            />
          </label>
          {phoneVerified ? (
            <span className="verification-phone-row__verified" aria-label="Phone verified">
              <CheckCircle2 size={24} />
            </span>
          ) : (
            phoneReady && (
              <button
                type="button"
                className="btn-secondary verification-phone-row__verify"
                onClick={() => {
                  setDraftPhone(phone);
                  setModalView("confirm");
                }}
              >
                Verify
              </button>
            )
          )}
        </div>

        {!phoneVerified && codeSent && (
          <div className="verification-code-row">
            <label className="verification-code-row__field">
              <span className="profile-form-row__label">Verification code</span>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                enterKeyHint="done"
                maxLength={6}
                value={code}
                disabled={busy === "verifying"}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  if (!pasted) return;
                  event.preventDefault();
                  setCode(pasted);
                }}
                placeholder="6-digit code"
              />
            </label>
            <button
              type="button"
              className="btn-primary verification-code-row__verify"
              onClick={verifyCode}
              disabled={busy === "verifying" || !codeReady}
            >
              {busy === "verifying" ? "Verifying…" : "Verify Code"}
            </button>
          </div>
        )}

        {phoneVerified && verificationStatus !== "approved" && verificationStatus !== "pending" && (
          <div className="verification-card__block">
            <p>Take a clear selfie so we can match it with your profile photos.</p>
            <button
              type="button"
              className="btn-primary"
              disabled={busy !== "idle"}
              onClick={() => document.getElementById("verification-selfie-input")?.click()}
            >
              Upload verification selfie
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
          <p className="verification-card__status">Verification pending — we'll notify you when it's done.</p>
        )}
      </section>

      {modalView !== "closed" && (
        <div className="modal-backdrop" role="presentation" onClick={() => setModalView("closed")}>
          <div
            className="card verification-whatsapp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-verify-title"
            onClick={(e) => e.stopPropagation()}
          >
            {modalView === "confirm" && (
              <>
                <h3 id="whatsapp-verify-title">Receive code on WhatsApp</h3>
                <p className="verification-whatsapp-modal__phone">{phone}</p>
                <button
                  type="button"
                  className="btn-primary btn-full"
                  onClick={sendOtp}
                  disabled={busy === "sending"}
                >
                  {busy === "sending" ? "Sending…" : "Receive WhatsApp OTP"}
                </button>
                <button
                  type="button"
                  className="verification-whatsapp-modal__link"
                  onClick={() => {
                    setDraftPhone(phone);
                    setModalView("change");
                  }}
                >
                  Wrong number? Change it
                </button>
              </>
            )}

            {modalView === "change" && (
              <>
                <h3 id="whatsapp-verify-title">Change phone number</h3>
                <label className="profile-form-row profile-form-row--stack">
                  <span className="profile-form-row__label">Phone number</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(digitsOnly(e.target.value))}
                    placeholder="08012345678"
                    maxLength={11}
                  />
                </label>
                <button type="button" className="btn-primary btn-full" onClick={saveChangedNumber}>
                  Save number
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
