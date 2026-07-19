export type JourneyAuthScreenId =
  | "j6-ready"
  | "j7-account"
  | "j8-verify-email"
  | "a1-login"
  | "a2-reset-email"
  | "a3-reset-code"
  | "a4-existing";

export const JOURNEY_SECURE_STRENGTH: Record<
  JourneyAuthScreenId,
  { fill: number; label: string; hint: string }
> = {
  "j6-ready": { fill: 72, label: "Almost ready", hint: "" },
  "j7-account": { fill: 78, label: "Securing your journey", hint: "Protect what you've already built." },
  "j8-verify-email": { fill: 88, label: "Protecting your account", hint: "This protects you." },
  "a1-login": { fill: 8, label: "Welcome back", hint: "Continue your journey." },
  "a2-reset-email": { fill: 12, label: "Recovering access", hint: "We'll help you safely." },
  "a3-reset-code": { fill: 18, label: "Recovering access", hint: "Choose a PIN only you know." },
  "a4-existing": { fill: 78, label: "Welcome back", hint: "Your account is already here." }
};

export const JOURNEY_SECURE_TRUST: Partial<Record<JourneyAuthScreenId, string>> = {
  "j6-ready": "You've shared enough — now we protect it.",
  "j7-account": "Encrypted · Username + PIN. Your PIN stays private.",
  "j8-verify-email": "This keeps your account yours.",
  "a1-login": "Your PIN stays private.",
  "a2-reset-email": "We'll only use this to help you recover access.",
  "a3-reset-code": "Choose a PIN only you know.",
  "a4-existing": "You can sign in or use a different email."
};

export const JOURNEY_SECURE_GUIDE: Partial<Record<JourneyAuthScreenId, string>> = {
  "j8-verify-email": "Almost there."
};
