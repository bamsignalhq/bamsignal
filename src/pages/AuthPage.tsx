import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { AppLogo } from "../components/AppLogo";
import { AuthField } from "../components/AuthField";
import type { AuthMeta, AuthMode, UserProfile } from "../types";
import { DEMO_USER, matchDemoUser, seedDemoMemberProfile } from "../constants/demoAccounts";
import { friendlyAuthError, supabase } from "../services/supabase";
import { resolveLoginEmail, checkSignupAvailability, checkSignupField, sendSignupEmailCode, verifySignupEmailCode, AuthEmailError } from "../services/authEmail";
import { USER_MESSAGES } from "../constants/userMessages";
import { trackEvent } from "../utils/analytics";
import {
  emailForUsername,
  formatUsernameInput,
  isStrongPin,
  isValidLoginUsername,
  isValidNigerianPhone,
  isValidPin,
  isValidSignupUsername,
  normalizeNigerianPhone,
  normalizeUsername,
  rememberUsernameEmail,
  profileFromSessionUser
} from "../utils/authIdentity";
import {
  clearPendingSignup,
  loadPendingSignup,
  resendCooldownRemaining,
  savePendingSignup,
  touchPendingCodeSent,
  touchPendingVerifyCode
} from "../utils/signupPersistence";

type AuthPageProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void;
  message?: string;
  onMessage: (msg: string) => void;
  embedded?: boolean;
};

const emptySignup = {
  name: "",
  username: "",
  phone: "",
  email: "",
  pin: "",
  confirmPin: ""
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;
const FIELD_CHECK_DELAY_MS = 450;

type SignupField = "email" | "phone" | "username";
type SignupFieldErrors = Partial<Record<SignupField, string>>;
type SignupFieldChecking = Partial<Record<SignupField, boolean>>;

function isLikelyEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  const [local, domain] = email.split("@");
  return Boolean(local && domain && domain.includes("."));
}

function restoredSignupState() {
  const pending = loadPendingSignup();
  if (!pending) {
    return {
      pendingSignup: null as UserProfile | null,
      signupForm: emptySignup,
      verifyCode: "",
      resendIn: 0
    };
  }

  const { profile, pin, verifyCode = "", codeSentAt } = pending;
  return {
    pendingSignup: profile,
    signupForm: {
      ...emptySignup,
      name: profile.name || "",
      username: profile.username || "",
      phone: profile.phone || "",
      email: profile.email || "",
      pin,
      confirmPin: pin
    },
    verifyCode,
    resendIn: resendCooldownRemaining(codeSentAt, RESEND_COOLDOWN_SEC)
  };
}

function maskEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const [local, domain] = trimmed.split("@");
  if (!local || !domain) return trimmed || "your email";
  const head = local.slice(0, 1);
  const tail = local.length > 2 ? local.slice(-1) : "";
  const hidden = Math.max(local.length - head.length - tail.length, 1);
  return `${head}${"•".repeat(Math.min(hidden, 5))}${tail ? tail : ""}@${domain}`;
}

