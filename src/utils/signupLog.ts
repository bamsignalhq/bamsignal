/** Dev-only signup tracing — never logs secrets or PII. */
export function signupLog(
  tag: "signup-step-2" | "signup-validation" | "signup-submit" | "otp-send",
  detail?: Record<string, unknown>
): void {
  if (!import.meta.env.DEV) return;
  if (detail && Object.keys(detail).length > 0) {
    console.info(`[${tag}]`, detail);
  } else {
    console.info(`[${tag}]`);
  }
}
