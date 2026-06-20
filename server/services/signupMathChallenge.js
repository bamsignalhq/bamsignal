import crypto from "node:crypto";

const TTL_MS = 15 * 60 * 1000;
const TOKEN_VERSION = 1;

function challengeSecret() {
  return (
    process.env.SIGNUP_MATH_CHALLENGE_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.PAYSTACK_SECRET_KEY?.trim() ||
    ""
  );
}

function isValidOperand(value) {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

function randomOperand() {
  return crypto.randomInt(1, 10);
}

function signPayload(payload) {
  const secret = challengeSecret();
  if (!secret) {
    throw new Error("Signup math challenge secret is not configured.");
  }
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

function verifyToken(token) {
  const secret = challengeSecret();
  if (!secret) return null;

  const raw = String(token || "").trim();
  const parts = raw.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;
  let payload = "";
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

  const segments = payload.split(":");
  if (segments.length !== 6) return null;

  const [versionRaw, aRaw, bRaw, sumRaw, expRaw, nonce] = segments;
  if (Number(versionRaw) !== TOKEN_VERSION) return null;

  const a = Number(aRaw);
  const b = Number(bRaw);
  const sum = Number(sumRaw);
  const exp = Number(expRaw);
  const issuedAt = exp - TTL_MS;

  if (!isValidOperand(a) || !isValidOperand(b)) return null;
  if (!Number.isFinite(sum) || a + b !== sum || sum < 2 || sum > 18) return null;
  if (!Number.isFinite(exp) || !Number.isFinite(issuedAt)) return null;
  if (!nonce || nonce.length < 8) return null;

  return { a, b, sum, exp, issuedAt, nonce, expired: Date.now() > exp };
}

function parseSubmittedAnswer(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!/^\d{1,2}$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 18) return null;
  return parsed;
}

function buildChallengeError(message, code, status = 400) {
  const error = new Error(message);
  error.name = "SignupMathError";
  error.status = status;
  error.code = code;
  return error;
}

export function buildSignupMathChallengeToken({ a, b, issuedAt = Date.now() }) {
  if (!isValidOperand(a) || !isValidOperand(b)) {
    throw new Error("Operands must be between 1 and 9.");
  }
  const sum = a + b;
  const exp = issuedAt + TTL_MS;
  const nonce = crypto.randomBytes(12).toString("base64url");
  const payload = `${TOKEN_VERSION}:${a}:${b}:${sum}:${exp}:${nonce}`;
  return signPayload(payload);
}

export function issueSignupMathChallenge() {
  if (!challengeSecret()) {
    return { ok: false, error: "Signup protection is unavailable." };
  }

  const a = randomOperand();
  const b = randomOperand();
  const challengeToken = buildSignupMathChallengeToken({ a, b });

  return {
    ok: true,
    token: challengeToken,
    challengeToken,
    a,
    b
  };
}

export function assertSignupMathChallengePassed(token, answer) {
  const entry = verifyToken(token);

  if (!entry) {
    throw buildChallengeError("This quick check expired. Please try again.", "challenge_expired");
  }

  if (entry.expired) {
    throw buildChallengeError("This quick check expired. Please try again.", "challenge_expired");
  }

  const parsed = parseSubmittedAnswer(answer);
  if (parsed === null || parsed !== entry.sum) {
    throw buildChallengeError("Please answer the quick check correctly.", "math_failed");
  }

  return true;
}
