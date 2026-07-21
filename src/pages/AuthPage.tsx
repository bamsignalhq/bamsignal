import { Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
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
  completeForgotUsername,
  requestSignupMathChallenge,
  resendSignupEmailCode,
  sendPinResetCode,
  sendForgotUsernameCode,
  sendSignupEmailCode,
  verifySignupEmailCode,
  AuthEmailError
} from "../services/authEmail";
import { USER_MESSAGES } from "../constants/userMessages";
import {
  buildLocalUsernameSuggestions,
  conflictMessageFor,
  type SignupConflict,
  type SignupConflictField
} from "../constants/signupConflicts";
import { SignupConflictActions } from "../components/SignupConflictActions";
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
import {
  getBiometricAvailability,
  getBiometricQuickLoginEmail,
  isBiometricQuickLoginEnabled,
  promptBiometricUnlock,
  setBiometricQuickLoginEnabled
} from "../native/biometrics";
import { isNativeApp } from "../native/platform";
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
import type { JourneyDraft } from "../types/journey";
import { applyJourneyDraftToSignupForm } from "../utils/journeyDraft";
import {
  JourneySecureExisting,
  JourneySecureForgotUsernameCode,
  JourneySecureForgotUsernameLookup,
  JourneySecureLogin,
  JourneySecureResetCode,
  JourneySecureResetEmail,
  JourneySecureSignup,
  JourneySecureVerify
} from "../components/journey/secure/JourneySecureAuthViews";

type AuthPageProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void | Promise<void>;
  message?: string;
  onMessage: (msg: string) => void;
  embedded?: boolean;
  onLogoClick?: () => void;
  journeyHandoff?: JourneyDraft | null;
  useJourneyShell?: boolean;
  onJourneyBack?: () => void;
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

