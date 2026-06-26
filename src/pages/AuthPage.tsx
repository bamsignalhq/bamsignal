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
  loginWithPin,
  checkSignupAvailability,
  checkSignupField,
  completePinReset,
  requestSignupMathChallenge,
  resendSignupEmailCode,
  sendPinResetCode,
  sendSignupEmailCode,
  verifySignupEmailCode,
  AuthEmailError
} from "../services/authEmail";
import { USER_MESSAGES } from "../constants/userMessages";
import { flowLog } from "../utils/flowLog";
import { trackEvent } from "../utils/analytics";
import {
  formatUsernameInput,
  isLikelyEmail,
  isStrongPin,
  isValidLoginUsername,
  isValidNigerianPhone,
  isValidSignupUsername,
  normalizeNigerianPhone,
  normalizeUsername,
  rememberUsernameEmail,
  profileFromSessionUser,
  resolveMemberIdentity
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
import { ResendCooldown } from "../components/ResendCooldown";
import { AccountRestoreModal } from "../components/AccountRestoreModal";
import {
  sendLogin2faRemote,
  verifyLogin2faRemote
} from "../services/accountSecurity";
import { fetchAccountStateRemote, restoreAccountRemote } from "../services/memberTrust";
import { clearOtpVerifyPending, markOtpVerifyPending } from "../utils/bootFlags";

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
  name: "",
  username: "",
  phone: "",
  email: "",
  pin: "",
  confirmPin: ""
};

const OTP_LENGTH = 6;
const OTP_VERIFY_TIMEOUT_MS = 15_000;
const RESEND_COOLDOWN_SEC = 60;
const FIELD_CHECK_DELAY_MS = 450;

