/** Document / ID keyword detection — shared by browser moderation + Node tests. */

export const DOCUMENT_KEYWORD_PATTERNS = [
  /\bnin\b/i,
  /\bnational\s+identification\s+number\b/i,
  /\bfederal\s+republic\s+of\s+nigeria\b/i,
  /\bbvn\b/i,
  /\bbank\s+verification\s+number\b/i,
  /\bpassport\b/i,
  /\bdriver'?s?\s+licen[cs]e\b/i,
  /\bdriving\s+licen[cs]e\b/i,
  /\bpermanent\s+voter'?s?\s+card\b/i,
  /\b(?:pvc|voter'?s?\s+card)\b/i,
  /\bissue\s+date\b/i,
  /\bsurname\b/i,
  /\bgiven\s+names?\b/i,
  /\bcard\s+number\b/i,
  /\bdate\s+of\s+birth\b/i,
  /\bbirth\s+certificate\b/i,
  /\bwaec\b/i,
  /\bwassce\b/i,
  /\bwest\s+african\s+examinations?\s+council\b/i,
  /\bcertificate\s+of\b/i,
  /\butility\s+bill\b/i,
  /\belectricity\s+bill\b/i,
  /\breceipt\b/i,
  /\batm\b/i,
  /\bdebit\s+card\b/i,
  /\bcredit\s+card\b/i,
  /\bidentity\s+card\b/i,
  /\bnational\s+id\b/i,
  /\bslip\b/i,
  /\bembassy\b/i,
  /\bvisa\b/i,
  /\bimmigration\b/i
];

export const IMAGE_URL_PATTERNS = [
  /\bwhatsapp\b/i,
  /\btelegram\b/i,
  /\binstagram\b/i,
  /\btiktok\b/i,
  /\bgmail\b/i,
  /\byahoo\b/i,
  /https?:\/\//i,
  /\bwww\./i,
  /\bwa\.me\b/i,
  /\bt\.me\b/i
];

export const NIGERIAN_PHONE_PATTERNS = [
  /\b0[789][01]\d{8}\b/,
  /\b\+?234[789][01]\d{8}\b/,
  /\b234[789][01]\d{9}\b/
];

export function compactDigits(text) {
  return String(text || "").replace(/\D/g, "");
}

export function containsNigerianPhoneInText(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  if (NIGERIAN_PHONE_PATTERNS.some((pattern) => pattern.test(raw))) return true;
  const compact = compactDigits(raw);
  if (/^0[789][01]\d{8}$/.test(compact)) return true;
  if (/^234[789][01]\d{9}$/.test(compact)) return true;
  return false;
}

export function containsImageUrlLeak(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  return IMAGE_URL_PATTERNS.some((pattern) => pattern.test(raw));
}

export function containsDocumentKeywords(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  return DOCUMENT_KEYWORD_PATTERNS.some((pattern) => pattern.test(raw));
}

export function scanPhotoSafetyText(text, { allowDocuments = false } = {}) {
  const raw = String(text || "");
  if (!raw.trim()) {
    return { blocked: false, category: null };
  }

  if (!allowDocuments && containsDocumentKeywords(raw)) {
    return { blocked: true, category: "document_detected" };
  }
  if (containsNigerianPhoneInText(raw)) {
    return { blocked: true, category: "contact_information" };
  }
  if (containsImageUrlLeak(raw)) {
    return { blocked: true, category: "contact_information" };
  }

  return { blocked: false, category: null };
}
