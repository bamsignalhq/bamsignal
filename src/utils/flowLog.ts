/** Dev-only signup→home flow tracing. Never logs secrets or PII. */
const SENSITIVE_KEYS = new Set([
  "password",
  "pin",
  "code",
  "token",
  "otp",
  "email",
  "phone",
  "authorization",
  "imagebase64",
  "imageBase64"
]);

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) return "[redacted]";
  if (typeof value === "string" && value.length > 120) return `[string:${value.length}]`;
  if (Array.isArray(value)) return `[array:${value.length}]`;
  return value;
}

function safeDetail(detail?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!detail) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = safeDetail(value as Record<string, unknown>);
    } else {
      out[key] = redactValue(key, value);
    }
  }
  return out;
}

export function flowLog(event: string, detail?: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return;
  const payload = safeDetail(detail);
  if (payload && Object.keys(payload).length > 0) {
    console.info(`[bamsignal:flow] ${event}`, payload);
  } else {
    console.info(`[bamsignal:flow] ${event}`);
  }
}
