import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { AuthField } from "../components/AuthField";
import { OtpCodeInput } from "../components/OtpCodeInput";
import { SignupLegalCheckboxes, isSignupLegalComplete } from "../components/SignupLegalCheckboxes";
import { SignupMathGate } from "../components/SignupMathGate";
import type { AuthMeta, AuthMode, UserProfile } from "../types";
import { DEMO_USER, matchDemoUser, seedDemoMemberProfile } from "../constants/demoAccounts";
import { DISPOSABLE_EMAIL_MESSAGE, isDisposableEmail } from "../constants/blockedEmailDomains";
import { friendlyAuthError, supabase } from "../services/supabase";
import {
  resolveLoginEmail,
  checkSignupAvailability,
  checkSignupField,
  requestSignupMathChallenge,
  resendSignupEmailCode,
  resolveSignupUsername,
  sendSignupEmailCode,
  verifySignupEmailCode,
  AuthEmailError
} from "../services/authEmail";
import { USER_MESSAGES } from "../constants/userMessages";
import { flowLog } from "../utils/flowLog";
import { trackEvent } from "../utils/analytics";
import {
  emailForUsername,
  formatUsernameInput,
  isLikelyEmail,
  isStrongPin,
  isValidLoginUsername,
  isValidNigerianPhone,
  isValidPin,
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
import { clearSignupDraft, loadSignupDraft, saveSignupDraft } from "../utils/signupDraft";
import { signupLog } from "../utils/signupLog";
import { mergeLocalCompliance, saveComplianceAcknowledgements } from "../services/compliance";
import { signupLegalAckTypes } from "../utils/compliance";
import { Login2faModal } from "../components/Login2faModal";
import { AccountRestoreModal } from "../components/AccountRestoreModal";
import {
  checkLogin2faRemote,
  sendLogin2faRemote,
  verifyLogin2faRemote
} from "../services/accountSecurity";
import { fetchAccountStateRemote, restoreAccountRemote } from "../services/memberTrust";

type AuthPageProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void | Promise<void>;
  message?: string;
  onMessage: (msg: string) => void;
  embedded?: boolean;
  onLogoClick?: () => void;
};

