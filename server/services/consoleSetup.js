import { listPlatformAdmins } from "../db.js";
import { bootstrapOpsAdmin } from "./adminBootstrap.js";

export async function hasConsoleOperator() {
  const admins = await listPlatformAdmins();
  return admins.some((row) => row.active);
}

export async function needsConsoleSetup() {
  return !(await hasConsoleOperator());
}

export async function createConsoleOperator({ email, password, confirmPassword } = {}) {
  if (!(await needsConsoleSetup())) {
    return { ok: false, status: 404, error: "not_found" };
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
    return { ok: false, status: 500, error: "Request failed." };
  }

  return { ok: true, status: 200, email: result.email, userId: result.userId, created: result.created };
}
