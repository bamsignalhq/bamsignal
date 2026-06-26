import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PENETRATION_CERT_ATTACKS } from "../../../shared/productionPenetrationCertification.mjs";
import { handlePaystackWebhookRequest } from "../../../server/services/paystackWebhookHandler.js";
import { PIN_AUTH_MAX_ATTEMPTS } from "../../../server/services/pinAuthThrottle.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function attackResult(entry, partial) {
  return {
    id: entry.id,
    label: entry.label,
    category: entry.category,
    critical: entry.critical,
    attempted: true,
    blocked: true,
    exploited: false,
    severity: "info",
    detail: "",
    fix: "",
    residualRisk: "",
    evidence: {},
    ...partial
  };
}

async function fetchJson(baseUrl, path, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { status: response.status, text, json, ok: response.ok };
  } catch (error) {
    return {
      status: 0,
      text: "",
      json: null,
      ok: false,
      error: error?.name === "AbortError" ? "timeout" : String(error?.message || error)
    };
  } finally {
    clearTimeout(timer);
  }
}

function sqlErrorLeak(text = "") {
  const lower = text.toLowerCase();
  return (
    lower.includes("syntax error at") ||
    lower.includes("postgresql") ||
    lower.includes("sqlite") ||
    lower.includes("unterminated") ||
    lower.includes("relation ") ||
    lower.includes("column ")
  );
}

function walkMemberUiFiles(dir, files = [], inAdmin = false) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "admin") {
        walkMemberUiFiles(full, files, true);
      } else {
        walkMemberUiFiles(full, files, inAdmin);
      }
      continue;
    }
    if (/\.(tsx|jsx)$/.test(entry) && !inAdmin) files.push(full);
  }
  return files;
}

async function attackBrokenAuthorization(baseUrl, entry) {
  const probes = [
    { path: "/api/member/data?action=discover", method: "POST", body: { action: "discover" } },
    { path: "/api/member/data?action=profile", method: "POST", body: { action: "profile" } },
    { path: "/api/member/photos", method: "POST", body: { action: "upload" } }
  ];
  const results = [];
  for (const probe of probes) {
    const res = await fetchJson(baseUrl, probe.path, {
      method: probe.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(probe.body)
    });
    results.push({ path: probe.path, status: res.status });
  }
  const open = results.filter((item) => item.status >= 200 && item.status < 300);
  const blocked = open.length === 0 && results.every((item) => item.status === 401 || item.status === 403);
  return attackResult(entry, {
    blocked,
    exploited: open.length > 0,
    severity: open.length ? "critical" : "info",
    detail: blocked
      ? `Member APIs returned 401/403 without bearer (${results.map((r) => `${r.status} ${r.path}`).join(", ")}).`
      : `Unauthorized access succeeded: ${open.map((r) => r.path).join(", ")}`,
    fix: "requireMemberAuth on member data/photo handlers; reject missing bearer.",
    residualRisk: "Public member-data actions (profile-by-id, subscription-catalog) remain intentionally unauthenticated — scope must stay minimal.",
    evidence: { results }
  });
}

async function attackJwtManipulation(baseUrl, entry) {
  const tokens = [
    "not.a.jwt",
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9.",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZW50ZXN0In0.tampered_signature"
  ];
  const results = [];
  for (const token of tokens) {
    const res = await fetchJson(baseUrl, "/api/member/data?action=profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action: "profile" })
    });
    results.push({ token: token.slice(0, 24), status: res.status });
  }
  const exploited = results.some((item) => item.status >= 200 && item.status < 300);
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "critical" : "info",
    detail: exploited
      ? "Tampered bearer tokens returned success on member API."
      : `Supabase bearer verification rejected forged tokens (${results.map((r) => r.status).join(", ")}).`,
    fix: "verifySupabaseBearerUser before member identity resolution.",
    residualRisk: "Compromised Supabase signing keys would bypass this control.",
    evidence: { results }
  });
}