const emptySignup = {
  phone: "",
  email: "",
  pin: "",
  confirmPin: ""
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;
const FIELD_CHECK_DELAY_MS = 450;

type SignupField = "email" | "phone";
type SignupFieldErrors = Partial<Record<SignupField, string>>;
type SignupFieldChecking = Partial<Record<SignupField, boolean>>;

function restoredSignupState() {
  const pending = loadPendingSignup();
  const draft = pending ? null : loadSignupDraft();
  if (!pending) {
    return {
      pendingSignup: null as UserProfile | null,
      signupForm: draft?.form ?? emptySignup,
      legalAccepted: Boolean(draft?.legalAccepted),
      verifyCode: "",
      resendIn: 0
    };
  }

  const { profile, pin, verifyCode = "", codeSentAt } = pending;
  return {
    pendingSignup: profile,
    signupForm: {
      ...emptySignup,
      phone: profile.phone || "",
      email: profile.email || "",
      pin,
      confirmPin: pin
    },
    legalAccepted: false,
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
  embedded,
  onLogoClick
}: AuthPageProps) {
  const restored = useRef(restoredSignupState());
  const [busy, setBusy] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", pin: "" });
  const [signupForm, setSignupForm] = useState(restored.current.signupForm);
  const [signupFieldErrors, setSignupFieldErrors] = useState<SignupFieldErrors>({});
  const [signupFieldChecking, setSignupFieldChecking] = useState<SignupFieldChecking>({});
  const [verifyCode, setVerifyCode] = useState(restored.current.verifyCode);
  const [legalAccepted, setLegalAccepted] = useState(restored.current.legalAccepted);
  const [mathChallenge, setMathChallenge] = useState<{ token: string; a: number; b: number } | null>(null);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathError, setMathError] = useState("");
  const [mathLoading, setMathLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [pendingSignup, setPendingSignup] = useState<UserProfile | null>(restored.current.pendingSignup);
  const [resendIn, setResendIn] = useState(restored.current.resendIn);
  const [pendingAuthProfile, setPendingAuthProfile] = useState<UserProfile | null>(null);
  const [login2faOpen, setLogin2faOpen] = useState(false);
  const [login2faMethod, setLogin2faMethod] = useState<"email" | "whatsapp">("email");
  const [login2faMaskedEmail, setLogin2faMaskedEmail] = useState<string | null>(null);
  const [login2faMaskedPhone, setLogin2faMaskedPhone] = useState<string | null>(null);
  const [login2faMessage, setLogin2faMessage] = useState("");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreScheduledFor, setRestoreScheduledFor] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const verifyInFlight = useRef(false);

  const phoneDigits = (value: string) => normalizeNigerianPhone(value);
  const pinDigits = (value: string) => value.replace(/\D/g, "").slice(0, 6);

  const focusOtpInput = () => {
    window.requestAnimationFrame(() => {
      otpInputRef.current?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (mode !== "verify" || !pendingSignup?.email) return;
    focusOtpInput();
  }, [mode, pendingSignup?.email]);

  useEffect(() => {
    if (mode !== "verify") return;

    const refocusAfterEmailApp = () => {
      if (document.visibilityState !== "visible") return;
      const active = document.activeElement;
      if (active === otpInputRef.current) return;
      if (active && active !== document.body) return;
      focusOtpInput();
    };

    document.addEventListener("visibilitychange", refocusAfterEmailApp);
    return () => document.removeEventListener("visibilitychange", refocusAfterEmailApp);
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
    if (mode !== "signup") return;
    saveSignupDraft({ form: signupForm, legalAccepted });
  }, [mode, signupForm, legalAccepted]);

  useEffect(() => {
    if (mode !== "signup") return;
    setMathChallenge(null);
    setMathAnswer("");
    setMathError("");
  }, [mode]);

  const loadMathChallenge = useCallback(async () => {
    setMathLoading(true);
    setMathError("");
    try {
      const challenge = await requestSignupMathChallenge();
      setMathChallenge(challenge);
      setMathAnswer("");
      signupLog("signup-validation", { event: "math_challenge_loaded" });
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "We couldn't load the quick check. Please try again.");
    } finally {
      setMathLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    if (mode !== "signup") return;
    if (mathChallenge) return;
    void loadMathChallenge();
  }, [mode, mathChallenge, loadMathChallenge]);

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
          if (error instanceof AuthEmailError) {
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

    if (isDisposableEmail(email)) {
      setSignupFieldError("email", DISPOSABLE_EMAIL_MESSAGE);
      setSignupFieldChecking((current) => ({ ...current, email: false }));
      signupLog("signup-validation", { event: "disposable_email_blocked" });
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
          if (error instanceof AuthEmailError) {
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

  const completeAuthenticated = async (profile: UserProfile, meta?: AuthMeta) => {
    await onAuthenticated(profile, meta);
    setPendingAuthProfile(null);
    setLogin2faOpen(false);
    setRestoreOpen(false);
  };

  const proceedAfterSecurityChecks = async (profile: UserProfile, meta?: AuthMeta) => {
    const state = await fetchAccountStateRemote(profile);
    if (state?.accountStatus === "deleted_pending") {
      setPendingAuthProfile(profile);
      setRestoreScheduledFor(state.accountDeleteScheduledFor ?? null);
      setRestoreOpen(true);
      return;
    }
    await completeAuthenticated(profile, meta);
  };

  const finishLoginAfterPassword = async (profile: UserProfile, meta?: AuthMeta) => {
    setPendingAuthProfile(profile);
    const check = await checkLogin2faRemote(profile);
    if (check.required) {
      setLogin2faMethod(check.method || "email");
      setLogin2faMaskedEmail(check.maskedEmail ?? null);
      setLogin2faMaskedPhone(check.maskedPhone ?? null);
      setLogin2faMessage("");
      setLogin2faOpen(true);
      try {
        await sendLogin2faRemote(profile);
      } catch (error) {
        setLogin2faMessage(error instanceof Error ? error.message : "We couldn't verify this login. Please try again.");
      }
      return;
    }
    await proceedAfterSecurityChecks(profile, meta);
  };

  const signIn = async () => {
    const identity = loginForm.username.trim().toLowerCase();
    const username = normalizeUsername(loginForm.username);
    if (!isValidPin(loginForm.pin)) {
      onMessage("Enter your PIN.");
      return;
    }

    setBusy("login");
    onMessage("");
    try {
      if (!isLikelyEmail(identity) && isValidLoginUsername(username) && matchDemoUser(username, loginForm.pin)) {
        rememberUsernameEmail(DEMO_USER.username, DEMO_USER.profile.email);
        seedDemoMemberProfile();
        await completeAuthenticated(DEMO_USER.profile, { isNewSignup: false });
        return;
      }

      let email: string | null = null;
      if (isLikelyEmail(identity)) {
        email = identity;
      } else if (!isValidLoginUsername(username)) {
        onMessage("Enter a valid username or email.");
        return;
      } else {
        email = emailForUsername(username) ?? (await resolveLoginEmail(username));
      }

      if (supabase && email) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: loginForm.pin
        });
        if (error) throw error;
        const profile = profileFromSessionUser(data.user!);
        if (!isLikelyEmail(identity) && username) {
          rememberUsernameEmail(username, email);
        }
        await finishLoginAfterPassword(profile, { isNewSignup: false });
        return;
      }

      onMessage("Account not found. Check your username and PIN.");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const validateSignup = (): boolean => {
    const email = signupForm.email.trim().toLowerCase();
    const phone = phoneDigits(signupForm.phone);
    onMessage("");

    if (!isValidNigerianPhone(phone)) {
      onMessage("Put your correct WhatsApp number.");
      signupLog("signup-validation", { reason: "phone_format" });
      return false;
    }
    if (!isLikelyEmail(email)) {
      onMessage("Enter a valid email.");
      signupLog("signup-validation", { reason: "email_format" });
      return false;
    }
    if (isDisposableEmail(email)) {
      setSignupFieldError("email", DISPOSABLE_EMAIL_MESSAGE);
      onMessage(DISPOSABLE_EMAIL_MESSAGE);
      signupLog("signup-validation", { reason: "disposable_email" });
      return false;
    }
    if (signupFieldErrors.phone || signupFieldErrors.email) {
      onMessage(signupFieldErrors.phone || signupFieldErrors.email || "Fix the highlighted fields.");
      signupLog("signup-validation", { reason: "field_error" });
      return false;
    }
    if (signupFieldChecking.phone || signupFieldChecking.email) {
      onMessage("Still checking your details — wait a moment.");
      signupLog("signup-validation", { reason: "field_checking" });
      return false;
    }
    if (!isStrongPin(signupForm.pin)) {
      onMessage("Choose a 6-digit PIN without repeats or sequences like 123456.");
      signupLog("signup-validation", { reason: "pin_weak" });
      return false;
    }
    if (signupForm.pin !== signupForm.confirmPin) {
      onMessage("PINs do not match.");
      signupLog("signup-validation", { reason: "pin_mismatch" });
      return false;
    }
    if (!isSignupLegalComplete(legalAccepted)) {
      onMessage("Please accept the terms to continue.");
      signupLog("signup-validation", { reason: "legal" });
      return false;
    }
    if (!mathChallenge) {
      onMessage("Loading quick check — wait a moment.");
      void loadMathChallenge();
      return false;
    }
    const parsed = Number.parseInt(mathAnswer.trim(), 10);
    if (!Number.isFinite(parsed) || parsed !== mathChallenge.a + mathChallenge.b) {
      setMathError("Please answer the quick check correctly.");
      onMessage("Please answer the quick check correctly.");
      signupLog("signup-validation", { reason: "math" });
      return false;
    }
    setMathError("");
    return true;
  };

  const signUp = async () => {
    if (!validateSignup()) return;

    const email = signupForm.email.trim().toLowerCase();
    const phone = phoneDigits(signupForm.phone);

    setBusy("signup");
    onMessage("");
    trackEvent("signup_started");
    signupLog("signup-submit");

    try {
      if (!supabase) {
        throw new Error("Authentication is not configured. Please update the app and try again.");
      }

      if (!mathChallenge) {
        throw new Error("Please answer the quick check correctly.");
      }

      const username = await resolveSignupUsername(email);
      const profile: UserProfile = { name: "", username, email, phone };

      await checkSignupAvailability({ email, phone, username });
      signupLog("otp-send");
      flowLog("otp_send_start");
      await sendSignupEmailCode(email, "", { phone, username }, {
        legalAccepted: true,
        mathToken: mathChallenge.token,
        mathAnswer: mathAnswer.trim()
      });
      flowLog("otp_send_ok");
      rememberUsernameEmail(username, email);
      setVerifyCode("");
      setResendIn(RESEND_COOLDOWN_SEC);
      setPendingSignup(profile);
      clearSignupDraft();
      if (!savePendingSignup({ profile, pin: signupForm.pin, verifyCode: "" })) {
        onMessage(USER_MESSAGES.progressSaveFailed);
      }
      onModeChange("verify");
      return;
    } catch (error) {
      if (error instanceof AuthEmailError) {
        if (error.field === "email" || error.field === "phone") {
          setSignupFieldError(error.field, error.message);
        }
        if (error.kind === "exists") {
          clearPendingSignup();
          onModeChange("signup");
        }
        if (/quick check/i.test(error.message)) {
          setMathError(error.message);
          void loadMathChallenge();
        }
      }
      onMessage(friendlyAuthError(error));
      signupLog("signup-submit", { failed: true });
    } finally {
      setBusy(null);
    }
  };

  const verifySignup = async (code = verifyCode) => {
    if (!pendingSignup || code.length !== OTP_LENGTH || verifyInFlight.current) return;
    verifyInFlight.current = true;
    setBusy("verify");
    onMessage("");
    try {
      if (!supabase) {
        throw new Error("Authentication is not configured. Please update the app and try again.");
      }

      flowLog("otp_verify_start");
      const verifyResult = await verifySignupEmailCode({
        email: pendingSignup.email,
        code,
        password: signupForm.pin,
        name: pendingSignup.name,
        username: pendingSignup.username || "",
        phone: pendingSignup.phone || ""
      });
      flowLog("otp_verified", {
        recovered: Boolean(verifyResult.recovered),
        onboardingComplete: Boolean(verifyResult.onboardingComplete)
      });

      flowLog("session_create_start");
      let sessionUser = null;
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: pendingSignup.email,
          password: signupForm.pin
        });
        if (!error && data.user) {
          sessionUser = data.user;
          break;
        }
        lastError = error;
        flowLog("session_create_retry", { attempt: attempt + 1, reason: error?.message || "unknown" });
        if (attempt < 3) {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
        }
      }

      if (!sessionUser) {
        flowLog("session_create_failed", {
          reason: lastError instanceof Error ? lastError.message : "sign_in_failed"
        });
        throw lastError || new Error(USER_MESSAGES.signupCompleteFailed);
      }

      flowLog("session_create_success");
      clearPendingSignup();
      const profile = profileFromSessionUser(sessionUser);
      mergeLocalCompliance(signupLegalAckTypes());
      void saveComplianceAcknowledgements(profile, signupLegalAckTypes());
      await onAuthenticated(profile, {
        isNewSignup: !verifyResult.onboardingComplete,
        recovered: verifyResult.recovered
      });
      if (!verifyResult.onboardingComplete) {
        flowLog("redirect_onboarding");
      } else {
        flowLog("redirect_home");
      }
    } catch (error) {
      if (error instanceof AuthEmailError && error.kind === "exists") {
        clearPendingSignup();
        setPendingSignup(null);
        onModeChange("signup");
      }
      if (import.meta.env.DEV && error instanceof Error) {
        flowLog("signup_verify_failed", { reason: error.message });
      }
      onMessage(
        error instanceof AuthEmailError && error.kind === "validation"
          ? USER_MESSAGES.otpVerifyFailed
          : friendlyAuthError(error)
      );
      focusOtpInput();
      otpInputRef.current?.select();
    } finally {
      verifyInFlight.current = false;
      setBusy(null);
    }
  };

  const handleOtpChange = (cleaned: string) => {
    setVerifyCode(cleaned);
    touchPendingVerifyCode(cleaned);
    if (cleaned.length === OTP_LENGTH) {
      void verifySignup(cleaned);
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

      await resendSignupEmailCode(pendingSignup.email, pendingSignup.name, {
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
            {onLogoClick ? (
              <button type="button" className="auth-brand-btn" onClick={onLogoClick} aria-label="Back to BamSignal home">
                <AppLogo size="lg" />
              </button>
            ) : (
              <AppLogo size="lg" />
            )}
          </div>

          {mode === "login" && (
            <>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-sub">Good to have you back ❤️</p>
              <div className="auth-fields">
                <AuthField
                  label="Username or email"
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
                <button type="button" className="auth-link-secondary" onClick={() => onModeChange("reset")}>
                  Forgot PIN?
                </button>
                <button type="button" className="auth-switch auth-switch--inline" onClick={() => onModeChange("signup")}>
                  <span className="auth-switch__lead">New here?</span>
                  <span className="auth-switch__action">Create account</span>
                </button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <>
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-sub">Verify your email, then finish your profile.</p>
              <div className="auth-fields">
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
                  onChange={(confirmPin) =>
                    setSignupForm({ ...signupForm, confirmPin: pinDigits(confirmPin) })
                  }
                  pin
                  maxLength={6}
                  autoComplete="new-password"
                />
              </div>

              <SignupLegalCheckboxes accepted={legalAccepted} onChange={setLegalAccepted} />

              {mathChallenge ? (
                <SignupMathGate
                  a={mathChallenge.a}
                  b={mathChallenge.b}
                  answer={mathAnswer}
                  onAnswerChange={(value) => {
                    setMathAnswer(value);
                    setMathError("");
                  }}
                  error={mathError}
                  disabled={mathLoading || busy === "signup"}
                />
              ) : mathLoading ? (
                <p className="auth-message auth-message--inline">Loading quick check…</p>
              ) : null}

              <button
                type="button"
                className="btn-primary btn-full btn-auth"
                onClick={() => void signUp()}
                disabled={
                  busy === "signup" ||
                  !isSignupLegalComplete(legalAccepted) ||
                  mathLoading
                }
              >
                {busy === "signup" ? <Loader2 className="spin" size={20} /> : "Continue"}
              </button>
              <button
                type="button"
                className="auth-switch"
                onClick={() => {
                  clearSignupDraft();
                  onModeChange("login");
                }}
              >
                <span className="auth-switch__lead">Already have an account?</span>
                <span className="auth-switch__action">Log in</span>
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

              <label
                className="auth-verify__otp-field"
                onClick={(event) => {
                  if (event.target === event.currentTarget) focusOtpInput();
                }}
              >
                <span className="auth-verify__otp-label">Verification code</span>
                <OtpCodeInput
                  ref={otpInputRef}
                  className="auth-verify__code-input"
                  value={verifyCode}
                  verifying={busy === "verify"}
                  onChange={handleOtpChange}
                />
              </label>

              {message ? (
                <p
                  className={`auth-message auth-verify__message ${
                    message.toLowerCase().includes("sent") ? "auth-message--success" : ""
                  }`}
                  role="status"
                >
                  {message}
                </p>
              ) : null}

              <button
                type="button"
                className="btn-primary btn-full btn-auth auth-verify__submit"
                onClick={() => verifySignup()}
                disabled={busy === "verify" || verifyCode.length !== OTP_LENGTH}
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
              <button type="button" className="auth-switch" onClick={() => onModeChange("login")}>
                <span className="auth-switch__lead">Remember your PIN?</span>
                <span className="auth-switch__action">Back to login</span>
              </button>
            </>
          )}

          {message && mode !== "verify" ? (
            <p className={`auth-message ${message.toLowerCase().includes("sent") ? "auth-message--success" : ""}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>

      <Login2faModal
        open={login2faOpen}
        method={login2faMethod}
        maskedEmail={login2faMaskedEmail}
        maskedPhone={login2faMaskedPhone}
        busy={busy === "login-2fa"}
        message={login2faMessage}
        onClose={() => {
          setLogin2faOpen(false);
          setPendingAuthProfile(null);
          void supabase?.auth.signOut();
        }}
        onResend={() => {
          if (!pendingAuthProfile) return;
          void (async () => {
            setBusy("login-2fa");
            setLogin2faMessage("");
            try {
              await sendLogin2faRemote(pendingAuthProfile);
              setLogin2faMessage("Code sent.");
            } catch (error) {
              setLogin2faMessage(
                error instanceof Error ? error.message : "We couldn't verify this login. Please try again."
              );
            } finally {
              setBusy(null);
            }
          })();
        }}
        onVerify={(code) => {
          if (!pendingAuthProfile) return;
          void (async () => {
            setBusy("login-2fa");
            setLogin2faMessage("");
            try {
              await verifyLogin2faRemote(pendingAuthProfile, code);
              setLogin2faOpen(false);
              await proceedAfterSecurityChecks(pendingAuthProfile, { isNewSignup: false });
            } catch (error) {
              setLogin2faMessage(
                error instanceof Error ? error.message : "We couldn't verify this login. Please try again."
              );
            } finally {
              setBusy(null);
            }
          })();
        }}
      />

      <AccountRestoreModal
        open={restoreOpen}
        scheduledFor={restoreScheduledFor}
        busy={busy === "restore"}
        onContinueDeletion={() => {
          setRestoreOpen(false);
          setPendingAuthProfile(null);
          void supabase?.auth.signOut();
          onMessage("Your account remains scheduled for deletion.");
        }}
        onRestore={() => {
          if (!pendingAuthProfile) return;
          void (async () => {
            setBusy("restore");
            const ok = await restoreAccountRemote(pendingAuthProfile);
            setBusy(null);
            if (!ok) {
              onMessage("We couldn't restore your account right now.");
              return;
            }
            setRestoreOpen(false);
            await completeAuthenticated(pendingAuthProfile, { isNewSignup: false, recovered: true });
            onMessage("Welcome back — your account is restored.");
          })();
        }}
      />
    </main>
  );
}
