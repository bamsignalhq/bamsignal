/** Shared signup conflict copy — keep in sync with server SIGNUP_CONFLICT_MESSAGES. */
export const SIGNUP_CONFLICT_COPY = {
  username: "This username is already taken.",
  email: "This email is already registered.",
  phone: "This phone number is already registered."
} as const;

export type SignupConflictField = keyof typeof SIGNUP_CONFLICT_COPY;

export type SignupConflict = {
  field: SignupConflictField;
  code?: string;
  message: string;
};

export function conflictMessageFor(field: SignupConflictField, fallback?: string): string {
  return fallback?.trim() || SIGNUP_CONFLICT_COPY[field];
}

/** Local username suggestion seeds (server also returns verified-available suggestions). */
export function buildLocalUsernameSuggestions(raw: string): string[] {
  const base = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+$/g, "")
    .slice(0, 16);
  const stem = (base.replace(/\d+$/g, "") || base || "member").slice(0, 16);
  const candidates = [stem, `${stem}_01`, `${stem}_ng`, `official_${stem}`.slice(0, 24)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    const normalized = candidate.replace(/[^a-z0-9_]/g, "").slice(0, 24);
    if (normalized.length < 4 || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}