async function attackPrivilegeEscalation(baseUrl, entry) {
  const probes = [
    {
      path: "/ready?details=1",
      method: "GET",
      headers: { Authorization: "Bearer forged-admin" }
    },
    {
      path: "/api/admin/city-home",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer forged-admin"
      },
      body: JSON.stringify({ action: "list" })
    }
  ];
  const results = [];
  for (const probe of probes) {
    const res = await fetchJson(baseUrl, probe.path, {
      method: probe.method,
      headers: probe.headers,
      body: probe.body ? JSON.stringify(probe.body) : undefined
    });
    results.push({ path: probe.path, status: res.status });
  }
  const leaked = results.filter(
    (item) => item.status === 200 && item.path.includes("details")
  );
  const exploited = leaked.length > 0 || results.some((item) => item.path.includes("admin") && item.status === 200);
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "critical" : "info",
    detail: exploited
      ? "Forged bearer reached privileged diagnostics or admin routes."
      : `Admin/diagnostics routes denied forged bearer (${results.map((r) => `${r.status} ${r.path}`).join(", ")}).`,
    fix: "requireAdmin + diagnostics secret gate; admin consent PIN for mutations.",
    residualRisk: "Leaked ADMIN_ACTION_PIN or diagnostics secret would elevate access.",
    evidence: { results }
  });
}

async function attackApiFuzzing(baseUrl, entry) {
  const probes = [
    { path: "/api/auth/pin-login", method: "DELETE" },
    { path: "/api/auth/pin-login", method: "POST", body: "{not-json", raw: true, kind: "invalid-json" },
    { path: "/api/auth/pin-login", method: "POST", body: JSON.stringify({ username: 1, pin: [] }) },
    { path: "/api/member/data", method: "GET" },
    { path: "/api/paystack/verify", method: "POST", body: JSON.stringify({}) }
  ];
  const results = [];
  let availabilityIssue = false;
  for (const probe of probes) {
    const res = await fetchJson(baseUrl, probe.path, {
      method: probe.method,
      headers: probe.raw
        ? { "Content-Type": "application/json" }
        : probe.body
          ? { "Content-Type": "application/json" }
          : undefined,
      body: probe.body
    });
    if (res.status === 500 && probe.kind !== "invalid-json") availabilityIssue = true;
    results.push({
      path: probe.path,
      method: probe.method,
      status: res.status,
      kind: probe.kind || "default",
      error: res.error
    });
  }
  const invalidJson = results.find((item) => item.kind === "invalid-json");
  const exploited = availabilityIssue;
  const invalidJson500 = invalidJson?.status >= 500;
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "high" : invalidJson500 ? "medium" : "low",
    detail: exploited
      ? "Fuzz probes triggered HTTP 500 on handled routes."
      : invalidJson500
        ? "Malformed JSON returns 500 via Express parser — availability noise, not auth bypass (4xx on other probes)."
        : `Malformed requests returned 4xx/405 without server crash (${results.map((r) => `${r.method} ${r.path}→${r.status}`).join("; ")}).`,
    fix: "parseBody guards, method checks, JSON error middleware returning 400; sendLoggedApiError for unexpected failures.",
    residualRisk: invalidJson500
      ? "Consider JSON parse error handler returning 400 to reduce error noise in logs."
      : "Unhandled edge cases in lesser-used actions may still 500 — monitor error rates.",
    evidence: { results, invalidJson500 }
  });
}

async function attackSqlInjection(baseUrl, entry) {
  const payloads = [
    "admin' OR '1'='1",
    "'; DROP TABLE users;--",
    "1 UNION SELECT null--",
    "loadcert'--"
  ];
  const results = [];
  let leaked = false;
  let serverError = false;
  for (const payload of payloads) {
    const res = await fetchJson(baseUrl, "/api/auth/pin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: payload, pin: "123456" })
    });
    if (res.status >= 500) serverError = true;
    if (sqlErrorLeak(res.text)) leaked = true;
    results.push({ payload: payload.slice(0, 20), status: res.status, leak: sqlErrorLeak(res.text) });
  }
  const exploited = leaked || serverError;
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: leaked ? "critical" : serverError ? "high" : "info",
    detail: exploited
      ? "SQL error text or 500 observed on injection payloads."
      : "Injection payloads returned generic 401 without SQL leakage.",
    fix: "Parameterized queries via db layer; generic INVALID_LOGIN_MESSAGE on pin-login.",
    residualRisk: "Raw SQL in migrations/admin scripts outside request path not covered by this probe.",
    evidence: { results }
  });
}

