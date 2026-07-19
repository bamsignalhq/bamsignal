/**
 * Liveness heuristics — provider-agnostic image checks.
 * Heavy ML liveness (blink/motion) belongs in the face provider remote service when available.
 */
export type LivenessInput = {
  imageBytes: Uint8Array;
  contentType: string;
  challengeId?: string;
  /** Client-reported challenge response (e.g. turn head) — optional. */
  challengeResponse?: string;
};

export type LivenessResult = {
  passed: boolean;
  score: number;
  reasons: string[];
};

function meanVariance(bytes: Uint8Array): { mean: number; variance: number } {
  if (!bytes.length) return { mean: 0, variance: 0 };
  let sum = 0;
  const step = Math.max(1, Math.floor(bytes.length / 4000));
  let count = 0;
  for (let i = 0; i < bytes.length; i += step) {
    sum += bytes[i];
    count += 1;
  }
  const mean = sum / count;
  let varSum = 0;
  for (let i = 0; i < bytes.length; i += step) {
    const d = bytes[i] - mean;
    varSum += d * d;
  }
  return { mean, variance: varSum / count };
}

/**
 * Basic anti-blank / anti-solid-color gate. Providers may override with true liveness.
 */
export function runBasicLivenessCheck(input: LivenessInput): LivenessResult {
  const reasons: string[] = [];
  const size = input.imageBytes?.length || 0;

  if (size < 8_000) {
    reasons.push("image_too_small");
    return { passed: false, score: 10, reasons };
  }
  if (size > 6 * 1024 * 1024) {
    reasons.push("image_too_large");
    return { passed: false, score: 10, reasons };
  }

  const type = String(input.contentType || "").toLowerCase();
  if (!type.startsWith("image/")) {
    reasons.push("invalid_content_type");
    return { passed: false, score: 0, reasons };
  }

  const { mean, variance } = meanVariance(input.imageBytes);
  if (variance < 80) {
    reasons.push("low_texture_variance");
    return { passed: false, score: 25, reasons };
  }
  if (mean < 15 || mean > 245) {
    reasons.push("extreme_brightness");
    return { passed: false, score: 30, reasons };
  }

  let score = 70;
  if (variance > 400) score += 10;
  if (size > 40_000) score += 10;
  if (input.challengeId && input.challengeResponse) score += 10;

  return { passed: score >= 70, score: Math.min(100, score), reasons };
}
