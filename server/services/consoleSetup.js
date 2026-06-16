import { listPlatformAdmins } from "../db.js";
import { bootstrapOpsAdmin } from "./adminBootstrap.js";

export async function hasConsoleOperator() {
  const admins = await listPlatformAdmins();
  return admins.some((row) => row.active);
}

export async function needsConsoleSetup() {
  return !(await hasConsoleOperator());
}

export async function createConsoleOperator({ email, password, confirmPassword, setupSecret } = {}) {
  const cronSecret = String(process.env.CRON_SECRET || "").trim();
  if (!cronSecret) {
    return { ok: false, status: 503, error: "Server setup is not configured yet." };
  }
  if (String(setupSecret || "").trim() !== cronSecret) {
    return { ok: false, status: 403, error: "Invalid setup secret." };
  }
  if (!(await needsConsoleSetup())) {
    return { ok: false, status: 409, error: "Command Center access already exists." };
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail.includes("@")) {
    return { ok: false, status: 400, error: "Valid email is required." };
  }

  const pwd = String(password || "").trim();
  const confirm = String(confirmPassword || "").trim();
  if (pwd.length < 8) {
    return { ok: false, status: 400, error: "Password must be at least 8 characters." };
  }
  if (pwd !== confirm) {
    return { ok: false, status: 400, error: "Passwords do not match." };
  }

  const result = await bootstrapOpsAdmin({
    email: normalizedEmail,
    password: pwd,
    role: "operator"
  });
  if (!result.ok) {
    return { ...result, status: 500 };
  }

  return { ok: true, status: 200, email: result.email, userId: result.userId, created: result.created };
}