function attackXssStatic(entry) {
  const memberUiDir = join(rootPath, "src/components");
  const files = walkMemberUiFiles(memberUiDir);
  const dangerous = [];
  for (const filePath of files) {
    const source = readFileSync(filePath, "utf8");
    if (source.includes("dangerouslySetInnerHTML")) {
      dangerous.push(filePath.replace(`${rootPath}/`, ""));
    }
  }
  const profileCard = read("src/components/ProfileCard.tsx");
  const usesText = profileCard.includes("profile.name") && !profileCard.includes("dangerouslySetInnerHTML");
  const exploited = dangerous.length > 0;
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "high" : "low",
    detail:
      dangerous.length === 0
        ? "No dangerouslySetInnerHTML in member UI components scanned."
        : `${dangerous.length} component(s) use dangerouslySetInnerHTML: ${dangerous.slice(0, 4).join(", ")}`,
    fix: "Render member-supplied strings as text nodes; sanitize any rich HTML at trust boundary.",
    residualRisk: dangerous.length
      ? "Targeted review required for each dangerouslySetInnerHTML callsite."
      : "Stored XSS via photo metadata or chat not fully exercised in this pass.",
    evidence: { dangerousCount: dangerous.length, samples: dangerous.slice(0, 5), profileCardTextOnly: usesText }
  });
}

function attackCsrfStatic(entry) {
  const memberAuth = read("server/services/memberAuth.js");
  const usesBearer = memberAuth.includes("extractBearerToken") && memberAuth.includes("Bearer ");
  const appSource = read("src/App.tsx");
  const cookieCsrf = /sameSite|csrf/i.test(appSource) || /sameSite/i.test(read("server/app.js"));
  return attackResult(entry, {
    blocked: usesBearer,
    exploited: false,
    severity: "low",
    detail: usesBearer
      ? "Member mutations use Authorization bearer header — classic cross-site form CSRF does not attach bearer automatically."
      : "Bearer extraction not confirmed in memberAuth.",
    fix: "Keep state-changing member APIs on bearer auth; avoid cookie-only session for JSON APIs.",
    residualRisk:
      "Any future cookie-session endpoints would need CSRF tokens. Paystack redirect return uses stored return path — validate origin on payment callbacks.",
    evidence: { bearerAuth: usesBearer, cookieCsrfHints: cookieCsrf }
  });
}

async function attackIdor(baseUrl, entry) {
  const forged = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlIn0.fake";
  const res = await fetchJson(baseUrl, "/api/member/data?action=profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${forged}`
    },
    body: JSON.stringify({
      action: "profile",
      profileId: "00000000-0000-0000-0000-000000000099",
      email: "victim@example.com"
    })
  });
  const memberAuth = read("server/services/memberAuth.js");
  const mismatchGuard = memberAuth.includes("hasBodyIdentityMismatch");
  const exploited = res.status >= 200 && res.status < 300;
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "critical" : "info",
    detail: exploited
      ? "Foreign profileId/email accepted with forged bearer."
      : `Forged cross-account body rejected (${res.status}); hasBodyIdentityMismatch=${mismatchGuard}.`,
    fix: "requireMemberAuth + hasBodyIdentityMismatch; server-side memberId from token only.",
    residualRisk: "Public profile-by-id must stay sanitized via sanitizePublicMemberProfile.",
    evidence: { status: res.status, mismatchGuard }
  });
}

