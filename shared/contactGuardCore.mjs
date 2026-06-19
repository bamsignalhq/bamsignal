/** Shared contact-leak detection for browser + Node. */

import { scanTextForProfanity } from "./profanityFilter.mjs";

export { VULGAR_CONTENT_BLOCK_MESSAGE, scanTextForProfanity, containsProfanity } from "./profanityFilter.mjs";
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
];

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

function compactContactText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\s.,\-()+']/g, "");
}

function spokenDigitsText(text) {
  let out = String(text || "").toLowerCase();
  for (const [word, digit] of NUMBER_WORDS) {
    out = out.replace(new RegExp(`\\b${word}\\b`, "g"), digit);
  }
  return out;
}

function containsPhoneLeak(text) {
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

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

/**
 * @param {string} text
 * @param {{ allowContactExchange?: boolean }} [options]
 */
export function scanTextForContactLeak(text, options = {}) {
  const raw = String(text || "").trim();
  if (!raw) return { blocked: false };
  if (options.allowContactExchange) return { blocked: false };

  if (containsPhoneLeak(raw)) return { blocked: true };
  if (matchesAny(raw, SOLICITATION_PATTERNS)) return { blocked: true };
  if (matchesAny(raw, SOCIAL_PATTERNS)) return { blocked: true };
  if (matchesAny(raw, EMAIL_PATTERNS)) return { blocked: true };
  if (matchesAny(raw, URL_PATTERNS)) return { blocked: true };
  if (matchesAny(raw, HANDLE_PATTERNS)) return { blocked: true };

  return { blocked: false };
}

export function containsContactInText(text) {
  return scanTextForContactLeak(text).blocked;
}

export function containsDigits(text) {
  return containsPhoneLeak(text);
}

export function containsTelegramOrHandle(text) {
  return matchesAny(String(text || ""), [...HANDLE_PATTERNS, /\btelegram\b/i, /\bt\.me\b/i]);
}

export function containsOtherOffPlatform(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  if (matchesAny(raw, SOCIAL_PATTERNS)) return true;
  if (matchesAny(raw, EMAIL_PATTERNS)) return true;
  if (matchesAny(raw, URL_PATTERNS)) return true;
  if (matchesAny(raw, SOLICITATION_PATTERNS)) return true;
  return false;
}

/**
 * Chat messages: block contact exchange until connection is accepted.
 * @param {string} message
 * @param {{ connectionAccepted?: boolean }} opts
 */
export function checkOutgoingChatMessage(message, opts = {}) {
  const text = String(message || "").trim();
  if (!text) return { blocked: false, kind: "none" };

  const allow = Boolean(opts.connectionAccepted);
  const blocked = scanTextForContactLeak(text, { allowContactExchange: allow }).blocked;
  if (!blocked && scanTextForProfanity(text).blocked) {
    return { blocked: true, kind: "profanity" };
  }
  if (!blocked) return { blocked: false, kind: "none" };

  return { blocked: true, kind: "contact", needsConsent: !allow };
}

/**
 * @param {Record<string, unknown>} input
 */
export function scanProfilePayloadForContactLeak(input = {}) {
  const checks = [];

  if (input.name) checks.push(["display_name", input.name]);
  if (input.username) checks.push(["username", input.username]);
  if (input.bio) checks.push(["bio", input.bio]);

  const prompts = Array.isArray(input.profilePrompts) ? input.profilePrompts : [];
  for (const prompt of prompts) {
    if (prompt?.prompt) checks.push(["profile_prompt", prompt.prompt]);
    if (prompt?.answer) checks.push(["profile_prompt", prompt.answer]);
  }

  if (input.voiceIntroTranscript) checks.push(["voice_intro", input.voiceIntroTranscript]);

  const occupations = Array.isArray(input.occupations) ? input.occupations : [];
  for (const occupation of occupations) {
    if (typeof occupation === "string") checks.push(["occupation", occupation]);
  }
  if (input.occupation) checks.push(["occupation", input.occupation]);

  const interests = Array.isArray(input.interests) ? input.interests : [];
  for (const interest of interests) {
    if (typeof interest === "string") checks.push(["interest", interest]);
  }

  for (const [field, value] of checks) {
    const textValue = String(value || "");
    if (scanTextForContactLeak(textValue).blocked) {
      return { blocked: true, field, reason: "contact" };
    }
    if (scanTextForProfanity(textValue).blocked) {
      return { blocked: true, field, reason: "profanity" };
    }
  }

  return { blocked: false };
}
