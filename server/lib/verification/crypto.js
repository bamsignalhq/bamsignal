import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function metadataKey() {
  const raw =
    process.env.VERIFICATION_METADATA_KEY?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "bamsignal-dev-verification-key";
  return createHash("sha256").update(raw).digest();
}

/** Encrypt JSON metadata for audit / result payloads. Never put embeddings in client responses. */
export function encryptVerificationMetadata(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", metadataKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value ?? {}), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptVerificationMetadata(payload) {
  if (!payload) return null;
  try {
    const buf = Buffer.from(String(payload), "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", metadataKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
  } catch {
    return null;
  }
}

/** One-way fingerprint for duplicate-face checks — not reversible to embedding. */
export function embeddingFingerprint(embedding) {
  if (!embedding?.vector?.length) return null;
  return createHash("sha256")
    .update(embedding.provider || "")
    .update("|")
    .update(embedding.modelVersion || "")
    .update("|")
    .update(Buffer.from(Float32Array.from(embedding.vector).buffer))
    .digest("hex");
}
