import { STORAGE_KEYS } from "../constants/limits";

const DRAFT_KEY = "bamsignal-signup-draft";
const DRAFT_TTL_MS = 60 * 60 * 1000;

export type SignupDraftForm = {
  phone: string;
  email: string;
  pin: string;
  confirmPin: string;
};

export type SignupDraft = {
  form: SignupDraftForm;
  legalAccepted: boolean;
  savedAt: number;
};

export function loadSignupDraft(): SignupDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(DRAFT_KEY) ||
      localStorage.getItem(DRAFT_KEY) ||
      localStorage.getItem("bamsignal_signup_draft") ||
      localStorage.getItem("bamsignal-signup-draft");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignupDraft & { form?: SignupDraftForm & { name?: string; username?: string } };
    if (!parsed?.form) return null;
    if (Date.now() - (parsed.savedAt || 0) > DRAFT_TTL_MS) {
      clearSignupDraft();
      return null;
    }
    if (localStorage.getItem(STORAGE_KEYS.pendingSignup)) {
      return null;
    }
    return {
      form: {
        phone: parsed.form.phone || "",
        email: parsed.form.email || "",
        pin: parsed.form.pin || "",
        confirmPin: parsed.form.confirmPin || ""
      },
      legalAccepted: Boolean(parsed.legalAccepted),
      savedAt: parsed.savedAt
    };
  } catch {
    clearSignupDraft();
    return null;
  }
}

export function saveSignupDraft(input: Omit<SignupDraft, "savedAt">): void {
  const payload: SignupDraft = { ...input, savedAt: Date.now() };
  const raw = JSON.stringify(payload);
  try {
    sessionStorage.setItem(DRAFT_KEY, raw);
  } catch {
    /* ignore */
  }
}

export function clearSignupDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem("bamsignal_signup_draft");
    localStorage.removeItem("bamsignal-signup-draft");
  } catch {
    /* ignore */
  }
}
