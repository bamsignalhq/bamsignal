function normalizeEnvValue(value = "") {
  return String(value).trim().replace(/^\uFEFF/, "").replace(/^['"]|['"]$/g, "");
}

export function normalizeFirebasePrivateKey(key = "") {
  return normalizeEnvValue(key).replace(/\\n/g, "\n");
}

function isValidServiceAccountShape(account) {
  if (!account || typeof account !== "object") return false;
  const projectId = String(account.project_id || account.projectId || "").trim();
  const clientEmail = String(account.client_email || account.clientEmail || "").trim();
  const privateKey = normalizeFirebasePrivateKey(account.private_key || account.privateKey || "");
  return Boolean(
    projectId &&
      clientEmail &&
      privateKey.includes("BEGIN PRIVATE KEY") &&
      privateKey.includes("END PRIVATE KEY")
  );
}

function normalizeServiceAccount(raw) {
  if (!isValidServiceAccountShape(raw)) return null;
  return {
    type: "service_account",
    project_id: String(raw.project_id || raw.projectId).trim(),
    client_email: String(raw.client_email || raw.clientEmail).trim(),
    private_key: normalizeFirebasePrivateKey(raw.private_key || raw.privateKey)
  };
}

function parseServiceAccountJson(raw) {
  const trimmed = normalizeEnvValue(raw);
  if (!trimmed || trimmed.startsWith("<")) return null;
  try {
    return normalizeServiceAccount(JSON.parse(trimmed));
  } catch {
    return null;
  }
}

function buildServiceAccountFromParts() {
  const projectId = normalizeEnvValue(process.env.FIREBASE_PROJECT_ID || "");
  const clientEmail = normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL || "");
  const privateKey = normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY || "");
  if (!projectId || !clientEmail || !privateKey) return null;
  return normalizeServiceAccount({
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey
  });
}

/** Resolve Firebase Admin credentials from JSON blob or discrete env vars. */
export function resolveFirebaseServiceAccount() {
  const fromJson = parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "");
  if (fromJson) return fromJson;
  return buildServiceAccountFromParts();
}

export function getFirebaseEnvTrace() {
  const hasServiceAccountJson = Boolean(normalizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || ""));
  const hasProjectId = Boolean(normalizeEnvValue(process.env.FIREBASE_PROJECT_ID || ""));
  const hasClientEmail = Boolean(normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL || ""));
  const hasPrivateKey = Boolean(normalizeEnvValue(process.env.FIREBASE_PRIVATE_KEY || ""));
  const hasResolvedAccount = Boolean(resolveFirebaseServiceAccount());

  let error;
  if ((hasServiceAccountJson || hasProjectId || hasClientEmail || hasPrivateKey) && !hasResolvedAccount) {
    error = "Invalid or incomplete Firebase credentials";
  }

  return {
    hasServiceAccountJson,
    hasProjectId,
    hasClientEmail,
    hasPrivateKey,
    hasResolvedAccount,
    error
  };
}

export function getFirebaseHealthTrace(probeResult) {
  const envTrace = getFirebaseEnvTrace();
  const initialized = Boolean(probeResult?.initialized);
  const error = probeResult?.error || envTrace.error;

  return {
    hasServiceAccountJson: envTrace.hasServiceAccountJson,
    hasProjectId: envTrace.hasProjectId,
    hasClientEmail: envTrace.hasClientEmail,
    hasPrivateKey: envTrace.hasPrivateKey,
    initialized,
    ...(error ? { error } : {})
  };
}

export function isFirebaseConfigured(probeResult) {
  return Boolean(probeResult?.initialized);
}
