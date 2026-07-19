import type { Ref } from "react";
import { OtpCodeInput } from "../../OtpCodeInput";
import { ResendCooldown } from "../../ResendCooldown";
import { isSignupLegalComplete, SignupLegalCheckboxes } from "../../SignupLegalCheckboxes";
import { SignupMathGate } from "../../SignupMathGate";
import {
  JourneyInput,
  JourneyPrimaryButton,
  JourneyQuestion,
  JourneySecondaryButton
} from "..";
import { JourneyAuthShell } from "../JourneyAuthShell";

type FieldError = Partial<Record<"email" | "phone" | "username", string>>;

type JourneySecureSignupProps = {
  firstName?: string;
  form: {
    name: string;
    username: string;
    phone: string;
    email: string;
    pin: string;
    confirmPin: string;
  };
  hideName?: boolean;
  fieldErrors: FieldError;
  legalAccepted: boolean;
  mathChallenge: { a: number; b: number } | null;
  mathAnswer: string;
  mathError: string;
  mathLoading: boolean;
  busy: boolean;
  message?: string;
  onFormChange: (patch: Partial<JourneySecureSignupProps["form"]>) => void;
  onLegalChange: (value: boolean) => void;
  onMathAnswerChange: (value: string) => void;
  onMathRefresh: () => void;
  onSubmit: () => void;
  onLogin: () => void;
  onBack?: () => void;
  pinDigits: (value: string) => string;
  phoneDigits: (value: string) => string;
  formatUsername: (value: string) => string;
  clearFieldError: (field: "email" | "phone" | "username") => void;
};

export function JourneySecureSignup({
  firstName,
  form,
  hideName,
  fieldErrors,
  legalAccepted,
  mathChallenge,
  mathAnswer,
  mathError,
  mathLoading,
  busy,
  message,
  onFormChange,
  onLegalChange,
  onMathAnswerChange,
  onMathRefresh,
  onSubmit,
  onLogin,
  onBack,
  pinDigits,
  phoneDigits,
  formatUsername,
  clearFieldError
}: JourneySecureSignupProps) {
  const lede = firstName?.trim()
    ? `${firstName.trim()}, protect what you've already built.`
    : "Protect what you've already built.";

  return (
    <JourneyAuthShell
      screen="j7-account"
      showBack={Boolean(onBack)}
      onBack={onBack}
      footer={
        <>
          <JourneyPrimaryButton
            onClick={onSubmit}
            disabled={busy || mathLoading || !isSignupLegalComplete(legalAccepted)}
          >
            {busy ? "Preparing your journey…" : "Join securely"}
          </JourneyPrimaryButton>
          <JourneySecondaryButton onClick={onLogin}>Already have an account?</JourneySecondaryButton>
        </>
      }
    >
      <JourneyQuestion title="Secure your journey" lede={lede}>
        {!hideName ? (
          <JourneyInput
            id="journey-signup-name"
            label="Full name"
            value={form.name}
            autoComplete="name"
            onChange={(name) => onFormChange({ name })}
          />
        ) : null}
        <JourneyInput
          id="journey-signup-username"
          label="Username"
          value={form.username}
          autoComplete="username"
          onChange={(username) => {
            clearFieldError("username");
            onFormChange({ username: formatUsername(username) });
          }}
        />
        {fieldErrors.username ? <p className="journey-error">{fieldErrors.username}</p> : null}
        <JourneyInput
          id="journey-signup-phone"
          label="Phone number"
          type="tel"
          inputMode="numeric"
          value={form.phone}
          autoComplete="tel"
          onChange={(phone) => {
            clearFieldError("phone");
            onFormChange({ phone: phoneDigits(phone).slice(0, 11) });
          }}
        />
        {fieldErrors.phone ? <p className="journey-error">{fieldErrors.phone}</p> : null}
        <JourneyInput
          id="journey-signup-email"
          label="Email"
          type="email"
          value={form.email}
          autoComplete="email"
          onChange={(email) => {
            clearFieldError("email");
            onFormChange({ email });
          }}
        />
        {fieldErrors.email ? <p className="journey-error">{fieldErrors.email}</p> : null}
        <JourneyInput
          id="journey-signup-pin"
          label="PIN"
          type="password"
          inputMode="numeric"
          value={form.pin}
          autoComplete="new-password"
          onChange={(pin) => onFormChange({ pin: pinDigits(pin) })}
          maxLength={6}
        />
        <JourneyInput
          id="journey-signup-confirm-pin"
          label="Confirm PIN"
          type="password"
          inputMode="numeric"
          value={form.confirmPin}
          autoComplete="new-password"
          onChange={(confirmPin) => onFormChange({ confirmPin: pinDigits(confirmPin) })}
          maxLength={6}
        />
        <div className="journey-secure-legal">
          <SignupLegalCheckboxes accepted={legalAccepted} onChange={onLegalChange} />
        </div>
        {mathChallenge ? (
          <SignupMathGate
            a={mathChallenge.a}
            b={mathChallenge.b}
            answer={mathAnswer}
            onAnswerChange={onMathAnswerChange}
            onRefresh={onMathRefresh}
            error={mathError}
            disabled={busy || mathLoading}
            refreshing={mathLoading}
          />
        ) : mathLoading ? (
          <p className="journey-hint">Preparing your journey…</p>
        ) : null}
        {message ? <p className="journey-error">{message}</p> : null}
      </JourneyQuestion>
    </JourneyAuthShell>
  );
}

