import type { FaceAnalysis } from "./photoFaceAnalysis";
import { LOGO_LIKELIHOOD_THRESHOLD, TEXT_HEAVY_DENSITY } from "../../shared/photoQualityScore.mjs";
import { bitmapToCanvas, loadImageBitmap } from "./photoImageBitmap";

export type VisualHeuristicResult = {
  logoLikelihood: number;
  landscapeLikelihood: number;
  humanConfidence: number;
};

function dominantFlatColorShare(data: Uint8ClampedArray, width: number, height: number): number {
  const buckets = new Map<number, number>();
  let samples = 0;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      const r = Math.round(data[i] / 32);
      const g = Math.round(data[i + 1] / 32);
      const b = Math.round(data[i + 2] / 32);
      const key = (r << 10) | (g << 5) | b;
      buckets.set(key, (buckets.get(key) || 0) + 1);
      samples++;
    }
  }
  if (!samples) return 0;
  const max = Math.max(...buckets.values());
  return max / samples;
}

function bandColorShare(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  yStartRatio: number,
  yEndRatio: number,
  predicate: (r: number, g: number, b: number) => boolean
): number {
  const y0 = Math.floor(height * yStartRatio);
  const y1 = Math.floor(height * yEndRatio);
  let hits = 0;
  let samples = 0;
  for (let y = y0; y < y1; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * 4;
      if (predicate(data[i], data[i + 1], data[i + 2])) hits++;
      samples++;
    }
  }
  return samples ? hits / samples : 0;
}

function measureEdgeUniformity(data: Uint8ClampedArray, width: number, height: number): number {
  let strongEdges = 0;
  let samples = 0;
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = (y * width + x) * 4;
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const right = data[i + 4] * 0.299 + data[i + 5] * 0.587 + data[i + 6] * 0.114;
      if (Math.abs(lum - right) > 48) strongEdges++;
      samples++;
    }
  }
  return samples ? strongEdges / samples : 0;
}

export function scoreVisualHeuristics(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  faceAnalysis: FaceAnalysis,
  textDensity: number
): VisualHeuristicResult {
  const flatShare = dominantFlatColorShare(data, width, height);
  const skyShare = bandColorShare(data, width, height, 0, 0.34, (r, g, b) => b > r + 8 && b > g && g > 70);
  const groundShare = bandColorShare(
    data,
    width,
    height,
    0.55,
    1,
    (r, g, b) => g > r && g > b && g > 55
  );
  const edgeUniformity = measureEdgeUniformity(data, width, height);

  let logoLikelihood = 0;
  let landscapeLikelihood = 0;

  if (!faceAnalysis.hasAdequateFace) {
    if (flatShare > 0.34) logoLikelihood += 0.42;
    if (flatShare > 0.48) logoLikelihood += 0.2;
    if (edgeUniformity > 0.12 && edgeUniformity < 0.22 && flatShare > 0.28) logoLikelihood += 0.18;
    if (textDensity > 0.1 && textDensity < TEXT_HEAVY_DENSITY) logoLikelihood += 0.22;

    if (skyShare > 0.42 && groundShare > 0.28) landscapeLikelihood += 0.55;
    if (skyShare > 0.3 && groundShare > 0.2) landscapeLikelihood += 0.2;
  }

  logoLikelihood = Math.min(1, logoLikelihood);
  landscapeLikelihood = Math.min(1, landscapeLikelihood);

  let humanConfidence = 0.2;
  if (faceAnalysis.hasAdequateFace) {
    humanConfidence = 0.55 + Math.min(0.4, faceAnalysis.largestFaceAreaRatio * 4);
  } else if (faceAnalysis.detected) {
    humanConfidence = 0.35;
  } else {
    humanConfidence = Math.max(0.05, 0.22 - logoLikelihood * 0.2 - landscapeLikelihood * 0.15);
  }

  if (logoLikelihood >= LOGO_LIKELIHOOD_THRESHOLD) {
    humanConfidence = Math.min(humanConfidence, 0.25);
  }

  return { logoLikelihood, landscapeLikelihood, humanConfidence };
}

export async function analyzeVisualHeuristics(
  file: File,
  faceAnalysis: FaceAnalysis,
  textDensity: number
): Promise<VisualHeuristicResult> {
  const bitmap = await loadImageBitmap(file);
  try {
    const canvas = bitmapToCanvas(bitmap, 480);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { logoLikelihood: 0, landscapeLikelihood: 0, humanConfidence: 0.2 };
    }
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return scoreVisualHeuristics(data, width, height, faceAnalysis, textDensity);
  } finally {
    bitmap.close?.();
  }
}
