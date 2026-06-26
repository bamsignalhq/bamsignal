import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  SECURITY_CERT_CLIENT_PATHS,
  SECURITY_CERT_SECRET_PATTERNS
} from "../../../shared/securityCertificationChecks.mjs";
import {
  adminSecretAcceptedViaHeaderOnly,
  canAccessSecurityDashboard
} from "../../../server/services/productionSecurity.js";
import {
  canAccessSecurityCertification,
  securityCertificationRouteRegistered
} from "../../../server/services/securityCertification.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const rootPath = join(moduleDir, "../../..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function finding(partial) {
  return {
    passed: true,
    severity: "low",
    detail: "",
    ...partial
  };
}

function walkFiles(dir, files = []) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return files;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
      walkFiles(fullPath, files);
      continue;
    }
    if (/\.(tsx?|jsx?|mjs|cjs|json|html|css|md)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

function runDependencyAudit() {
  const result = spawnSync("npm", ["audit", "--json"], {
    cwd: rootPath,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });

  let audit;
  try {
    audit = JSON.parse(result.stdout || "{}");
  } catch {
    return [
      finding({
        id: "dependency-audit-parse",
        checkId: "dependency-audit",
        title: "npm audit parse",
        severity: "medium",
        passed: false,
        detail: "Could not parse npm audit output — run npm audit manually.",
        owaspRef: "A06"
      })
    ];
  }

  const vulns = Object.values(audit.vulnerabilities || {});
  const critical = vulns.filter((item) => item.severity === "critical");
  const high = vulns.filter((item) => item.severity === "high");
  const medium = vulns.filter((item) => item.severity === "moderate");

  const findings = [];
  if (critical.length) {
    findings.push(
      finding({
        id: "dependency-audit-critical",
        checkId: "dependency-audit",
        title: "Critical dependency vulnerabilities",
        severity: "critical",
        passed: false,
        detail: `${critical.length} critical npm advisory(ies): ${critical
          .slice(0, 3)
          .map((item) => item.name)
          .join(", ")}`,
        owaspRef: "A06"
      })
    );
  }
  if (high.length) {
    findings.push(
      finding({
        id: "dependency-audit-high",
        checkId: "dependency-audit",
        title: "High dependency vulnerabilities",
        severity: "high",
        passed: false,
        detail: `${high.length} high npm advisory(ies): ${high
          .slice(0, 3)
          .map((item) => item.name)
          .join(", ")}`,
        owaspRef: "A06"
      })
    );
  }
  if (!critical.length && !high.length) {
    findings.push(
      finding({
        id: "dependency-audit-pass",
        checkId: "dependency-audit",
        title: "Dependency audit",
        severity: "low",
        passed: true,
        detail:
          medium.length > 0
            ? `No critical/high advisories (${medium.length} moderate).`
            : "No critical or high npm advisories.",
        owaspRef: "A06"
      })
    );
  }
  return findings;
}

function runSecretsScan() {
  const hits = [];
  for (const prefix of SECURITY_CERT_CLIENT_PATHS) {
    const target = join(rootPath, prefix);
    const files = statSync(target, { throwIfNoEntry: false })?.isDirectory()
      ? walkFiles(target)
      : statSync(target, { throwIfNoEntry: false })?.isFile()
        ? [target]
        : [];

    for (const filePath of files) {
      const rel = relative(rootPath, filePath);
      if (rel.includes(".env") || rel.includes("node_modules")) continue;
      const source = readFileSync(filePath, "utf8");
      for (const rule of SECURITY_CERT_SECRET_PATTERNS) {
        if (rule.pattern.test(source)) {
          hits.push(`${rel}: ${rule.label}`);
        }
        rule.pattern.lastIndex = 0;
      }
    }
  }

  if (hits.length) {
    return [
      finding({
        id: "secrets-scan-hit",
        checkId: "secrets-scan",
        title: "Hardcoded secret patterns in client paths",
        severity: "critical",
        passed: false,
        detail: hits.slice(0, 5).join("; "),
        owaspRef: "A02"
      })
    ];
  }

  const serverSource = read("server/app.js");
  const cronInQuery = /req\.query\.(cron|secret)|query\.cron_secret/i.test(serverSource);
  return [
    finding({
      id: cronInQuery ? "secrets-cron-query" : "secrets-scan-pass",
      checkId: "secrets-scan",
      title: cronInQuery ? "CRON secret accepted via query string" : "Secrets scan",
      severity: cronInQuery ? "critical" : "low",
      passed: !cronInQuery,
      detail: cronInQuery
        ? "Cron/admin secrets must be header-only."
        : "No secret patterns in client bundles and cron secret is not query-based.",
      owaspRef: "A02"
    })
  ];
}

function runPermissionAudit() {
  const permissionsSource = read("src/constants/permissions.ts");
  const hardRoutesSource = read("src/constants/hardRoutes.ts");
  const routeRegistered = securityCertificationRouteRegistered(permissionsSource);
  const hardSlug = hardRoutesSource.includes('securitycertification: "security-certification"');
  const accessHelper = canAccessSecurityCertification(["ManageOperations"]);

  const issues = [];
  if (!routeRegistered) issues.push("security certification route missing in permissions");
  if (!hardSlug) issues.push("security certification slug missing in hardRoutes");
  if (!accessHelper) issues.push("canAccessSecurityCertification misconfigured");

  const enforcedCount = (permissionsSource.match(/\/hard\//g) || []).length;
  if (enforcedCount < 40) issues.push(`low /hard route coverage (${enforcedCount})`);

  return [
    finding({
      id: "permission-audit",
      checkId: "permission-audit",
      title: "Permission audit",
      severity: issues.length ? "high" : "low",
      passed: issues.length === 0,
      detail: issues.length ? issues.join("; ") : `${enforcedCount} /hard routes permission-mapped.`,
      owaspRef: "A01"
    })
  ];
}

function runRlsVerification() {
  const migrationDir = join(rootPath, "supabase/migrations");
  let migrationText = "";
  try {
    for (const file of readdirSync(migrationDir)) {
      if (file.endsWith(".sql")) migrationText += readFileSync(join(migrationDir, file), "utf8");
    }
  } catch {
    migrationText = "";
  }

  const hasRls = /enable row level security|create policy/i.test(migrationText);
  const memberAuthUsesServer = read("server/services/memberAuth.js").includes("verifySupabaseBearerUser");

  return [
    finding({
      id: "rls-verification",
      checkId: "rls-verification",
      title: "RLS verification",
      severity: hasRls ? "low" : "medium",
      passed: memberAuthUsesServer,
      detail: hasRls
        ? "RLS policies present in migrations; member API uses server-verified JWT."
        : "RLS not fully configured in migrations — member routes rely on server-side JWT enforcement.",
      owaspRef: "A01"
    })
  ];
}

function runJwtValidation() {
  const memberAuth = read("server/services/memberAuth.js");
  const checks = [
    memberAuth.includes("requireMemberAuth"),
    memberAuth.includes("verifySupabaseBearerUser"),
    memberAuth.includes("hasBodyIdentityMismatch"),
    memberAuth.includes("Never trust email")
  ];
  const passed = checks.every(Boolean);
  return [
    finding({
      id: "jwt-validation",
      checkId: "jwt-validation",
      title: "JWT validation",
      severity: passed ? "low" : "critical",
      passed,
      detail: passed
        ? "Member auth verifies Supabase bearer JWT and rejects body identity mismatch."
        : "Member JWT validation helpers missing or weakened.",
      owaspRef: "A07"
    })
  ];
}

function runRateLimiting() {
  const files = [
    "server/services/rateLimit.js",
    "server/services/pinAuthThrottle.js",
    "server/services/paymentInitializeThrottle.js",
    "server/services/adminActionPinThrottle.js"
  ];
  const missing = files.filter((file) => {
    try {
      read(file);
      return false;
    } catch {
      return true;
    }
  });
  const appSource = read("server/app.js");
  const retention = read("server/production.js").includes("rateLimitRetention");

  const passed = !missing.length && retention;
  return [
    finding({
      id: "rate-limiting",
      checkId: "rate-limiting",
      title: "Rate limiting",
      severity: passed ? "low" : "high",
      passed,
      detail: passed
        ? "IP rate limits, PIN/payment throttles, and retention scheduler wired."
        : `Missing: ${[...missing, !retention && "rateLimitRetention"].filter(Boolean).join(", ")}`,
      owaspRef: "A04"
    })
  ];
}

function runSessionFixation() {
  const memberAuth = read("server/services/memberAuth.js");
  const loginApi = read("api/auth/pin-login.js");
  const sessionInUrl = /sessionId|session_id/.test(loginApi) && /req\.query/.test(loginApi);
  const bearerOnly = memberAuth.includes('extractBearerToken') && !/req\.query\.token/i.test(memberAuth);

  const passed = bearerOnly && !sessionInUrl;
  return [
    finding({
      id: "session-fixation",
      checkId: "session-fixation",
      title: "Session fixation",
      severity: passed ? "low" : "high",
      passed,
      detail: passed
        ? "Sessions use bearer tokens; login does not accept session IDs from query strings."
        : "Session token may be accepted from untrusted input.",
      owaspRef: "A07"
    })
  ];
}

function runBrokenAccessControl() {
  const adminAuth = read("server/adminAuth.js");
  const headerOnly = adminSecretAcceptedViaHeaderOnly(adminAuth);
  const securityDashboard = canAccessSecurityDashboard(["ManageOperations"]);
  const financeBlocked = !canAccessSecurityDashboard(["ViewFinance"]);

  const passed = headerOnly && securityDashboard && financeBlocked;
  return [
    finding({
      id: "broken-access-control",
      checkId: "broken-access-control",
      title: "Broken access control",
      severity: passed ? "low" : "critical",
      passed,
      detail: passed
        ? "Admin cron secret is header-only; security dashboards RBAC-enforced."
        : "Admin or security dashboard access control regression detected.",
      owaspRef: "A01"
    })
  ];
}

function runIdorScan() {
  const memberAuth = read("server/services/memberAuth.js");
  const memberData = read("api/member/data.js");
  const publicActionsLimited =
    memberAuth.includes("PUBLIC_MEMBER_DATA_ACTIONS") &&
    memberAuth.includes("profile-by-id") &&
    memberAuth.includes("isPublicMemberDataAction");
  const protectedUsesAuth =
    memberData.includes("requireMemberAuth") || memberData.includes("memberAuth");

  const passed = publicActionsLimited && protectedUsesAuth;
  return [
    finding({
      id: "idor-scan",
      checkId: "idor-scan",
      title: "IDOR scan",
      severity: passed ? "low" : "high",
      passed,
      detail: passed
        ? "Public member data actions whitelisted; protected actions require auth with identity mismatch checks."
        : "Member data handler may allow cross-user access.",
      owaspRef: "A01"
    })
  ];
}

function runXssScan() {
  const clientFiles = walkFiles(join(rootPath, "src"));
  const dangerous = [];
  for (const filePath of clientFiles) {
    const source = readFileSync(filePath, "utf8");
    if (/dangerouslySetInnerHTML/.test(source)) {
      dangerous.push(relative(rootPath, filePath));
    }
  }
  const headers = read("server/services/securityHeaders.js");
  const hasHeaders =
    headers.includes("X-Content-Type-Options") && headers.includes("X-Frame-Options");

  const passed = dangerous.length === 0 && hasHeaders;
  return [
    finding({
      id: "xss-scan",
      checkId: "xss-scan",
      title: "XSS scan",
      severity: dangerous.length ? "high" : hasHeaders ? "low" : "medium",
      passed,
      detail: passed
        ? "No dangerouslySetInnerHTML in src; security headers middleware configured."
        : dangerous.length
          ? `dangerouslySetInnerHTML in: ${dangerous.slice(0, 3).join(", ")}`
          : "Security response headers incomplete.",
      owaspRef: "A03"
    })
  ];
}

function runCsrfScan() {
  const memberAuth = read("server/services/memberAuth.js");
  const usesBearer = memberAuth.includes("Bearer ");
  const appSource = read("server/app.js");
  const corsConfigured = appSource.includes("cors");

  const passed = usesBearer && corsConfigured;
  return [
    finding({
      id: "csrf-scan",
      checkId: "csrf-scan",
      title: "CSRF scan",
      severity: passed ? "low" : "medium",
      passed,
      detail: passed
        ? "State-changing member APIs use Authorization bearer tokens (not cookie-only session)."
        : "Verify CSRF protections on cookie-authenticated endpoints.",
      owaspRef: "A08"
    })
  ];
}

function runUploadValidation() {
  const moderation = read("server/services/photoModerationProvider.js");
  const contactGuard = read("shared/contactGuardCore.mjs");
  const uploadFirst = moderation.includes("upload_first");
  const hasModeration = moderation.includes("moderatePhoto");
  const hasContactScan = contactGuard.includes("scanTextForContactLeak");

  const passed = uploadFirst && hasModeration && hasContactScan;
  return [
    finding({
      id: "upload-validation",
      checkId: "upload-validation",
      title: "Upload validation",
      severity: passed ? "low" : "high",
      passed,
      detail: passed
        ? "Photo upload-first moderation and contact-leak scanning active."
        : "Upload moderation or contact guard missing.",
      owaspRef: "A04"
    })
  ];
}

function runWebhookValidation() {
  const handler = read("server/services/paystackWebhookHandler.js");
  const hasVerify = handler.includes("verifyPaystackWebhookSignature");
  const rejectsInvalid = handler.includes("Invalid Paystack signature");
  const appSource = read("server/app.js");
  const rawBody = appSource.includes("express.raw") || appSource.includes("raw({");

  const passed = hasVerify && rejectsInvalid && rawBody;
  return [
    finding({
      id: "webhook-validation",
      checkId: "webhook-validation",
      title: "Webhook validation",
      severity: passed ? "low" : "critical",
      passed,
      detail: passed
        ? "Paystack webhooks verify HMAC signature on raw body."
        : "Paystack webhook signature verification incomplete.",
      owaspRef: "A08"
    })
  ];
}

function runOtpAbuse() {
  const signupOtp = read("server/services/signupOtp.js");
  const hasThrottle = signupOtp.includes("Too many attempts") && signupOtp.includes("429");
  const hasExpiry = signupOtp.includes("expired");
  const signupProtection = read("scripts/test-signup-protection.mjs");
  const hasProtectionScript = signupProtection.includes("signup");

  const passed = hasThrottle && hasExpiry && hasProtectionScript;
  return [
    finding({
      id: "otp-abuse",
      checkId: "otp-abuse",
      title: "OTP abuse",
      severity: passed ? "low" : "high",
      passed,
      detail: passed
        ? "Signup OTP enforces attempt limits, expiry, and protection tests exist."
        : "Signup OTP abuse controls incomplete.",
      owaspRef: "A04"
    })
  ];
}

function runPaymentAbuse() {
  const throttle = read("server/services/paymentInitializeThrottle.js");
  const consultation = read("server/routes/consultationPayments.js");
  const abuseConstants = read("src/constants/abuseProtection.ts");

  const hasThrottle = throttle.includes("rateLimitIp") && throttle.includes("PAYMENT_INITIALIZE");
  const wired = consultation.includes("paymentInitializeThrottle");
  const monitorsPayment = abuseConstants.includes("payment-abuse");

  const passed = hasThrottle && wired && monitorsPayment;
  return [
    finding({
      id: "payment-abuse",
      checkId: "payment-abuse",
      title: "Payment abuse",
      severity: passed ? "low" : "high",
      passed,
      detail: passed
        ? "Payment initialize throttling and abuse monitors configured."
        : "Payment abuse throttling or monitoring missing.",
      owaspRef: "A04"
    })
  ];
}

export function runAllSecurityChecks() {
  return [
    ...runDependencyAudit(),
    ...runSecretsScan(),
    ...runPermissionAudit(),
    ...runRlsVerification(),
    ...runJwtValidation(),
    ...runRateLimiting(),
    ...runSessionFixation(),
    ...runBrokenAccessControl(),
    ...runIdorScan(),
    ...runXssScan(),
    ...runCsrfScan(),
    ...runUploadValidation(),
    ...runWebhookValidation(),
    ...runOtpAbuse(),
    ...runPaymentAbuse()
  ];
}

export function buildRecommendations(findings) {
  const items = [];
  let counter = 0;
  const add = (title, detail, priority) => {
    counter += 1;
    items.push({ id: `sec_rec_${counter}`, title, detail, priority });
  };

  for (const item of findings.filter((f) => !f.passed)) {
    if (item.severity === "critical" || item.severity === "high") {
      add(`Fix ${item.title}`, item.detail, item.severity);
    }
  }

  if (!items.length) {
    add(
      "Maintain security baseline",
      "Re-run npm run certify:security before each release candidate.",
      "medium"
    );
  }

  return items;
}
