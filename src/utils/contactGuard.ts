import type { DatingProfile, UserProfile } from "../types";
import { reportModerationFlagRemote } from "../services/memberTrust";

export const CONTACT_LEAK_BLOCK_MESSAGE =
  "We couldn't save that information. Please try something different.";

const NUMBER_WORDS = [
  ["zero", "0"],
  ["oh", "0"],
  ["one", "1"],
  ["two", "2"],
  ["three", "3"],
  ["four", "4"],
  ["five", "5"],
  ["six", "6"],
  ["seven", "7"],
  ["eight", "8"],
  ["nine", "9"]
] as const;

const SOLICITATION_PATTERNS = [
  /\bwhatsapp\s+me\b/i,
  /\bdm\s+me\b/i,
  /\breach\s+me\b/i,
  /\btext\s+me\b/i,
  /\bcall\s+me\b/i,
  /\btelegram\s+me\b/i,
  /\bsend\s+me\s+a\s+message\b/i,
  /\bmy\s+number\s+is\b/i,
  /\bmy\s+line\s+is\b/i,
  /\bmy\s+contact\s+is\b/i,
  /\bhit\s+me\s+up\b/i,
  /\bgive\s+me\s+your\s+number\b/i,
  /\bshare\s+your\s+number\b/i,
  /\bsend\s+your\s+number\b/i,
  /\bdrop\s+(your\s+)?number\b/i,
  /\bchat\s+me\b/i,
  /\bfollow\s+me\b/i
];