export function AuthPage({
  mode,
  onModeChange,
  onAuthenticated,
  message,
  onMessage,
  embedded
}: AuthPageProps) {
  const restored = useRef(restoredSignupState());
  const [busy, setBusy] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", pin: "" });
  const [signupForm, setSignupForm] = useState(restored.current.signupForm);
  const [signupFieldErrors, setSignupFieldErrors] = useState<SignupFieldErrors>({});
  const [signupFieldChecking, setSignupFieldChecking] = useState<SignupFieldChecking>({});
  const [verifyCode, setVerifyCode] = useState(restored.current.verifyCode);
  const [resetEmail, setResetEmail] = useState("");
  const [pendingSignup, setPendingSignup] = useState<UserProfile | null>(restored.current.pendingSignup);
  const [resendIn, setResendIn] = useState(restored.current.resendIn);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const verifyInFlight = useRef(false);

  const phoneDigits = (value: string) => normalizeNigerianPhone(value);
  const pinDigits = (value: string) => value.replace(/\D/g, "").slice(0, 6);

  const focusOtpInput = () => {
    window.setTimeout(() => {
      otpInputRef.current?.focus({ preventScroll: true });
    }, 120);
  };

  useEffect(() => {
    if (mode !== "verify" || !pendingSignup?.email) return;
    focusOtpInput();
  }, [mode, pendingSignup?.email]);

  useEffect(() => {
    if (mode !== "verify") return;

    const refocusOtp = () => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      focusOtpInput();
    };

    document.addEventListener("visibilitychange", refocusOtp);
    window.addEventListener("pageshow", refocusOtp);
    window.addEventListener("focus", refocusOtp);
    return () => {
      document.removeEventListener("visibilitychange", refocusOtp);
      window.removeEventListener("pageshow", refocusOtp);
      window.removeEventListener("focus", refocusOtp);
    };
  }, [mode]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (mode !== "verify" || pendingSignup?.email || restored.current.pendingSignup?.email) return;
    onMessage("Your verification session expired. Please sign up again.");
    onModeChange("signup");
  }, [mode, pendingSignup?.email, onModeChange, onMessage]);

  const setSignupFieldError = (field: SignupField, message: string) => {
    setSignupFieldErrors((current) => ({ ...current, [field]: message }));
  };

  const clearSignupFieldError = (field: SignupField) => {
    setSignupFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    const username = normalizeUsername(signupForm.username);
    if (!isValidSignupUsername(username)) {
      clearSignupFieldError("username");
      setSignupFieldChecking((current) => ({ ...current, username: false }));
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSignupFieldChecking((current) => ({ ...current, username: true }));
      void checkSignupField("username", username)
        .then(() => {
          if (cancelled) return;
          clearSignupFieldError("username");
        })
        .catch((error) => {
          if (cancelled) return;
          if (error instanceof AuthEmailError && error.kind === "exists") {
            setSignupFieldError("username", error.message);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setSignupFieldChecking((current) => ({ ...current, username: false }));
          }
        });
    }, FIELD_CHECK_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [signupForm.username]);

  useEffect(() => {
    const phone = phoneDigits(signupForm.phone);
    if (!isValidNigerianPhone(phone)) {
      clearSignupFieldError("phone");
      setSignupFieldChecking((current) => ({ ...current, phone: false }));
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSignupFieldChecking((current) => ({ ...current, phone: true }));
      void checkSignupField("phone", phone)
        .then(() => {
          if (cancelled) return;
          clearSignupFieldError("phone");
        })
        .catch((error) => {
          if (cancelled) return;
          if (error instanceof AuthEmailError && error.kind === "exists") {
            setSignupFieldError("phone", error.message);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setSignupFieldChecking((current) => ({ ...current, phone: false }));
          }
        });
    }, FIELD_CHECK_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [signupForm.phone]);

  useEffect(() => {
    const email = signupForm.email.trim().toLowerCase();
    if (!isLikelyEmail(email)) {
      clearSignupFieldError("email");
      setSignupFieldChecking((current) => ({ ...current, email: false }));
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSignupFieldChecking((current) => ({ ...current, email: true }));
      void checkSignupField("email", email)
        .then(() => {
          if (cancelled) return;
          clearSignupFieldError("email");
        })
        .catch((error) => {
          if (cancelled) return;
          if (error instanceof AuthEmailError && error.kind === "exists") {
            setSignupFieldError("email", error.message);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setSignupFieldChecking((current) => ({ ...current, email: false }));
          }
        });
    }, FIELD_CHECK_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [signupForm.email]);

  const signIn = async () => {
    const username = normalizeUsername(loginForm.username);
    if (!isValidLoginUsername(username)) {
      onMessage("Enter a valid username.");
      return;
    }
    if (!isValidPin(loginForm.pin)) {
      onMessage("Enter your PIN.");
      return;
    }

    setBusy("login");
    onMessage("");
    try {
      if (matchDemoUser(username, loginForm.pin)) {
        rememberUsernameEmail(DEMO_USER.username, DEMO_USER.profile.email);
        seedDemoMemberProfile();
        onAuthenticated(DEMO_USER.profile, { isNewSignup: false });
        return;
      }

      const email =
        emailForUsername(username) ?? (await resolveLoginEmail(username));
      if (supabase && email) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: loginForm.pin
        });
        if (error) throw error;
        rememberUsernameEmail(username, email);
        onAuthenticated(profileFromSessionUser(data.user!), { isNewSignup: false });
        return;
      }

      onMessage("Account not found. Check your username and PIN.");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const signUp = async () => {
    const name = signupForm.name.trim();
    const username = normalizeUsername(signupForm.username);
    const email = signupForm.email.trim().toLowerCase();
    const phone = phoneDigits(signupForm.phone);

    if (name.length < 2) {
      onMessage("Enter your full name.");
      return;
    }
    if (!isValidSignupUsername(username)) {
      onMessage("Username must be at least 7 letters with no numbers.");
      return;
    }
    if (!isValidNigerianPhone(phone)) {
      onMessage("Put your correct WhatsApp number.");
      return;
    }
    if (!email.includes("@")) {
      onMessage("Enter a valid email.");
      return;
    }
    if (!isStrongPin(signupForm.pin)) {
      onMessage("Choose a 6-digit PIN without repeats or sequences like 123456.");
      return;
    }
    if (signupForm.pin !== signupForm.confirmPin) {
      onMessage("PINs do not match.");
      return;
    }
    if (signupFieldErrors.email || signupFieldErrors.phone || signupFieldErrors.username) {
      onMessage(
        signupFieldErrors.email ||
          signupFieldErrors.phone ||
          signupFieldErrors.username ||
          "Fix the highlighted fields before continuing."
      );
      return;
    }
    if (signupFieldChecking.email || signupFieldChecking.phone || signupFieldChecking.username) {
      onMessage("Still checking your details — wait a moment.");
      return;
    }

    setBusy("signup");
    onMessage("");
    trackEvent("signup_started");

    const profile: UserProfile = { name, username, email, phone };

    try {
      if (!supabase) {
        throw new Error("Authentication is not configured. Please update the app and try again.");
      }

      await checkSignupAvailability({ email, phone, username });
      await sendSignupEmailCode(email, name, { phone, username });
      rememberUsernameEmail(username, email);
      setVerifyCode("");
      setResendIn(RESEND_COOLDOWN_SEC);
      setPendingSignup(profile);
      if (!savePendingSignup({ profile, pin: signupForm.pin, verifyCode: "" })) {
        onMessage(USER_MESSAGES.progressSaveFailed);
      }
      onModeChange("verify");
      return;
    } catch (error) {
      if (error instanceof AuthEmailError && error.kind === "exists") {
        if (error.field) {
          setSignupFieldError(error.field, error.message);
        }
        clearPendingSignup();
        onModeChange("signup");
      }
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const verifySignup = async (code = verifyCode) => {
    if (!pendingSignup || code.length !== OTP_LENGTH || verifyInFlight.current) return;
    verifyInFlight.current = true;
    setBusy("verify");
    setVerifyBusy(true);
    onMessage("");
    try {
      if (!supabase) {
        throw new Error("Authentication is not configured. Please update the app and try again.");
      }

      await verifySignupEmailCode({
        email: pendingSignup.email,
        code,
        password: signupForm.pin,
        name: pendingSignup.name,
        username: pendingSignup.username || "",
        phone: pendingSignup.phone || ""
      });

      let lastError: unknown = null;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: pendingSignup.email,
          password: signupForm.pin
        });
        if (!error && data.user) {
          clearPendingSignup();
          onAuthenticated(profileFromSessionUser(data.user), { isNewSignup: true });
          return;
        }
        lastError = error;
        if (attempt < 3) {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
        }
      }

      throw lastError || new Error("We couldn't finish creating your account. Try again shortly.");
    } catch (error) {
      if (error instanceof AuthEmailError && error.kind === "exists") {
        clearPendingSignup();
        setPendingSignup(null);
        onModeChange("signup");
      }
      onMessage(
        error instanceof AuthEmailError && error.kind === "validation"
          ? USER_MESSAGES.otpVerifyFailed
          : friendlyAuthError(error)
      );
    } finally {
      verifyInFlight.current = false;
      setVerifyBusy(false);
      setBusy(null);
    }
  };

  const updateVerifyCode = (next: string) => {
    const cleaned = next.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setVerifyCode(cleaned);
    touchPendingVerifyCode(cleaned);
    return cleaned;
  };

  const handleOtpChange = (raw: string) => {
    const next = updateVerifyCode(raw);
    if (next.length === OTP_LENGTH) {
      void verifySignup(next);
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = updateVerifyCode(pasted);
    if (next.length === OTP_LENGTH) {
      void verifySignup(next);
    }
  };

  const resendVerification = async () => {
    if (!pendingSignup?.email || resendIn > 0) return;
    setBusy("resend");
    onMessage("");
    try {
      if (!supabase) {
        throw new Error("Authentication is not configured. Please update the app and try again.");
      }

      await sendSignupEmailCode(pendingSignup.email, pendingSignup.name, {
        phone: pendingSignup.phone || "",
        username: pendingSignup.username || ""
      });
      onMessage("Fresh code sent — check your inbox.");
      setResendIn(RESEND_COOLDOWN_SEC);
      setVerifyCode("");
      touchPendingCodeSent();
      focusOtpInput();
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const sendReset = async () => {
    setBusy("reset");
    try {
      if (supabase && resetEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/love/login`
        });
        if (error) throw error;
        onMessage("Reset link sent.");
      } else {
        onMessage("Enter your email.");
      }
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className={`auth-page ${embedded ? "auth-page--embedded" : ""}`}>
      <div className="auth-shell">
        <div className="auth-shell__glow" aria-hidden />
        <div className="auth-card auth-card--fintech">
          <div className="auth-brand">
            <AppLogo size="lg" />
          </div>

          {mode === "login" && (
            <>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-sub">Sign in with your username and PIN.</p>
              {import.meta.env.DEV && (
                <p className="auth-dev-hint">
                  Demo: <strong>{DEMO_USER.username}</strong> / <strong>{DEMO_USER.pin}</strong>
                </p>
              )}
              <div className="auth-fields">
                <AuthField
                  label="Username"
                  value={loginForm.username}
                  onChange={(username) =>
                    setLoginForm({ ...loginForm, username: formatUsernameInput(username) })
                  }
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={24}
                  className="auth-field--centered"
                />
                <AuthField
                  label="PIN"
                  value={loginForm.pin}
                  onChange={(pin) => setLoginForm({ ...loginForm, pin: pinDigits(pin) })}
                  pin
                  maxLength={6}
                  autoComplete="current-password"
                />
              </div>
              <button type="button" className="btn-primary btn-full btn-auth" onClick={signIn} disabled={busy === "login"}>
                {busy === "login" ? <Loader2 className="spin" size={20} /> : "Login"}
              </button>
              <div className="auth-links auth-links--stack">
                <button type="button" className="link-btn" onClick={() => onModeChange("reset")}>
                  Forgot PIN?
                </button>
                <button type="button" className="link-btn link-btn--accent" onClick={() => onModeChange("signup")}>
                  Create account
                </button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <>
              <h1 className="auth-title">Create your account</h1>
              <div className="auth-fields">
                <AuthField
                  label="Name"
                  value={signupForm.name}
                  onChange={(name) => setSignupForm({ ...signupForm, name })}
                  autoComplete="name"
                />
                <AuthField
                  label="Username"
                  value={signupForm.username}
                  onChange={(username) => {
                    clearSignupFieldError("username");
                    setSignupForm({ ...signupForm, username: formatUsernameInput(username) });
                  }}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={24}
                  error={signupFieldErrors.username}
                  checking={signupFieldChecking.username}
                />
                <AuthField
                  label="Phone"
                  value={signupForm.phone}
                  onChange={(phone) => {
                    clearSignupFieldError("phone");
                    setSignupForm({ ...signupForm, phone: phoneDigits(phone).slice(0, 11) });
                  }}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  error={signupFieldErrors.phone}
                  checking={signupFieldChecking.phone}
                />
                <AuthField
                  label="Email"
                  value={signupForm.email}
                  onChange={(email) => {
                    clearSignupFieldError("email");
                    setSignupForm({ ...signupForm, email });
                  }}
                  type="email"
                  autoComplete="email"
                  error={signupFieldErrors.email}
                  checking={signupFieldChecking.email}
                />
                <AuthField
                  label="PIN"
                  value={signupForm.pin}
                  onChange={(pin) => setSignupForm({ ...signupForm, pin: pinDigits(pin) })}
                  pin
                  maxLength={6}
                  autoComplete="new-password"
                />
                <AuthField
                  label="Confirm PIN"
                  value={signupForm.confirmPin}
                  onChange={(confirmPin) => setSignupForm({ ...signupForm, confirmPin: pinDigits(confirmPin) })}
                  pin
                  maxLength={6}
                  autoComplete="new-password"
                />
              </div>
              <button type="button" className="btn-primary btn-full btn-auth" onClick={signUp} disabled={busy === "signup"}>
                {busy === "signup" ? <Loader2 className="spin" size={20} /> : "Continue"}
              </button>
              <button type="button" className="link-btn auth-switch" onClick={() => onModeChange("login")}>
                Already have an account? Login
              </button>
            </>
          )}

          {mode === "verify" && (
            <div className="auth-verify">
              <div className="auth-verify__hero">
                <div className="auth-verify__icon-ring" aria-hidden>
                  <div className="auth-verify__icon">
                    <Mail size={26} strokeWidth={2.2} />
                  </div>
                </div>
                <p className="auth-verify__step">Verify your email</p>
                <h1 className="auth-title auth-verify__title">Check your email</h1>
                <p className="auth-verify__lede">
                  Sent to <strong>{maskEmail(pendingSignup?.email || "")}</strong>
                </p>
              </div>

              <label className="auth-verify__otp-field">
                <span className="auth-verify__otp-label">Verification code</span>
                <input
                  ref={otpInputRef}
                  className="auth-verify__code-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  enterKeyHint="done"
                  maxLength={OTP_LENGTH}
                  value={verifyCode}
                  aria-label="Email verification code"
                  disabled={busy === "verify" || verifyBusy}
                  onChange={(event) => handleOtpChange(event.target.value)}
                  onPaste={handleOtpPaste}
                />
              </label>

              <button
                type="button"
                className="btn-primary btn-full btn-auth auth-verify__submit"
                onClick={() => verifySignup()}
                disabled={busy === "verify" || verifyBusy || verifyCode.length !== OTP_LENGTH}
              >
                {busy === "verify" ? <Loader2 className="spin" size={20} /> : "Verify & continue"}
              </button>

              <div className="auth-verify__meta">
                <p className="auth-verify__hint">
                  <ShieldCheck size={15} aria-hidden />
                  If you don&apos;t see it within a minute, check your spam folder.
                </p>
                <p className="auth-verify__resend">
                  {resendIn > 0 ? (
                    <span className="auth-verify__timer">Resend available in {resendIn}s</span>
                  ) : (
                    <button
                      type="button"
                      className="link-btn link-btn--accent"
                      onClick={() => void resendVerification()}
                      disabled={busy === "resend"}
                    >
                      {busy === "resend" ? "Sending…" : "Resend code"}
                    </button>
                  )}
                </p>
                <button
                  type="button"
                  className="link-btn auth-verify__back"
                  onClick={() => {
                    clearPendingSignup();
                    setPendingSignup(null);
                    setVerifyCode("");
                    onModeChange("signup");
                  }}
                >
                  Change email
                </button>
              </div>
            </div>
          )}

          {mode === "reset" && (
            <>
              <h1 className="auth-title">Reset PIN</h1>
              <AuthField
                label="Email"
                value={resetEmail}
                onChange={setResetEmail}
                type="email"
              />
              <button type="button" className="btn-primary btn-full btn-auth" onClick={sendReset} disabled={busy === "reset"}>
                {busy === "reset" ? <Loader2 className="spin" size={20} /> : "Send link"}
              </button>
              <button type="button" className="link-btn auth-switch" onClick={() => onModeChange("login")}>
                Back to login
              </button>
            </>
          )}

          {message && (
            <p className={`auth-message ${message.toLowerCase().includes("sent") ? "auth-message--success" : ""}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
