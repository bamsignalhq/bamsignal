const PHONE_PATTERNS = [
  /\b0[789][01]\d{8}\b/i,
  /\b\+?\s*234\s*[789][01]\d{8}\b/i,
  /\b234[789][01]\d{8}\b/i,
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  /\b\d{7,}\b/
];

const TELEGRAM_PATTERNS = [
  /@[a-z0-9_.]{3,}/i,
  /\btelegram\b/i,
  /\bt\.me\//i
];

const OTHER_OFF_PLATFORM = [
  /whatsapp/i,
  /wa\.me/i,
  /\bwa\b/i,
  /instagram/i,
  /\big\b/i,
  /snapchat/i,
  /\bsnap\b/i,
  /facebook/i,
  /twitter/i,
  /tiktok/i,
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  /https?:\/\//i,
  /\bwww\./i,
  /\bcall me\b/i,
  /\bdm me\b/i,
  /\bmy number\b/i,
  /\bsend your number\b/i,
  /\bdrop number\b/i,
  /\bgive me your number\b/i,
  /\bshare your number\b/i,
  /\btext me\b/i,
  /\bhit me up\b/i,
  /maps\.google/i,
  /goo\.gl\/maps/i
];

export type ContactBlockKind = "digits" | "telegram" | "off_platform" | "none";

export type ContactCheckResult = {
  blocked: boolean;
  kind: ContactBlockKind;
  needsConsent?: boolean;
};

export function containsDigits(text: string): boolean {
  return PHONE_PATTERNS.some((pattern) => pattern.test(text));
}

export function containsTelegramOrHandle(text: string): boolean {
  return TELEGRAM_PATTERNS.some((pattern) => pattern.test(text));
}

export function containsOtherOffPlatform(text: string): boolean {
  return OTHER_OFF_PLATFORM.some((pattern) => pattern.test(text));
}

export function checkOutgoingChatMessage(
  message: string,
  opts: {
    isQuickie: boolean;
    quickieUnlocked: boolean;
    offPlatformApproved: boolean;
  }
): ContactCheckResult {
  const text = message.trim();
  if (!text) return { blocked: false, kind: "none" };

  if (containsDigits(text)) {
    if (opts.isQuickie && opts.quickieUnlocked && PHONE_PATTERNS.slice(0, 3).some((p) => p.test(text))) {
      return { blocked: false, kind: "none" };
    }
    return { blocked: true, kind: "digits" };
  }

  if (containsTelegramOrHandle(text)) {
    if (opts.offPlatformApproved) return { blocked: false, kind: "none" };
    return { blocked: true, kind: "telegram", needsConsent: true };
  }

  if (containsOtherOffPlatform(text)) {
    if (opts.offPlatformApproved) return { blocked: false, kind: "none" };
    return { blocked: true, kind: "off_platform", needsConsent: true };
  }

  return { blocked: false, kind: "none" };
}

/** @deprecated Use checkOutgoingChatMessage */
export function detectBlockedContactExchange(message: string): boolean {
  return checkOutgoingChatMessage(message, {
    isQuickie: false,
    quickieUnlocked: false,
    offPlatformApproved: false
  }).blocked;
}