const SOCIAL_PATTERNS = [
  /\bwhatsapp\b/i,
  /\bwatsapp\b/i,
  /\bwassap\b/i,
  /\bwhats\s*app\b/i,
  /\bwa\.me\b/i,
  /\btelegram\b/i,
  /\bt\.me\b/i,
  /\binstagram\b/i,
  /\binsta\b/i,
  /\big\s*:/i,
  /\bfacebook\b/i,
  /\btiktok\b/i,
  /\bsnapchat\b/i,
  /\bsnap\b/i,
  /(?:^|[\s#@])fb(?:\s|:|$)/i
];

const EMAIL_PATTERNS = [
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  /\bgmail\.com\b/i,
  /\byahoo\.com\b/i,
  /\bhotmail\.com\b/i,
  /\boutlook\.com\b/i
];

const URL_PATTERNS = [
  /https?:\/\//i,
  /\bwww\./i,
  /\bbit\.ly\b/i,
  /\btinyurl\.com\b/i,
  /\bt\.co\b/i,
  /\b[a-z0-9][a-z0-9-]*\.(?:com|net|ng|co)\b/i
];

const HANDLE_PATTERNS = [/@([a-z0-9_.]{3,})/i, /\btelegram\s*:\s*@/i];

function compactContactText(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\s.,\-()+']/g, "");
}

function spokenDigitsText(text: string) {
  let out = String(text || "").toLowerCase();
  for (const [word, digit] of NUMBER_WORDS) {
    out = out.replace(new RegExp(`\\b${word}\\b`, "g"), digit);
  }
  return out;
}

function containsPhoneLeak(text: string) {
  const spoken = spokenDigitsText(text);
  const compact = compactContactText(spoken);
  if (!compact) return false;
  if (/0[789][01]\d{8}/.test(compact)) return true;
  if (/234[789][01]\d{9}/.test(compact)) return true;
  if (/\+?234[789][01]\d{9}/.test(compact)) return true;
  if (/\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/.test(text)) return true;
  if (/\d{7,}/.test(compact)) return true;
  return false;
}

function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function scanTextForContactLeak(
  text: string,
  options: { allowContactExchange?: boolean } = {}
) {
  const raw = String(text || "").trim();
  if (!raw) return { blocked: false as const };
  if (options.allowContactExchange) return { blocked: false as const };

  if (containsPhoneLeak(raw)) return { blocked: true as const };
  if (matchesAny(raw, SOLICITATION_PATTERNS)) return { blocked: true as const };
  if (matchesAny(raw, SOCIAL_PATTERNS)) return { blocked: true as const };
  if (matchesAny(raw, EMAIL_PATTERNS)) return { blocked: true as const };
  if (matchesAny(raw, URL_PATTERNS)) return { blocked: true as const };
  if (matchesAny(raw, HANDLE_PATTERNS)) return { blocked: true as const };

  return { blocked: false as const };
}

export function containsContactInText(text: string) {
  return scanTextForContactLeak(text).blocked;
}

export function containsDigits(text: string) {
  return containsPhoneLeak(text);
}

export function containsTelegramOrHandle(text: string) {
  return matchesAny(String(text || ""), [...HANDLE_PATTERNS, /\btelegram\b/i, /\bt\.me\b/i]);
}

export function containsOtherOffPlatform(text: string) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  if (matchesAny(raw, SOCIAL_PATTERNS)) return true;
  if (matchesAny(raw, EMAIL_PATTERNS)) return true;
  if (matchesAny(raw, URL_PATTERNS)) return true;
  if (matchesAny(raw, SOLICITATION_PATTERNS)) return true;
  return false;
}

export function scanProfilePayloadForContactLeak(input: Record<string, unknown> = {}) {
  const checks: Array<[ContactLeakField, string]> = [];

  if (input.name) checks.push(["display_name", String(input.name)]);
  if (input.username) checks.push(["username", String(input.username)]);
  if (input.bio) checks.push(["bio", String(input.bio)]);

  const prompts = Array.isArray(input.profilePrompts) ? input.profilePrompts : [];
  for (const prompt of prompts) {
    if (prompt && typeof prompt === "object") {
      const row = prompt as { prompt?: string; answer?: string };
      if (row.prompt) checks.push(["profile_prompt", row.prompt]);
      if (row.answer) checks.push(["profile_prompt", row.answer]);
    }
  }

  if (input.voiceIntroTranscript) checks.push(["voice_intro", String(input.voiceIntroTranscript)]);

  const occupations = Array.isArray(input.occupations) ? input.occupations : [];
  for (const occupation of occupations) {
    if (typeof occupation === "string") checks.push(["occupation", occupation]);
  }
  if (input.occupation) checks.push(["occupation", String(input.occupation)]);

  const interests = Array.isArray(input.interests) ? input.interests : [];
  for (const interest of interests) {
    if (typeof interest === "string") checks.push(["interest", interest]);
  }

  for (const [field, value] of checks) {
    if (scanTextForContactLeak(value).blocked) {
      return { blocked: true as const, field };
    }
  }

  return { blocked: false as const };
}

export type ContactLeakField =
  | "bio"
  | "about"
  | "voice_intro"
  | "profile_prompt"
  | "occupation"
  | "interest"
  | "looking_for"
  | "connection_note"
  | "message"
  | "report_note"
  | "display_name"
  | "username"
  | "city_home_post"
  | "admin_content"
  | "introduction"
  | "success_story"
  | "other";

export type ContactBlockKind = "contact" | "none";

export type ContactCheckResult = {
  blocked: boolean;
  kind: ContactBlockKind;
  needsConsent?: boolean;
};

export function checkOutgoingChatMessage(
  message: string,
  opts: {
    connectionAccepted?: boolean;
    offPlatformApproved?: boolean;
  }
): ContactCheckResult {
  const text = String(message || "").trim();
  if (!text) return { blocked: false, kind: "none" };

  const connectionAccepted = Boolean(opts.connectionAccepted ?? opts.offPlatformApproved);
  const blocked = scanTextForContactLeak(text, { allowContactExchange: connectionAccepted }).blocked;
  if (!blocked) return { blocked: false, kind: "none" };

  return { blocked: true, kind: "contact", needsConsent: !connectionAccepted };
}

/** @deprecated Use checkOutgoingChatMessage */
export function detectBlockedContactExchange(message: string): boolean {
  return checkOutgoingChatMessage(message, { connectionAccepted: false }).blocked;
}

async function hashContactLeakText(text: string): Promise<string> {
  const payload = new TextEncoder().encode(String(text || "").trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function reportContactLeakAttempt(
  user: Pick<UserProfile, "email" | "phone">,
  field: ContactLeakField,
  text: string
): Promise<void> {
  const textHash = await hashContactLeakText(text);
  void reportModerationFlagRemote(user, "contact_leak", { field, text_hash: textHash });
}

export function validateUserText(
  text: string,
  opts?: { allowContactExchange?: boolean }
): string | null {
  if (scanTextForContactLeak(text, opts).blocked) {
    return CONTACT_LEAK_BLOCK_MESSAGE;
  }
  return null;
}

export function validateProfileContactLeaks(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): { blocked: boolean; field?: ContactLeakField } {
  const scan = scanProfilePayloadForContactLeak({
    name: user?.name,
    bio: profile.bio,
    profilePrompts: profile.profilePrompts,
    occupations: profile.occupations,
    occupation: profile.occupation,
    interests: profile.interests
  });
  return { blocked: scan.blocked, field: scan.field };
}

export function validateDisplayName(name: string): string | null {
  return validateUserText(name);
}

export function validateUsernameText(username: string): string | null {
  return validateUserText(username);
}
