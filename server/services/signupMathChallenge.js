import crypto from "node:crypto";

const TTL_MS = 15 * 60 * 1000;

/** @type {Map<string, { sum: number; expires: number }>} */
const challenges = new Map();

function pruneExpired() {
  const now = Date.now();
  for (const [token, entry] of challenges.entries()) {
    if (!entry || entry.expires <= now) challenges.delete(token);
  }
}

export function issueSignupMathChallenge() {
  pruneExpired();
  const a = crypto.randomInt(1, 10);
  const b = crypto.randomInt(1, 10);
  const token = crypto.randomBytes(16).toString("hex");
  const sum = a + b;
  challenges.set(token, { sum, expires: Date.now() + TTL_MS });
  return { ok: true, token, a, b };
}

export function assertSignupMathChallengePassed(token, answer) {
  pruneExpired();
  const key = String(token || "").trim();
  const entry = key ? challenges.get(key) : null;
  if (key) challenges.delete(key);

  if (!entry || Date.now() > entry.expires) {
    const error = new Error("Please answer the quick check correctly.");
    error.name = "SignupMathError";
    error.status = 400;
    error.code = "math_expired";
    throw error;
  }

  const parsed = Number.parseInt(String(answer ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed !== entry.sum) {
    const error = new Error("Please answer the quick check correctly.");
    error.name = "SignupMathError";
    error.status = 400;
    error.code = "math_failed";
    throw error;
  }

  return true;
}