type JourneySecureVerifyProps = {
  maskedEmail: string;
  verifyCode: string;
  busy: boolean;
  resendBusy: boolean;
  codeSentAt: number;
  cooldownSec: number;
  message?: string;
  otpRef: Ref<HTMLInputElement>;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
  onBack?: () => void;
};

export function JourneySecureVerify({
  maskedEmail,
  verifyCode,
  busy,
  resendBusy,
  codeSentAt,
  cooldownSec,
  message,
  otpRef,
  onOtpChange,
  onVerify,
  onResend,
  onChangeEmail,
  onBack
}: JourneySecureVerifyProps) {
  return (
    <JourneyAuthShell
      screen="j8-verify-email"
      showBack={Boolean(onBack)}
      onBack={onBack}
      footer={
        <JourneyPrimaryButton onClick={onVerify} disabled={busy || verifyCode.length !== 6}>
          {busy ? "Protecting your account…" : "Continue"}
        </JourneyPrimaryButton>
      }
    >
      <JourneyQuestion title="Check your email" lede={`A code is on its way to ${maskedEmail}. This protects you.`}>
        <label className="journey-secure-otp" htmlFor="journey-verify-code">
          <span className="journey-input__label">Code</span>
          <OtpCodeInput
            ref={otpRef}
            id="journey-verify-code"
            className="journey-secure-otp__input"
            value={verifyCode}
            verifying={busy}
            onChange={onOtpChange}
          />
        </label>
        {message ? (
          <p
            className={`journey-hint${message.toLowerCase().includes("sent") ? " journey-hint--success" : ""}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
        <p className="journey-hint">Can&apos;t find it? Check spam.</p>
        <ResendCooldown
          codeSentAt={codeSentAt}
          cooldownSec={cooldownSec}
          busy={resendBusy}
          onResend={onResend}
        />
        <button type="button" className="journey-link-btn" onClick={onChangeEmail}>
          Change email
        </button>
      </JourneyQuestion>
    </JourneyAuthShell>
  );
}

type JourneySecureLoginProps = {
  username: string;
  pin: string;
  busy: boolean;
  message?: string;
  biometricAvailable?: boolean;
  biometricEnabled?: boolean;
  onUsernameChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onLogin: () => void;
  onBiometric?: () => void;
  onForgotPin: () => void;
  onJoin: () => void;
  formatUsername: (value: string) => string;
  pinDigits: (value: string) => string;
};

export function JourneySecureLogin({
  username,
  pin,
  busy,
  message,
  biometricAvailable,
  biometricEnabled,
  onUsernameChange,
  onPinChange,
  onLogin,
  onBiometric,
  onForgotPin,
  onJoin,
  formatUsername,
  pinDigits
}: JourneySecureLoginProps) {
  return (
    <JourneyAuthShell
      screen="a1-login"
      footer={
        <>
          <JourneyPrimaryButton onClick={onLogin} disabled={busy}>
            {busy ? "Continuing your journey…" : "Login"}
          </JourneyPrimaryButton>
          {biometricAvailable && biometricEnabled && onBiometric ? (
            <JourneySecondaryButton onClick={onBiometric}>Verify with biometrics</JourneySecondaryButton>
          ) : null}
          <JourneySecondaryButton onClick={onForgotPin}>Forgot PIN?</JourneySecondaryButton>
          <JourneySecondaryButton onClick={onJoin}>Join BamSignal</JourneySecondaryButton>
        </>
      }
    >
      <JourneyQuestion title="Welcome back" lede="Continue your journey.">
        <JourneyInput
          id="journey-login-username"
          label="Username"
          value={username}
          autoComplete="username"
          onChange={(value) => onUsernameChange(formatUsername(value.trim()))}
        />
        <JourneyInput
          id="journey-login-pin"
          label="PIN"
          type="password"
          inputMode="numeric"
          value={pin}
          autoComplete="current-password"
          onChange={(value) => onPinChange(pinDigits(value))}
          maxLength={6}
        />
        {message ? <p className="journey-error">{message}</p> : null}
      </JourneyQuestion>
    </JourneyAuthShell>
  );
}

type JourneySecureResetEmailProps = {
  email: string;
  busy: boolean;
  message?: string;
  onEmailChange: (value: string) => void;
  onSend: () => void;
  onBackToLogin: () => void;
};

export function JourneySecureResetEmail({
  email,
  busy,
  message,
  onEmailChange,
  onSend,
  onBackToLogin
}: JourneySecureResetEmailProps) {
  return (
    <JourneyAuthShell
      screen="a2-reset-email"
      showBack
      onBack={onBackToLogin}
      footer={
        <>
          <JourneyPrimaryButton onClick={onSend} disabled={busy}>
            {busy ? "Preparing your journey…" : "Send code"}
          </JourneyPrimaryButton>
          <JourneySecondaryButton onClick={onBackToLogin}>Back to login</JourneySecondaryButton>
        </>
      }
    >
      <JourneyQuestion
        title="Reset your PIN"
        lede="We'll email a code to the address on your account. You're always in control."
      >
        <JourneyInput
          id="journey-reset-email"
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={onEmailChange}
        />
        {message ? (
          <p
            className={`journey-hint${message.toLowerCase().includes("sent") ? " journey-hint--success" : ""}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </JourneyQuestion>
    </JourneyAuthShell>
  );
}

type JourneySecureResetCodeProps = {
  maskedEmail: string;
  resetCode: string;
  newPin: string;
  confirmPin: string;
  busy: boolean;
  resendBusy: boolean;
  codeSentAt: number;
  cooldownSec: number;
  message?: string;
  otpRef: Ref<HTMLInputElement>;
  onResetCodeChange: (value: string) => void;
  onNewPinChange: (value: string) => void;
  onConfirmPinChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBackToLogin: () => void;
  pinDigits: (value: string) => string;
};

export function JourneySecureResetCode({
  maskedEmail,
  resetCode,
  newPin,
  confirmPin,
  busy,
  resendBusy,
  codeSentAt,
  cooldownSec,
  message,
  otpRef,
  onResetCodeChange,
  onNewPinChange,
  onConfirmPinChange,
  onSubmit,
  onResend,
  onBackToLogin,
  pinDigits
}: JourneySecureResetCodeProps) {
  return (
    <JourneyAuthShell
      screen="a3-reset-code"
      showBack
      onBack={onBackToLogin}
      footer={
        <JourneyPrimaryButton
          onClick={onSubmit}
          disabled={
            busy || resetCode.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6
          }
        >
          {busy ? "Preparing your journey…" : "Save new PIN"}
        </JourneyPrimaryButton>
      }
    >
      <JourneyQuestion title="Check your email" lede={`Reset code sent to ${maskedEmail}.`}>
        <label className="journey-secure-otp" htmlFor="journey-reset-code">
          <span className="journey-input__label">Reset code</span>
          <OtpCodeInput
            ref={otpRef}
            id="journey-reset-code"
            className="journey-secure-otp__input"
            value={resetCode}
            verifying={busy}
            onChange={onResetCodeChange}
            aria-label="PIN reset code"
          />
        </label>
        <JourneyInput
          id="journey-reset-new-pin"
          label="New PIN"
          type="password"
          inputMode="numeric"
          value={newPin}
          autoComplete="new-password"
          onChange={(value) => onNewPinChange(pinDigits(value))}
          maxLength={6}
        />
        <JourneyInput
          id="journey-reset-confirm-pin"
          label="Confirm PIN"
          type="password"
          inputMode="numeric"
          value={confirmPin}
          autoComplete="new-password"
          onChange={(value) => onConfirmPinChange(pinDigits(value))}
          maxLength={6}
        />
        {message ? (
          <p
            className={`journey-hint${
              message.toLowerCase().includes("sent") || message.toLowerCase().includes("updated")
                ? " journey-hint--success"
                : ""
            }`}
            role="status"
          >
            {message}
          </p>
        ) : null}
        <ResendCooldown
          codeSentAt={codeSentAt}
          cooldownSec={cooldownSec}
          busy={resendBusy}
          onResend={onResend}
        />
      </JourneyQuestion>
    </JourneyAuthShell>
  );
}

type JourneySecureExistingProps = {
  field: "email" | "phone" | "username";
  maskedEmail?: string;
  onLogin: () => void;
  onUseAnother: () => void;
  onForgotPin: () => void;
};

export function JourneySecureExisting({
  field,
  maskedEmail,
  onLogin,
  onUseAnother,
  onForgotPin
}: JourneySecureExistingProps) {
  const lede =
    field === "phone"
      ? "This phone number is already linked to an account."
      : field === "username"
        ? "This username is already taken."
        : maskedEmail
          ? `An account already exists for ${maskedEmail}.`
          : "An account already exists with this email.";

  const anotherLabel =
    field === "phone" ? "Use another phone number" : field === "username" ? "Choose another username" : "Use another email";

  return (
    <JourneyAuthShell
      screen="a4-existing"
      footer={
        <>
          <JourneyPrimaryButton onClick={onLogin}>Log in</JourneyPrimaryButton>
          <JourneySecondaryButton onClick={onUseAnother}>{anotherLabel}</JourneySecondaryButton>
          <JourneySecondaryButton onClick={onForgotPin}>Forgot PIN?</JourneySecondaryButton>
        </>
      }
    >
      <JourneyQuestion title="Welcome back" lede={lede} />
    </JourneyAuthShell>
  );
}
