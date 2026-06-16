/** Command Center env vars with legacy fallbacks. */

export function commandCenterEmails() {
  return (process.env.COMMAND_CENTER_EMAILS || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function commandCenterPin() {
  return String(process.env.COMMAND_CENTER_PIN || process.env.ADMIN_ACTION_PIN || "").trim();
}