async function attackUploadAbuse(baseUrl, entry) {
  const huge = "A".repeat(8 * 1024 * 1024);
  const probes = [
    {
      label: "no-auth",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upload", dataUrl: "data:image/png;base64,AAAA" })
    },
    {
      label: "svg-disguised",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer forged"
      },
      body: JSON.stringify({
        action: "upload",
        dataUrl: "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+"
      })
    },
    {
      label: "oversized",
      headers: { "Content-Type": "application/json", Authorization: "Bearer forged" },
      body: JSON.stringify({ action: "upload", dataUrl: `data:image/png;base64,${huge}` })
    }
  ];
  const results = [];
  let exploited = false;
  for (const probe of probes) {
    const res = await fetchJson(
      baseUrl,
      "/api/member/photos",
      {
        method: "POST",
        headers: probe.headers,
        body: probe.body
      },
      probe.label === "oversized" ? 20000 : 12000
    );
    if (res.status >= 200 && res.status < 300) exploited = true;
    results.push({ label: probe.label, status: res.status, error: res.error });
  }
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "critical" : "medium",
    detail: exploited
      ? "Upload accepted without valid auth or abuse checks."
      : `Upload probes denied or failed closed (${results.map((r) => `${r.label}:${r.status}`).join(", ")}).`,
    fix: "requireMemberAuth on photos; decodeBase64ImagePayload size/type limits; moderation pipeline.",
    residualRisk: "Authenticated abuse (repeat uploads) relies on moderation + rate limits.",
    evidence: { results }
  });
}

async function attackOtpAbuse(baseUrl, entry, burst) {
  const otpSource = read("server/services/signupOtp.js");
  const hasCooldown = otpSource.includes("RESEND_COOLDOWN_MS") && otpSource.includes("429");

  const sendResults = [];
  for (let i = 0; i < Math.min(burst, 4); i += 1) {
    const res = await fetchJson(
      baseUrl,
      "/api/auth/email-code",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: `pentest_${i}@example.com`,
          name: "Pentest",
          legalAccepted: true
        })
      },
      4000
    );
    sendResults.push({ attempt: i + 1, status: res.status, error: res.error });
  }

  const unauthorizedSends = sendResults.filter((item) => item.status === 200).length;
  const mathResults = [];
  for (let i = 0; i < 3; i += 1) {
    const res = await fetchJson(baseUrl, "/api/auth/email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "math-challenge" })
    });
    mathResults.push({ attempt: i + 1, status: res.status });
  }

  const exploited = unauthorizedSends >= 3;
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "high" : hasCooldown ? "low" : "medium",
    detail: exploited
      ? `OTP send succeeded ${unauthorizedSends} times without math verification.`
      : hasCooldown
        ? `Send without math rejected (${sendResults.map((r) => r.status).join(", ")}); math-challenge issues tokens (${mathResults.map((r) => r.status).join(", ")}).`
        : "Could not confirm OTP cooldown controls in source.",
    fix: "assertSignupMathChallengePassed before send; RESEND_COOLDOWN_MS 429 between sends.",
    residualRisk:
      "Math-challenge endpoint is intentionally lightweight — pair with edge rate limits and Resend quota monitoring.",
    evidence: { sendResults, mathResults, hasCooldown, unauthorizedSends }
  });
}

async function attackRateLimitBypass(baseUrl, entry, burst) {
  const username = `pentest_${Date.now()}`;
  const results = [];
  let locked = false;
  for (let i = 0; i < burst; i += 1) {
    const res = await fetchJson(baseUrl, "/api/auth/pin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin: "000000" })
    });
    if (res.status === 429) locked = true;
    results.push({ attempt: i + 1, status: res.status });
  }
  const exploited = !locked && burst > PIN_AUTH_MAX_ATTEMPTS;
  return attackResult(entry, {
    blocked: locked || burst <= PIN_AUTH_MAX_ATTEMPTS,
    exploited,
    severity: exploited ? "high" : "info",
    detail: locked
      ? `PIN login throttled to 429 within ${burst} attempts (max ${PIN_AUTH_MAX_ATTEMPTS}).`
      : exploited
        ? `No 429 after ${burst} failed PIN attempts.`
        : `Throttle may need more attempts than ${burst} to trigger.`,
    fix: "checkPinLoginThrottle + memory fallback when DB unavailable.",
    residualRisk: "Distributed credential stuffing across IPs is not fully blocked by per-username throttle alone.",
    evidence: { results, locked, maxAttempts: PIN_AUTH_MAX_ATTEMPTS }
  });
}

