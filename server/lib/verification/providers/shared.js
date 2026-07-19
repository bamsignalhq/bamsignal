import { createHash } from "node:crypto";

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function similarityToConfidence(similarity) {
  const clamped = Math.max(-1, Math.min(1, similarity));
  return Math.round(((clamped + 1) / 2) * 100);
}

/** Deterministic pseudo-embedding from image bytes — used only when remote ML is unavailable. */
export function hashEmbedding(imageBytes, provider, modelVersion, dims = 128) {
  const digest = createHash("sha256").update(Buffer.from(imageBytes)).digest();
  const vector = [];
  for (let i = 0; i < dims; i += 1) {
    const byte = digest[i % digest.length];
    vector.push((byte / 255) * 2 - 1);
  }
  return { provider, modelVersion, vector, dims };
}

export function compareEmbeddings(a, b) {
  const similarity = cosineSimilarity(a?.vector, b?.vector);
  return {
    similarity,
    confidence: similarityToConfidence(similarity),
    modelVersion: a?.modelVersion || b?.modelVersion || "unknown"
  };
}

export async function callRemoteFaceService({
  endpoint,
  apiKey,
  timeoutMs = 15000,
  path = "/verify",
  body
}) {
  if (!endpoint) {
    const err = new Error("Face verification endpoint is not configured.");
    err.code = "provider_unavailable";
    throw err;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(payload?.error || payload?.message || "Face provider request failed.");
      err.code = "provider_unavailable";
      err.status = response.status;
      throw err;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

export function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}