type SignupField = SignupConflictField;
type SignupFieldErrors = Partial<Record<SignupField, string>>;
type SignupFieldChecking = Partial<Record<SignupField, boolean>>;
type SignupFieldAvailable = Partial<Record<SignupField, boolean>>;
type ExistingAccountState = {
  field: SignupField;
  email: string;
  username: string;
};

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
  onLogoClick,
  journeyHandoff = null,
  useJourneyShell = false,
  onJourneyBack
}: AuthPageProps) {
  const restored = useRef(restoredSignupState());
  const [busy, setBusy] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState(() =>
    applyJourneyDraftToSignupForm(restored.current.signupForm, journeyHandoff)
  );
  const [signupFieldErrors, setSignupFieldErrors] = useState<SignupFieldErrors>({});
  const [signupFieldChecking, setSignupFieldChecking] = useState<SignupFieldChecking>({});
  const [signupFieldAvailable, setSignupFieldAvailable] = useState<SignupFieldAvailable>({});
  const [signupConflicts, setSignupConflicts] = useState<SignupConflict[]>([]);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
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
  const [forgotLookup, setForgotLookup] = useState("");
  const [forgotStep, setForgotStep] = useState<"lookup" | "code" | "done">("lookup");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotDeliveryEmail, setForgotDeliveryEmail] = useState("");
  const [recoveredUsername, setRecoveredUsername] = useState("");
  const forgotOtpRef = useRef<HTMLInputElement | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingSignup, setPendingSignup] = useState<UserProfile | null>(restored.current.pendingSignup);
  const [codeSentAt, setCodeSentAt] = useState(restored.current.codeSentAt);
  const [existingAccount, setExistingAccount] = useState<ExistingAccountState | null>(null);
  const [pendingAuthProfile, setPendingAuthProfile] = useState<UserProfile | null>(null);
  const [login2faOpen, setLogin2faOpen] = useState(false);
  const [login2faMethod, _setLogin2faMethod] = useState<"email" | "whatsapp">("email");
  const [login2faMaskedEmail, _setLogin2faMaskedEmail] = useState<string | null>(null);
  const [login2faMaskedPhone, _setLogin2faMaskedPhone] = useState<string | null>(null);
  const [login2faMessage, setLogin2faMessage] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreScheduledFor, setRestoreScheduledFor] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const verifyInFlight = useRef(false);
  const verifyPersistTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!journeyHandoff?.name?.trim()) return;
    setSignupForm((current) => applyJourneyDraftToSignupForm(current, journeyHandoff));
  }, [journeyHandoff]);

  const phoneDigits = (value: string) => normalizeNigerianPhone(value);
  const pinDigits = (value: string) => value.replace(/\D/g, "").slice(0, 6);

  const focusOtpInput = () => {
    window.requestAnimationFrame(() => {
      otpInputRef.current?.focus({ preventScroll: true });
    });
  };

  const focusSignupField = useCallback((field: SignupField) => {
    window.requestAnimationFrame(() => {
      const ref =
        field === "username" ? usernameInputRef : field === "phone" ? phoneInputRef : emailInputRef;
      ref.current?.focus({ preventScroll: true });
      ref.current?.select?.();
    });
  }, []);

  const applySignupConflicts = useCallback(
    (input: {
      conflicts?: SignupConflict[];
      field?: SignupField | null;
      message?: string;
      suggestions?: string[];
      clearIdentity?: boolean;
    }) => {
      // Stay on signup — never trap the user on a forced-login screen.
      if (mode !== "signup") {
        onModeChange("signup");
      }
      if (input.clearIdentity) {
        clearPendingSignup();
        setPendingSignup(null);
        setVerifyCode("");
      }

      const conflicts =
        input.conflicts && input.conflicts.length > 0
          ? input.conflicts
          : input.field
            ? [
                {
                  field: input.field,
                  message: conflictMessageFor(input.field, input.message)
                }
              ]
            : [];

      setSignupConflicts(conflicts);
      setSignupFieldErrors((current) => {
        const next = { ...current };
        for (const item of conflicts) {
          next[item.field] = conflictMessageFor(item.field, item.message);
        }
        return next;
      });
      setSignupFieldAvailable((current) => {
        const next = { ...current };
        for (const item of conflicts) {
          next[item.field] = false;
        }
        return next;
      });

      if (conflicts.some((item) => item.field === "username")) {
        const suggestions =
          input.suggestions && input.suggestions.length > 0
            ? input.suggestions
            : buildLocalUsernameSuggestions(signupForm.username);
        setUsernameSuggestions(suggestions);
      } else {
        setUsernameSuggestions([]);
      }

      onMessage("");
      const first = conflicts[0]?.field;
      if (first) focusSignupField(first);
      signupLog("signup-validation", {
        event: "identity_conflict",
        fields: conflicts.map((item) => item.field)
      });
      flowLog("signup_conflicts_shown", { fields: conflicts.map((item) => item.field) });
    },
    [focusSignupField, mode, onMessage, onModeChange, signupForm.username]
  );

  const goToLoginFromExisting = () => {
    clearPendingSignup();
    setPendingSignup(null);
    const username = normalizeUsername(existingAccount?.username || signupForm.username || "");
    setLoginForm((current) => ({
      ...current,
      username: username || current.username
    }));
    setExistingAccount(null);
    setSignupConflicts([]);
    onMessage("");
    onModeChange("login");
  };

  const useAnotherIdentity = (field?: SignupField) => {
    const target = field || signupConflicts[0]?.field || existingAccount?.field || "email";
    clearSignupFieldError(target);
    setSignupForm((current) => ({
      ...current,
      [target]: ""
    }));
    setSignupConflicts((current) => current.filter((item) => item.field !== target));
    setSignupFieldAvailable((current) => ({ ...current, [target]: false }));
    if (target === "username") setUsernameSuggestions([]);
    setExistingAccount(null);
    onMessage("");
    onModeChange("signup");
    focusSignupField(target);
  };

  useEffect(() => {
    if (mode !== "login" || !isNativeApp()) return;
    void (async () => {
      const [availability, enabled, email] = await Promise.all([
        getBiometricAvailability(),
        isBiometricQuickLoginEnabled(),
        getBiometricQuickLoginEmail()
      ]);
      setBiometricAvailable(availability.available);
      setBiometricEnabled(enabled);
      if (email) {
        setLoginForm((current) => ({
          username: current.username || email.split("@")[0] || "",
          password: current.password
        }));
      }
    })();
  }, [mode]);

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
    if (mode !== "signup") return;
    const username = normalizeUsername(signupForm.username);
    if (!isValidSignupUsername(username)) {
      clearSignupFieldError("username");
      setSignupFieldChecking((current) => ({ ...current, username: false }));
      setSignupFieldAvailable((current) => ({ ...current, username: false }));
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSignupFieldChecking((current) => ({ ...current, username: true }));
      void checkSignupField("username", username)
        .then(() => {
          if (cancelled) return;
          clearSignupFieldError("username");
          setSignupFieldAvailable((current) => ({ ...current, username: true }));
          setSignupConflicts((current) => current.filter((item) => item.field !== "username"));
          setUsernameSuggestions([]);
        })
        .catch((error) => {
          if (cancelled) return;
          if (error instanceof AuthEmailError) {
            applySignupConflicts({
              conflicts: error.conflicts,
              field: "username",
              message: error.message,
              suggestions: error.suggestions
            });
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
  }, [mode, signupForm.username, applySignupConflicts]);

  useEffect(() => {
    if (mode !== "signup") return;
    const phone = phoneDigits(signupForm.phone);
    if (!isValidNigerianPhone(phone)) {
      clearSignupFieldError("phone");
      setSignupFieldChecking((current) => ({ ...current, phone: false }));
      setSignupFieldAvailable((current) => ({ ...current, phone: false }));
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSignupFieldChecking((current) => ({ ...current, phone: true }));
      void checkSignupField("phone", phone)
        .then(() => {
          if (cancelled) return;
          clearSignupFieldError("phone");
          setSignupFieldAvailable((current) => ({ ...current, phone: true }));
          setSignupConflicts((current) => current.filter((item) => item.field !== "phone"));
        })
        .catch((error) => {
          if (cancelled) return;
          if (error instanceof AuthEmailError) {
            applySignupConflicts({
              conflicts: error.conflicts,
              field: "phone",
              message: error.message
            });
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
  }, [mode, signupForm.phone, applySignupConflicts]);

  useEffect(() => {
    if (mode !== "signup") return;
    const email = signupForm.email.trim().toLowerCase();
    if (!isLikelyEmail(email)) {
      clearSignupFieldError("email");
      setSignupFieldChecking((current) => ({ ...current, email: false }));
      setSignupFieldAvailable((current) => ({ ...current, email: false }));
      return;
    }

    if (isDisposableEmail(email)) {
      setSignupFieldError("email", DISPOSABLE_EMAIL_MESSAGE);
      setSignupFieldChecking((current) => ({ ...current, email: false }));
      setSignupFieldAvailable((current) => ({ ...current, email: false }));
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
          setSignupFieldAvailable((current) => ({ ...current, email: true }));
          setSignupConflicts((current) => current.filter((item) => item.field !== "email"));
        })
        .catch((error) => {
          if (cancelled) return;
          if (error instanceof AuthEmailError) {
            applySignupConflicts({
              conflicts: error.conflicts,
              field: "email",
              message: error.message
            });
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
  }, [mode, signupForm.email, applySignupConflicts]);

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

  const signInWithBiometric = async () => {
    if (!biometricAvailable || !biometricEnabled) return;
    const unlocked = await promptBiometricUnlock("Unlock BamSignal");
    if (!unlocked) return;
    const email = await getBiometricQuickLoginEmail();
    if (email) {
      setLoginForm((current) => ({
        username: current.username || email.split("@")[0] || "",
        password: current.password
      }));
    }
    onMessage("Identity verified. Enter your PIN and tap Login to continue.");
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
        if (isNativeApp()) {
          await setBiometricQuickLoginEnabled(true, resolvedEmail || username);
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
      onMessage("Still checking your username — preparing your journey.");
      return false;
    }
    if (!isValidNigerianPhone(phone)) {
      onMessage("Enter a valid phone number.");
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
      onMessage("Still checking your details — preparing your journey.");
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
      onMessage("Preparing your journey…");
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
        if (error.kind === "exists") {
          applySignupConflicts({
            conflicts: error.conflicts,
            field: error.field || "email",
            message: error.message,
            suggestions: error.suggestions,
            clearIdentity: true
          });
          return;
        }
        if (error.field === "email" || error.field === "phone" || error.field === "username") {
          setSignupFieldError(error.field, error.message);
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
        applySignupConflicts({
          conflicts: error.conflicts,
          field: error.field || "email",
          message: error.message,
          suggestions: error.suggestions,
          clearIdentity: true
        });
        return;
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

  const openForgotUsername = () => {
    setForgotLookup(signupForm.email || resetEmail || "");
    setForgotStep("lookup");
    setForgotCode("");
    setForgotDeliveryEmail("");
    setRecoveredUsername("");
    onMessage("");
    onModeChange("forgot-username");
  };

  const sendForgotUsername = async () => {
    const raw = forgotLookup.trim();
    const email = raw.includes("@") ? raw.toLowerCase() : "";
    const phone = email ? "" : phoneDigits(raw);
    if (!email && !isValidNigerianPhone(phone)) {
      onMessage("Enter your registered email or phone number.");
      return;
    }
    setBusy("forgot-username");
    onMessage("");
    try {
      const result = await sendForgotUsernameCode({ email, phone });
      setForgotDeliveryEmail(result.email || email);
      setForgotStep("code");
      setForgotCode("");
      onMessage(result.message || "If an account matches, we sent a recovery code.");
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const submitForgotUsername = async () => {
    const email = forgotDeliveryEmail || (forgotLookup.includes("@") ? forgotLookup.trim().toLowerCase() : "");
    const phone = email ? "" : phoneDigits(forgotLookup);
    if (forgotCode.length !== OTP_LENGTH) {
      onMessage("Enter the 6-digit recovery code.");
      return;
    }
    setBusy("forgot-username-complete");
    onMessage("");
    try {
      const result = await completeForgotUsername({ email, phone, code: forgotCode });
      const username = normalizeUsername(result.username || "");
      setRecoveredUsername(username);
      setForgotStep("done");
      if (username) {
        setLoginForm((current) => ({ ...current, username }));
        onMessage(result.message || `Your username is ${username}.`);
      }
    } catch (error) {
      onMessage(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const conflictPanel = signupConflicts.length > 0 ? (
    <SignupConflictActions
      conflicts={signupConflicts}
      usernameSuggestions={usernameSuggestions}
      onEditField={(field) => useAnotherIdentity(field)}
      onUseSuggestion={(username) => {
        clearSignupFieldError("username");
        setSignupForm((current) => ({ ...current, username }));
        setSignupConflicts((current) => current.filter((item) => item.field !== "username"));
        setUsernameSuggestions([]);
        focusSignupField("username");
      }}
      onLogin={goToLoginFromExisting}
      onForgotPin={() => {
        if (signupForm.email) setResetEmail(signupForm.email.trim().toLowerCase());
        onModeChange("reset");
      }}
      onForgotUsername={openForgotUsername}
      onRecoverAccount={openForgotUsername}
    />
  ) : null;

  const journeyModals = (
    <>
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
    </>
  );

  if (useJourneyShell) {
    if (mode === "signup") {
      return (
        <>
          <JourneySecureSignup
            firstName={journeyHandoff?.name || signupForm.name}
            form={signupForm}
            hideName={Boolean(journeyHandoff?.name?.trim())}
            fieldErrors={signupFieldErrors}
            fieldChecking={signupFieldChecking}
            fieldAvailable={signupFieldAvailable}
            conflictPanel={conflictPanel}
            legalAccepted={legalAccepted}
            mathChallenge={mathChallenge}
            mathAnswer={mathAnswer}
            mathError={mathError}
            mathLoading={mathLoading}
            busy={busy === "signup"}
            message={message}
            onFormChange={(patch) => setSignupForm((current) => ({ ...current, ...patch }))}
            onLegalChange={setLegalAccepted}
            onMathAnswerChange={(value) => {
              setMathAnswer(value);
              setMathError("");
            }}
            onMathRefresh={() => void loadMathChallenge()}
            onSubmit={() => void signUp()}
            onLogin={() => onModeChange("login")}
            onBack={journeyHandoff ? onJourneyBack : undefined}
            pinDigits={pinDigits}
            phoneDigits={phoneDigits}
            formatUsername={formatUsernameInput}
            clearFieldError={clearSignupFieldError}
          />
          {journeyModals}
        </>
      );
    }

    if (mode === "verify") {
      return (
        <>
          <JourneySecureVerify
            maskedEmail={maskEmail(pendingSignup?.email || signupForm.email)}
            verifyCode={verifyCode}
            busy={busy === "verify"}
            resendBusy={busy === "resend"}
            codeSentAt={codeSentAt}
            cooldownSec={RESEND_COOLDOWN_SEC}
            message={message}
            otpRef={otpInputRef}
            onOtpChange={handleOtpChange}
            onVerify={() => verifySignup()}
            onResend={() => void resendVerification()}
            onChangeEmail={() => {
              clearPendingSignup();
              setPendingSignup(null);
              setVerifyCode("");
              onModeChange("signup");
            }}
            onBack={journeyHandoff ? onJourneyBack : undefined}
          />
          {journeyModals}
        </>
      );
    }

    if (mode === "login") {
      return (
        <>
          <JourneySecureLogin
            username={loginForm.username}
            pin={loginForm.password}
            busy={busy === "login"}
            message={message}
            biometricAvailable={biometricAvailable}
            biometricEnabled={biometricEnabled}
            onUsernameChange={(username) => setLoginForm({ ...loginForm, username })}
            onPinChange={(password) => setLoginForm({ ...loginForm, password })}
            onLogin={() => void signIn()}
            onBiometric={() => void signInWithBiometric()}
            onForgotPin={() => onModeChange("reset")}
            onForgotUsername={openForgotUsername}
            onJoin={() => onModeChange("signup")}
            formatUsername={formatUsernameInput}
            pinDigits={pinDigits}
          />
          {journeyModals}
        </>
      );
    }

    if (mode === "existing" && existingAccount) {
      return (
        <>
          <JourneySecureExisting
            field={existingAccount.field}
            maskedEmail={existingAccount.email ? maskEmail(existingAccount.email) : undefined}
            onLogin={goToLoginFromExisting}
            onUseAnother={() => useAnotherIdentity(existingAccount.field)}
            onForgotPin={() => {
              clearPendingSignup();
              setPendingSignup(null);
              if (existingAccount.email) {
                setResetEmail(existingAccount.email);
              }
              setExistingAccount(null);
              onMessage("");
              onModeChange("reset");
            }}
          />
          {journeyModals}
        </>
      );
    }

    if (mode === "forgot-username" && forgotStep === "lookup") {
      return (
        <>
          <JourneySecureForgotUsernameLookup
            lookup={forgotLookup}
            busy={busy === "forgot-username"}
            message={message}
            onLookupChange={setForgotLookup}
            onSubmit={() => void sendForgotUsername()}
            onBackToLogin={() => onModeChange("login")}
          />
          {journeyModals}
        </>
      );
    }

    if (mode === "forgot-username") {
      return (
        <>
          <JourneySecureForgotUsernameCode
            code={forgotCode}
            busy={busy === "forgot-username-complete"}
            recoveredUsername={recoveredUsername}
            message={message}
            otpRef={forgotOtpRef}
            onCodeChange={setForgotCode}
            onSubmit={() => void submitForgotUsername()}
            onBackToLogin={() => onModeChange("login")}
            done={forgotStep === "done"}
          />
          {journeyModals}
        </>
      );
    }

    if (mode === "reset" && resetStep === "email") {
      return (
        <>
          <JourneySecureResetEmail
            email={resetEmail}
            busy={busy === "reset"}
            message={message}
            onEmailChange={setResetEmail}
            onSend={() => void sendReset()}
            onBackToLogin={() => onModeChange("login")}
          />
          {journeyModals}
        </>
      );
    }

    if (mode === "reset" && resetStep === "code") {
      return (
        <>
          <JourneySecureResetCode
            maskedEmail={maskEmail(resetEmail)}
            resetCode={resetCode}
            newPin={resetNewPin}
            confirmPin={resetConfirmPin}
            busy={busy === "reset-complete"}
            resendBusy={busy === "reset-resend"}
            codeSentAt={resetCodeSentAt}
            cooldownSec={RESEND_COOLDOWN_SEC}
            message={message}
            otpRef={resetOtpRef}
            onResetCodeChange={setResetCode}
            onNewPinChange={setResetNewPin}
            onConfirmPinChange={setResetConfirmPin}
            onSubmit={() => void submitPinReset()}
            onResend={() => void resendResetCode()}
            onBackToLogin={() => onModeChange("login")}
            pinDigits={pinDigits}
          />
          {journeyModals}
        </>
      );
    }
  }

  return (
    <main
      className={`auth-page ${embedded ? "auth-page--embedded" : ""} ${mode === "verify" ? "auth-page--verify" : ""} ${mode === "existing" ? "auth-page--existing" : ""} ${mode === "login" ? "auth-page--login" : ""} ${mode === "signup" ? "auth-page--signup" : ""} ${mode === "reset" ? "auth-page--reset" : ""}`.trim()}
    >
      <div className="auth-shell">
        <div className="auth-shell__glow" aria-hidden />
        <div className="auth-card auth-card--fintech">
          {mode !== "signup" && (
            <div className="auth-brand">
              {onLogoClick ? (
                <button type="button" className="auth-brand-btn" onClick={onLogoClick} aria-label="Back to BamSignal login">
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
                {biometricAvailable && biometricEnabled ? (
                  <>
                    <button
                      type="button"
                      className="btn-secondary btn-full btn-auth auth-biometric-btn"
                      onClick={() => void signInWithBiometric()}
                      disabled={busy === "login"}
                    >
                      Verify with biometrics
                    </button>
                    <p className="auth-biometric-hint">
                      Confirms device identity only — you still enter your PIN to sign in.
                    </p>
                  </>
                ) : null}
              </div>
              <div className="auth-links auth-links--stack">
                <button type="button" className="auth-link-secondary" onClick={() => onModeChange("reset")}>
                  Forgot PIN?
                </button>
                <button type="button" className="auth-link-secondary" onClick={openForgotUsername}>
                  Forgot username?
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
                      aria-label="Back to BamSignal login"
                    >
                      <AppLogo size="md" />
                    </button>
                  ) : (
                    <AppLogo size="md" />
                  )}
                </div>
                <h1 className="auth-title">
                  {journeyHandoff ? "Secure your journey" : "Create your account"}
                </h1>
                <p className="auth-sub auth-sub--compact">
                  {journeyHandoff
                    ? "You're almost there — create your username and PIN to continue."
                    : "Let's get you started — it only takes a minute."}
                </p>
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
                    id="signup-username"
                    inputRef={usernameInputRef}
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
                    available={signupFieldAvailable.username}
                  />
                  <AuthField
                    id="signup-phone"
                    inputRef={phoneInputRef}
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
                    available={signupFieldAvailable.phone}
                  />
                  <AuthField
                    id="signup-email"
                    inputRef={emailInputRef}
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
                    available={signupFieldAvailable.email}
                  />
                  {conflictPanel}
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
                  <p className="auth-message auth-message--inline">Preparing your journey…</p>
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

          {mode === "existing" && (
            <div className="auth-existing">
              <div className="auth-verify__hero">
                <div className="auth-verify__icon-ring" aria-hidden>
                  <div className="auth-verify__icon">
                    <UserRound size={26} strokeWidth={2.2} />
                  </div>
                </div>
                <h1 className="auth-title auth-verify__title">Fix your details</h1>
                <p className="auth-verify__lede">
                  {existingAccount?.field === "phone"
                    ? "This phone number is already registered."
                    : existingAccount?.field === "username"
                      ? "This username is already taken."
                      : "This email is already registered."}
                  {existingAccount?.email && existingAccount.field === "email" ? (
                    <>
                      {" "}
                      <strong>{maskEmail(existingAccount.email)}</strong>
                    </>
                  ) : null}
                </p>
              </div>

              <div className="auth-existing__actions">
                <button
                  type="button"
                  className="btn-primary btn-full btn-auth"
                  onClick={() => useAnotherIdentity(existingAccount?.field)}
                >
                  {existingAccount?.field === "phone"
                    ? "Use another phone number"
                    : existingAccount?.field === "username"
                      ? "Edit username"
                      : "Use another email"}
                </button>
                <button type="button" className="btn-secondary btn-full btn-auth" onClick={goToLoginFromExisting}>
                  Log In
                </button>
                <button
                  type="button"
                  className="auth-link-secondary"
                  onClick={() => {
                    clearPendingSignup();
                    setPendingSignup(null);
                    if (existingAccount?.email) {
                      setResetEmail(existingAccount.email);
                    }
                    setExistingAccount(null);
                    onMessage("");
                    onModeChange("reset");
                  }}
                >
                  Forgot PIN?
                </button>
                <button type="button" className="auth-link-secondary" onClick={openForgotUsername}>
                  Forgot username?
                </button>
              </div>
            </div>
          )}

          {mode === "forgot-username" && (
            <div className="auth-reset">
              <h1 className="auth-title">Forgot username?</h1>
              {forgotStep === "lookup" ? (
                <>
                  <p className="auth-sub">
                    Enter the email or phone number on your account. We&apos;ll send a recovery code.
                  </p>
                  <AuthField
                    label="Email or phone"
                    value={forgotLookup}
                    onChange={setForgotLookup}
                    autoComplete="username"
                  />
                  <button
                    type="button"
                    className="btn-primary btn-full btn-auth"
                    onClick={() => void sendForgotUsername()}
                    disabled={busy === "forgot-username"}
                  >
                    {busy === "forgot-username" ? <Loader2 className="spin" size={20} /> : "Send recovery code"}
                  </button>
                </>
              ) : forgotStep === "code" ? (
                <>
                  <p className="auth-sub">Enter the 6-digit code sent to the email on your account.</p>
                  <OtpCodeInput
                    ref={forgotOtpRef}
                    value={forgotCode}
                    verifying={busy === "forgot-username-complete"}
                    onChange={setForgotCode}
                    aria-label="Username recovery code"
                  />
                  <button
                    type="button"
                    className="btn-primary btn-full btn-auth"
                    onClick={() => void submitForgotUsername()}
                    disabled={busy === "forgot-username-complete" || forgotCode.length !== 6}
                  >
                    {busy === "forgot-username-complete" ? (
                      <Loader2 className="spin" size={20} />
                    ) : (
                      "Reveal username"
                    )}
                  </button>
                </>
              ) : (
                <>
                  <p className="auth-sub auth-sub--success" role="status">
                    Your username is <strong>{recoveredUsername}</strong>.
                  </p>
                  <button
                    type="button"
                    className="btn-primary btn-full btn-auth"
                    onClick={() => onModeChange("login")}
                  >
                    Continue to login
                  </button>
                </>
              )}
              <button type="button" className="auth-link-secondary" onClick={() => onModeChange("login")}>
                Back to login
              </button>
            </div>
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

          {message && mode !== "verify" && mode !== "reset" && mode !== "existing" ? (
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
