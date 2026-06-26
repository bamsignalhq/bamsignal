/** Security Certification™ — release gate severity rules. */

export const SECURITY_CERT_BLOCK_ON = {
  critical: true,
  high: true,
  medium: false,
  low: false
};

export const SECURITY_CERT_SECRET_PATTERNS = [
  { pattern: /sk_live_[a-z0-9]+/i, label: "Paystack live secret" },
  { pattern: /sk_test_[a-z0-9]+/i, label: "Paystack test secret" },
  { pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"][^'"]+['"]/i, label: "Supabase service role in source" },
  { pattern: /BEGIN PRIVATE KEY/i, label: "Private key material" },
  { pattern: /xox[baprs]-[a-z0-9-]+/i, label: "Slack token" }
];

export const SECURITY_CERT_CLIENT_PATHS = [
  "src/",
  "public/",
  "index.html"
];

export const SECURITY_CERT_CHECK_IDS = [
  "owasp-top-10",
  "dependency-audit",
  "secrets-scan",
  "permission-audit",
  "rls-verification",
  "jwt-validation",
  "rate-limiting",
  "session-fixation",
  "broken-access-control",
  "idor-scan",
  "xss-scan",
  "csrf-scan",
  "upload-validation",
  "webhook-validation",
  "otp-abuse",
  "payment-abuse"
];