type SignupField = "email" | "phone" | "username";
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
      codeSentAt: Date.now()
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
    legalAccepted: false,
    verifyCode,
    codeSentAt: codeSentAt ?? Date.now()
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
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
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
  const [resetStep, setResetStep] = useState<"email" | "code">("email");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPin, setResetNewPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");
  const [resetCodeSentAt, setResetCodeSentAt] = useState(0);
  const resetOtpRef = useRef<HTMLInputElement | null>(null);
  const [pendingSignup, setPendingSignup] = useState<UserProfile | null>(restored.current.pendingSignup);
  const [codeSentAt, setCodeSentAt] = useState(restored.current.codeSentAt);
  const [pendingAuthProfile, setPendingAuthProfile] = useState<UserProfile | null>(null);
  const [login2faOpen, setLogin2faOpen] = useState(false);
  const [login2faMethod, _setLogin2faMethod] = useState<"email" | "whatsapp">("email");
  const [login2faMaskedEmail, _setLogin2faMaskedEmail] = useState<string | null>(null);
  const [login2faMaskedPhone, _setLogin2faMaskedPhone] = useState<string | null>(null);
  const [login2faMessage, setLogin2faMessage] = useState("");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreScheduledFor, setRestoreScheduledFor] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const verifyInFlight = useRef(false);
  const verifyPersistTimer = useRef<number | null>(null);

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
    if (mode !== "reset" || resetStep !== "code") return;
    window.requestAnimationFrame(() => {
      resetOtpRef.current?.focus({ preventScroll: true });
    });
  }, [mode, resetStep]);

  useEffect(() => {
    if (mode !== "reset") {
      setResetStep("email");
      setResetCode("");
      setResetNewPin("");
      setResetConfirmPin("");
      setResetCodeSentAt(0);
    }
  }, [mode]);

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
    if (mode !== "verify" || pendingSignup?.email || restored.current.pendingSignup?.email) return;
    onMessage("Your verification session expired. Please sign up again.");
    onModeChange("signup");
  }, [mode, pendingSignup?.email, onModeChange, onMessage]);

  useEffect(
    () => () => {
      if (verifyPersistTimer.current !== null) {
        window.clearTimeout(verifyPersistTimer.current);
      }
    },
    []
  );

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
          if (error instanceof AuthEmailError) {
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

  const signIn = async () => {
    const username = normalizeUsername(loginForm.username.trim());
    if (!isValidLoginUsername(username)) {
      onMessage("Enter a valid username.");
      return;
    }
    if (!loginForm.password) {
      onMessage("Enter your PIN.");
      return;
    }

    setBusy("login");
    onMessage("");
    try {
      if (matchDemoUser(username, loginForm.password)) {
        rememberUsernameEmail(DEMO_USER.username, DEMO_USER.profile.email);
        seedDemoMemberProfile();
        await completeAuthenticated(DEMO_USER.profile, { isNewSignup: false });
        return;
      }

      const loginResult = await loginWithPin(username, loginForm.password);
      if (loginResult.ok && loginResult.session && supabase) {
        const { data, error } = await supabase.auth.setSession({
          access_token: loginResult.session.access_token,
          refresh_token: loginResult.session.refresh_token
        });
        if (error) throw error;
        const profile = profileFromSessionUser(data.user!);
        const resolvedEmail = loginResult.email || profile.email;
        if (resolvedEmail) {
          rememberUsernameEmail(username, resolvedEmail);
        }
        const loginProfile = resolveMemberIdentity(
          { ...profile, username: profile.username || username },
          { loginEmail: loginResult.email }
        );
        await proceedAfterSecurityChecks(loginProfile, {
          isNewSignup: false,
          loginEmail: resolvedEmail || undefined
        });
        return;
      }

      onMessage(loginResult.error || "Invalid username or PIN.");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const validateSignup = (): boolean => {
    const name = signupForm.name.trim();
    const username = normalizeUsername(signupForm.username);
    const email = signupForm.email.trim().toLowerCase();
    const phone = phoneDigits(signupForm.phone);
    onMessage("");

    if (name.length < 2) {
      onMessage("Enter your full name.");
      signupLog("signup-validation", { reason: "name" });
      return false;
    }
    if (!isValidSignupUsername(username)) {
      onMessage("Username must be at least 4 characters (letters, numbers, underscore).");
      signupLog("signup-validation", { reason: "username_format" });
      return false;
    }
    if (signupFieldErrors.username) {
      onMessage(signupFieldErrors.username);
      signupLog("signup-validation", { reason: "username_taken" });
      return false;
    }
    if (signupFieldChecking.username) {
      onMessage("Still checking your username — wait a moment.");
      return false;
    }
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
      onMessage("One moment…");
      void loadMathChallenge();
      return false;
    }
    const parsed = Number.parseInt(mathAnswer.trim(), 10);
    if (!Number.isFinite(parsed) || parsed !== mathChallenge.a + mathChallenge.b) {
      setMathError("Please answer correctly.");
      signupLog("signup-validation", { reason: "math" });
      return false;
    }
    setMathError("");
    return true;
  };

  const signUp = async () => {
    if (!validateSignup()) return;

    const name = signupForm.name.trim();
    const username = normalizeUsername(signupForm.username);
    const email = signupForm.email.trim().toLowerCase();
    const phone = phoneDigits(signupForm.phone);

    setBusy("signup");
    onMessage("");
    trackEvent("signup_started");
    signupLog("signup-submit");

    const profile: UserProfile = { name, username, email, phone };

    try {
      if (!supabase) {
        throw new Error("Authentication is not configured. Please update the app and try again.");
      }

      if (!mathChallenge) {
        throw new Error("Please answer correctly.");
      }

      await checkSignupAvailability({ email, phone, username });
      signupLog("otp-send");
      flowLog("otp_send_start");
      await sendSignupEmailCode(email, name, { phone, username }, {
        legalAccepted: true,
        mathToken: mathChallenge.token,
        mathAnswer: mathAnswer.trim()
      });
      flowLog("otp_send_ok");
      rememberUsernameEmail(username, email);
      setVerifyCode("");
      setCodeSentAt(Date.now());
      setPendingSignup(profile);
      clearSignupDraft();
      if (!savePendingSignup({ profile, pin: signupForm.pin, verifyCode: "" })) {
        onMessage(USER_MESSAGES.progressSaveFailed);
      }
      onModeChange("verify");
      return;
    } catch (error) {
      if (error instanceof AuthEmailError) {
        if (error.field === "email" || error.field === "phone" || error.field === "username") {
          setSignupFieldError(error.field, error.message);
        }
        if (error.kind === "exists") {
          clearPendingSignup();
          onModeChange("signup");
        }
        if (error.code === "challenge_expired" || /quick check|answer correctly/i.test(error.message)) {
          setMathError(
            error.code === "challenge_expired"
              ? "This quick check expired. Please try again."
              : "Please answer correctly."
          );
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
    markOtpVerifyPending();
    let timedOut = false;
    const timeoutTimer = window.setTimeout(() => {
      timedOut = true;
      verifyInFlight.current = false;
      setBusy(null);
      clearOtpVerifyPending();
      onMessage(USER_MESSAGES.otpVerifySlow);
      focusOtpInput();
      otpInputRef.current?.select();
    }, OTP_VERIFY_TIMEOUT_MS);
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
      if (timedOut) return;
      flowLog("otp_verified", {
        recovered: Boolean(verifyResult.recovered),
        onboardingComplete: Boolean(verifyResult.onboardingComplete)
      });

      flowLog("session_create_start");
      let sessionUser = null;
      if (verifyResult.session && supabase) {
        const { data, error } = await supabase.auth.setSession({
          access_token: verifyResult.session.access_token,
          refresh_token: verifyResult.session.refresh_token
        });
        if (timedOut) return;
        if (error) throw error;
        sessionUser = data.user;
        flowLog("session_create_success");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: pendingSignup.email,
          password: signupForm.pin
        });
        if (timedOut) return;
        if (error || !data.user) throw error || new Error(USER_MESSAGES.signupCompleteFailed);
        sessionUser = data.user;
        flowLog("session_create_success");
      }

      if (timedOut) return;
      if (!sessionUser) {
        throw new Error(USER_MESSAGES.signupCompleteFailed);
      }
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
      if (timedOut) return;
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
      window.clearTimeout(timeoutTimer);
      if (timedOut) return;
      verifyInFlight.current = false;
      setBusy(null);
      clearOtpVerifyPending();
    }
  };

  const handleOtpChange = (cleaned: string) => {
    setVerifyCode(cleaned);
    if (verifyPersistTimer.current !== null) {
      window.clearTimeout(verifyPersistTimer.current);
    }
    verifyPersistTimer.current = window.setTimeout(() => {
      touchPendingVerifyCode(cleaned);
      verifyPersistTimer.current = null;
    }, cleaned.length === OTP_LENGTH ? 0 : 280);
    if (cleaned.length === OTP_LENGTH) {
      void verifySignup(cleaned);
    }
  };

  const resendVerification = async () => {
    if (!pendingSignup?.email || resendCooldownRemaining(codeSentAt, RESEND_COOLDOWN_SEC) > 0) return;
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
      setCodeSentAt(Date.now());
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
    const email = resetEmail.trim().toLowerCase();
    if (!isLikelyEmail(email)) {
      onMessage("Enter a valid email.");
      return;
    }

    setBusy("reset");
    onMessage("");
    try {
      await sendPinResetCode(email);
      setResetEmail(email);
      setResetStep("code");
      setResetCode("");
      setResetCodeSentAt(Date.now());
      onMessage("If an account exists for this email, we sent a reset code.");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const resendResetCode = async () => {
    if (!resetEmail || resendCooldownRemaining(resetCodeSentAt, RESEND_COOLDOWN_SEC) > 0) return;
    setBusy("reset-resend");
    onMessage("");
    try {
      await sendPinResetCode(resetEmail);
      setResetCodeSentAt(Date.now());
      setResetCode("");
      onMessage("Fresh code sent — check your inbox.");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const submitPinReset = async () => {
    const email = resetEmail.trim().toLowerCase();
    if (!isLikelyEmail(email)) {
      onMessage("Enter a valid email.");
      return;
    }
    if (resetCode.length !== OTP_LENGTH) {
      onMessage("Enter the 6-digit code from your email.");
      return;
    }
    if (!isStrongPin(resetNewPin)) {
      onMessage("Choose a stronger 6-digit PIN (no repeats like 111111 or runs like 123456).");
      return;
    }
    if (resetNewPin !== resetConfirmPin) {
      onMessage("PINs don't match.");
      return;
    }

    setBusy("reset-complete");
    onMessage("");
    try {
      const result = await completePinReset(email, resetCode, resetNewPin);
      if (result.username) {
        rememberUsernameEmail(result.username, email);
      }
      onMessage("PIN updated. Log in with your username and new PIN.");
      setResetStep("email");
      setResetCode("");
      setResetNewPin("");
      setResetConfirmPin("");
      onModeChange("login");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main
      className={`auth-page ${embedded ? "auth-page--embedded" : ""} ${mode === "verify" ? "auth-page--verify" : ""} ${mode === "login" ? "auth-page--login" : ""} ${mode === "signup" ? "auth-page--signup" : ""} ${mode === "reset" ? "auth-page--reset" : ""}`.trim()}
    >
      <div className="auth-shell">
        <div className="auth-shell__glow" aria-hidden />
        <div className="auth-card auth-card--fintech">
          {mode !== "signup" && (
            <div className="auth-brand">
              {onLogoClick ? (
                <button type="button" className="auth-brand-btn" onClick={onLogoClick} aria-label="Back to BamSignal home">
                  <AppLogo size="lg" />
                </button>
              ) : (
                <AppLogo size="lg" />
              )}
            </div>
          )}

          {mode === "login" && (
            <>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-sub">Good to have you back ❤️</p>
              <div className="auth-login-main">
                <div className="auth-fields">
                  <AuthField
                    label="Username"
                    value={loginForm.username}
                    onChange={(value) => {
                      setLoginForm({ ...loginForm, username: formatUsernameInput(value.trim()) });
                    }}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={120}
                    className="auth-field--centered auth-field--login"
                  />
                  <AuthField
                    label="PIN"
                    value={loginForm.password}
                    onChange={(password) => setLoginForm({ ...loginForm, password: pinDigits(password) })}
                    pin
                    maxLength={6}
                    autoComplete="current-password"
                    className="auth-field--centered auth-field--login"
                  />
                </div>
                <button type="button" className="btn-primary btn-full btn-auth" onClick={signIn} disabled={busy === "login"}>
                  {busy === "login" ? <Loader2 className="spin" size={20} /> : "Login"}
                </button>
              </div>
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
              <div className="auth-signup-header">
                <div className="auth-brand auth-brand--compact">
                  {onLogoClick ? (
                    <button
                      type="button"
                      className="auth-brand-btn"
                      onClick={onLogoClick}
                      aria-label="Back to BamSignal home"
                    >
                      <AppLogo size="md" />
                    </button>
                  ) : (
                    <AppLogo size="md" />
                  )}
                </div>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-sub auth-sub--compact">Let&apos;s get you started — it only takes a minute.</p>
              </div>
              <div className="auth-signup-body">
                <div className="auth-fields">
                  <AuthField
                    label="Full name"
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
                    onRefresh={() => void loadMathChallenge()}
                    error={mathError}
                    disabled={mathLoading || busy === "signup"}
                    refreshing={mathLoading}
                  />
                ) : mathLoading ? (
                  <p className="auth-message auth-message--inline">One moment…</p>
                ) : null}
              </div>

              <div className="auth-signup-footer">
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
              </div>
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
                  <ResendCooldown
                    codeSentAt={codeSentAt}
                    cooldownSec={RESEND_COOLDOWN_SEC}
                    busy={busy === "resend"}
                    onResend={() => void resendVerification()}
                  />
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

          {mode === "reset" && resetStep === "email" && (
            <>
              <h1 className="auth-title">Reset PIN</h1>
              <p className="auth-sub">We&apos;ll email a code to the address on your account.</p>
              <div className="auth-reset-main">
                <AuthField
                  label="Email"
                  value={resetEmail}
                  onChange={setResetEmail}
                  type="email"
                  autoComplete="email"
                />
                {message ? (
                  <p
                    className={`auth-message ${message.toLowerCase().includes("sent") ? "auth-message--success" : ""}`}
                    role="status"
                  >
                    {message}
                  </p>
                ) : null}
                <button type="button" className="btn-primary btn-full btn-auth" onClick={sendReset} disabled={busy === "reset"}>
                  {busy === "reset" ? <Loader2 className="spin" size={20} /> : "Send code"}
                </button>
              </div>
              <div className="auth-reset-footer">
                <button type="button" className="auth-switch" onClick={() => onModeChange("login")}>
                  <span className="auth-switch__lead">Remember your PIN?</span>
                  <span className="auth-switch__action">Back to login</span>
                </button>
              </div>
            </>
          )}

          {mode === "reset" && resetStep === "code" && (
            <>
              <div className="auth-reset-body auth-reset-body--code">
                <div className="auth-verify auth-verify--reset">
                  <div className="auth-verify__hero">
                    <div className="auth-verify__icon-ring" aria-hidden>
                      <div className="auth-verify__icon">
                        <Mail size={26} strokeWidth={2.2} />
                      </div>
                    </div>
                    <p className="auth-verify__step">Reset your PIN</p>
                    <h1 className="auth-title auth-verify__title">Check your email</h1>
                    <p className="auth-verify__lede">
                      Sent to <strong>{maskEmail(resetEmail)}</strong>
                    </p>
                  </div>

                  <label
                    className="auth-verify__otp-field"
                    onClick={(event) => {
                      if (event.target === event.currentTarget) {
                        resetOtpRef.current?.focus({ preventScroll: true });
                      }
                    }}
                  >
                    <span className="auth-verify__otp-label">Reset code</span>
                    <OtpCodeInput
                      ref={resetOtpRef}
                      className="auth-verify__code-input"
                      value={resetCode}
                      verifying={busy === "reset-complete"}
                      onChange={setResetCode}
                      aria-label="PIN reset code"
                    />
                  </label>

                  {message ? (
                    <p
                      className={`auth-message auth-verify__message ${
                        message.toLowerCase().includes("sent") || message.toLowerCase().includes("updated")
                          ? "auth-message--success"
                          : ""
                      }`}
                      role="status"
                    >
                      {message}
                    </p>
                  ) : null}

                  <div className="auth-fields">
                    <AuthField
                      label="New PIN"
                      value={resetNewPin}
                      onChange={(pin) => setResetNewPin(pinDigits(pin))}
                      pin
                      maxLength={6}
                      autoComplete="new-password"
                    />
                    <AuthField
                      label="Confirm PIN"
                      value={resetConfirmPin}
                      onChange={(pin) => setResetConfirmPin(pinDigits(pin))}
                      pin
                      maxLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="auth-reset-footer auth-reset-footer--code">
                <button
                  type="button"
                  className="btn-primary btn-full btn-auth auth-verify__submit"
                  onClick={submitPinReset}
                  disabled={
                    busy === "reset-complete" ||
                    resetCode.length !== OTP_LENGTH ||
                    resetNewPin.length !== OTP_LENGTH ||
                    resetConfirmPin.length !== OTP_LENGTH
                  }
                >
                  {busy === "reset-complete" ? <Loader2 className="spin" size={20} /> : "Save new PIN"}
                </button>

                <div className="auth-verify__meta">
                  <p className="auth-verify__hint">
                    <ShieldCheck size={15} aria-hidden />
                    If you don&apos;t see it within a minute, check your spam folder.
                  </p>
                  <p className="auth-verify__resend">
                    <ResendCooldown
                      codeSentAt={resetCodeSentAt}
                      cooldownSec={RESEND_COOLDOWN_SEC}
                      busy={busy === "reset-resend"}
                      onResend={() => void resendResetCode()}
                    />
                  </p>
                  <button
                    type="button"
                    className="link-btn auth-verify__back"
                    onClick={() => {
                      setResetStep("email");
                      setResetCode("");
                      setResetNewPin("");
                      setResetConfirmPin("");
                      onMessage("");
                    }}
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            </>
          )}

          {message && mode !== "verify" && mode !== "reset" ? (
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
