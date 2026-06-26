/** Production Penetration Certification™ — attacker simulation registry. */

export const PENETRATION_CERT_BRAND = "Production Penetration Certification™";

export const PENETRATION_CERT_BLOCK_ON_EXPLOIT = true;

export const PENETRATION_CERT_ATTACKS = [
  { id: "broken-authorization", label: "Broken authorization", category: "authz", critical: true },
  { id: "jwt-manipulation", label: "JWT manipulation", category: "authn", critical: true },
  { id: "privilege-escalation", label: "Privilege escalation", category: "authz", critical: true },
  { id: "api-fuzzing", label: "API fuzzing", category: "input", critical: true },
  { id: "sql-injection", label: "SQL injection", category: "injection", critical: true },
  { id: "xss", label: "XSS", category: "injection", critical: true },
  { id: "csrf", label: "CSRF", category: "session", critical: false },
  { id: "idor", label: "IDOR", category: "authz", critical: true },
  { id: "upload-abuse", label: "Upload abuse", category: "upload", critical: true },
  { id: "otp-abuse", label: "OTP abuse", category: "authn", critical: true },
  { id: "rate-limit-bypass", label: "Rate limit bypass", category: "abuse", critical: true },
  { id: "payment-replay", label: "Payment replay", category: "payment", critical: true },
  { id: "webhook-spoofing", label: "Webhook spoofing", category: "payment", critical: true }
];

export const PENETRATION_CERT_SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];
