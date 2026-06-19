/** Shared vulgar / explicit language detection for profile and chat text. */

export const VULGAR_CONTENT_BLOCK_MESSAGE =
  "Please keep your profile friendly — avoid explicit or vulgar language.";

const EXACT_TERMS = new Set([
  "anal",
  "arsehole",
  "asshole",
  "bdsm",
  "bitch",
  "blowjob",
  "boner",
  "boobs",
  "bullshit",
  "clit",
  "clitoris",
  "cock",
  "cum",
  "cumming",
  "cunt",
  "dick",
  "dildo",
  "dtf",
  "erotic",
  "escort",
  "fetish",
  "fuck",
  "fucked",
  "fucker",
  "fucking",
  "fucks",
  "gangbang",
  "handjob",
  "horny",
  "knack",
  "knacking",
  "milf",
  "motherfucker",
  "naked",
  "nipple",
  "nude",
  "nudes",
  "onlyfans",
  "orgasm",
  "penis",
  "porn",
  "porno",
  "prostitute",
  "pussy",
  "sext",
  "sexting",
  "sexual",
  "sexy",
  "shag",
  "shagging",
  "slut",
  "titty",
  "tits",
  "vagina",
  "vibrator",
  "wang",
  "whore",
  "xxx"
]);

const PHRASE_PATTERNS = [
  /\bhere\s+for\s+(the\s+)?fuck\b/i,
  /\bfor\s+(a\s+)?fuck\b/i,
  /\bwanna\s+fuck\b/i,
  /\bwant\s+to\s+fuck\b/i,
  /\blet(?:'s|\s+us)\s+fuck\b/i,
  /\bdown\s+to\s+fuck\b/i,
  /\bsend\s+nudes?\b/i,
  /\bhook\s*up\s+for\s+sex\b/i,
  /\blooking\s+for\s+sex\b/i,
  /\bhere\s+for\s+sex\b/i,
  /\bhere\s+for\s+knack(?:ing)?\b/i,
  /\bdown\s+for\s+knack(?:ing)?\b/i,
  /\bdoggy\s+style\b/i,
  /\bf+u+c+k+\b/i,
  /\bp+u+s+s+y+\b/i
];

const SHORT_EXACT_TERMS = ["sex", "cum", "dtf", "xxx"];

function normalizeProfanityText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[@4]/g, "a")
    .replace(/[3€]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7+]/g, "t")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasExactTerm(normalized, term) {
  const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return re.test(normalized);
}

export function scanTextForProfanity(text) {
  const raw = String(text || "").trim();
  if (!raw) return { blocked: false };

  for (const pattern of PHRASE_PATTERNS) {
    if (pattern.test(raw)) return { blocked: true };
  }

  const normalized = normalizeProfanityText(raw);
  if (!normalized) return { blocked: false };

  for (const term of SHORT_EXACT_TERMS) {
    if (hasExactTerm(normalized, term)) return { blocked: true };
  }

  for (const word of normalized.split(" ")) {
    if (!word) continue;
    if (EXACT_TERMS.has(word)) return { blocked: true };
  }

  const compact = normalized.replace(/\s/g, "");
  for (const term of EXACT_TERMS) {
    if (term.length >= 4 && compact.includes(term)) return { blocked: true };
  }

  return { blocked: false };
}

export function containsProfanity(text) {
  return scanTextForProfanity(text).blocked;
}