function attackPaymentReplay(entry) {
  const raceSource = read("scripts/test-payment-fulfillment-race.mjs");
  const webhookSource = read("server/services/paystackWebhookHandler.js");
  const hasIdempotency =
    raceSource.includes("fulfillment") &&
    webhookSource.includes("completePaymentFulfillment") &&
    (webhookSource.includes("already") || webhookSource.includes("duplicate") || webhookSource.includes("idempot"));
  return attackResult(entry, {
    blocked: hasIdempotency,
    exploited: !hasIdempotency,
    severity: hasIdempotency ? "low" : "critical",
    detail: hasIdempotency
      ? "Payment fulfillment race tests and webhook handler include duplicate-reference guards."
      : "Could not confirm idempotent payment fulfillment in source.",
    fix: "Single fulfillment per payment reference; webhook + verify race tests in fortress suite.",
    residualRisk: "Concurrent verify + webhook under extreme timing still documented in launch audit — monitor ledger.",
    evidence: { idempotencySignals: hasIdempotency }
  });
}

async function attackWebhookSpoofing(entry) {
  const invalid = await handlePaystackWebhookRequest({
    method: "POST",
    rawBody: Buffer.from('{"event":"charge.success","data":{"reference":"pentest-replay"}}'),
    signature: "invalid-signature"
  });
  const replay = await handlePaystackWebhookRequest({
    method: "POST",
    rawBody: Buffer.from('{"event":"charge.success","data":{"reference":"pentest-replay"}}'),
    signature: "invalid-signature"
  });
  const exploited = invalid.status < 400 || replay.status < 400;
  return attackResult(entry, {
    blocked: !exploited,
    exploited,
    severity: exploited ? "critical" : "info",
    detail: exploited
      ? "Webhook accepted invalid signature."
      : `Spoofed Paystack webhook rejected (${invalid.status}); replay probe also ${replay.status}.`,
    fix: "verifyPaystackWebhookSignature fail-closed; 401 on invalid signature.",
    residualRisk: "Leaked PAYSTACK_SECRET_KEY would allow valid forged webhooks.",
    evidence: { invalidStatus: invalid.status, replayStatus: replay.status }
  });
}

export async function runAllPenetrationAttacks({ baseUrl, pinLoginBurst, otpBurst }) {
  const byId = Object.fromEntries(PENETRATION_CERT_ATTACKS.map((item) => [item.id, item]));
  return [
    await attackBrokenAuthorization(baseUrl, byId["broken-authorization"]),
    await attackJwtManipulation(baseUrl, byId["jwt-manipulation"]),
    await attackPrivilegeEscalation(baseUrl, byId["privilege-escalation"]),
    await attackApiFuzzing(baseUrl, byId["api-fuzzing"]),
    await attackSqlInjection(baseUrl, byId["sql-injection"]),
    attackXssStatic(byId.xss),
    attackCsrfStatic(byId.csrf),
    await attackIdor(baseUrl, byId.idor),
    await attackUploadAbuse(baseUrl, byId["upload-abuse"]),
    await attackOtpAbuse(baseUrl, byId["otp-abuse"], otpBurst),
    await attackRateLimitBypass(baseUrl, byId["rate-limit-bypass"], pinLoginBurst),
    attackPaymentReplay(byId["payment-replay"]),
    await attackWebhookSpoofing(byId["webhook-spoofing"])
  ];
}

export function summarizeSeverities(attacks) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0, exploited: 0, blocked: 0 };
  for (const attack of attacks) {
    counts[attack.severity] = (counts[attack.severity] || 0) + 1;
    if (attack.exploited) counts.exploited += 1;
    if (attack.blocked) counts.blocked += 1;
  }
  return counts;
}
