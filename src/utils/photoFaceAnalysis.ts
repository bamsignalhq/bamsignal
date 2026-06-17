import {
  faceAreaPassesProfileCheck,
  MIN_LARGEST_FACE_AREA_RATIO
} from "../../shared/photoQualityScore.mjs";
import { bitmapToCanvas, loadImageBitmap } from "./photoImageBitmap";

export type BlazeFaceBox = {
  topLeft: [number, number];
  bottomRight: [number, number];
  probability?: number;
};

export type FaceAnalysis = {
  faceCount: number;
  largestFaceAreaRatio: number;
  totalFaceAreaRatio: number;
  hasAdequateFace: boolean;
  detected: boolean;
};

let blazefaceModel: {
  estimateFaces: (input: HTMLCanvasElement, flip?: boolean) => Promise<
    Array<{ topLeft: [number, number]; bottomRight: [number, number] }>
  >;
} | null = null;
let blazefaceLoadFailed = false;

async function loadBlazeface() {
  if (blazefaceModel) return blazefaceModel;
  if (blazefaceLoadFailed) return null;
  try {
    const tf = await import("@tensorflow/tfjs-core");
    await import("@tensorflow/tfjs-backend-webgl");
    await tf.setBackend("webgl");
    await tf.ready();
    const blazeface = await import("@tensorflow-models/blazeface");
    const loaded = await blazeface.load();
    blazefaceModel = loaded as unknown as NonNullable<typeof blazefaceModel>;
    return blazefaceModel;
  } catch {
    blazefaceLoadFailed = true;
    return null;
  }
}

function boxArea(box: BlazeFaceBox, canvasWidth: number, canvasHeight: number): number {
  const w = Math.max(0, box.bottomRight[0] - box.topLeft[0]);
  const h = Math.max(0, box.bottomRight[1] - box.topLeft[1]);
  const frame = Math.max(1, canvasWidth * canvasHeight);
  return (w * h) / frame;
}

function heuristicSkinCoverage(data: Uint8ClampedArray, width: number, height: number): number {
  let skinPixels = 0;
  let samples = 0;
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const isSkin =
        r > 55 &&
        g > 35 &&
        b > 20 &&
        max - min > 12 &&
        Math.abs(r - g) > 10 &&
        r > g &&
        r > b;
      if (isSkin) skinPixels++;
      samples++;
    }
  }
  return samples ? skinPixels / samples : 0;
}

function heuristicFaceFromSkin(skinCoverage: number, width: number, height: number, data: Uint8ClampedArray): FaceAnalysis {
  if (skinCoverage < 0.03) {
    return {
      faceCount: 0,
      largestFaceAreaRatio: 0,
      totalFaceAreaRatio: 0,
      hasAdequateFace: false,
      detected: false
    };
  }

  let centerSkin = 0;
  let centerSamples = 0;
  const x0 = Math.floor(width * 0.2);
  const x1 = Math.floor(width * 0.8);
  const y0 = Math.floor(height * 0.12);
  const y1 = Math.floor(height * 0.78);

  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const isSkin =
        r > 55 &&
        g > 35 &&
        b > 20 &&
        max - min > 12 &&
        Math.abs(r - g) > 10 &&
        r > g &&
        r > b;
      if (isSkin) centerSkin++;
      centerSamples++;
    }
  }

  const centerRatio = centerSamples ? centerSkin / centerSamples : 0;
  const estimatedArea = Math.min(0.35, skinCoverage * 2.2 + centerRatio * 0.25);
  const adequate = estimatedArea >= MIN_LARGEST_FACE_AREA_RATIO;

  return {
    faceCount: adequate ? 1 : 0,
    largestFaceAreaRatio: estimatedArea,
    totalFaceAreaRatio: estimatedArea,
    hasAdequateFace: adequate,
    detected: adequate
  };
}

export async function analyzeFaces(file: File): Promise<FaceAnalysis> {
  const bitmap = await loadImageBitmap(file);
  try {
    const canvas = bitmapToCanvas(bitmap, 640);
    const model = await loadBlazeface();
    if (model) {
      const faces = await model.estimateFaces(canvas, false);
      if (faces.length > 0) {
        const areas = faces.map((face) => boxArea(face, canvas.width, canvas.height));
        const largestFaceAreaRatio = Math.max(...areas);
        const totalFaceAreaRatio = areas.reduce((sum, area) => sum + area, 0);
        const hasAdequateFace = faceAreaPassesProfileCheck(largestFaceAreaRatio, totalFaceAreaRatio);
        return {
          faceCount: faces.length,
          largestFaceAreaRatio,
          totalFaceAreaRatio,
          hasAdequateFace,
          detected: true
        };
      }
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        faceCount: 0,
        largestFaceAreaRatio: 0,
        totalFaceAreaRatio: 0,
        hasAdequateFace: false,
        detected: false
      };
    }
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const skinCoverage = heuristicSkinCoverage(data, width, height);
    return heuristicFaceFromSkin(skinCoverage, width, height, data);
  } finally {
    bitmap.close?.();
  }
}

export { faceAreaPassesProfileCheck };
