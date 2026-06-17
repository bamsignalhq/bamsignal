import {
  containsDocumentKeywords,
  scanPhotoSafetyText
} from "../../shared/photoSafetyPatterns.mjs";
import { containsContactInText } from "./contactGuard";
import { trackPhotoRejection } from "./photoRejectionMetrics";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import { bitmapToCanvas, loadImageBitmap } from "./photoImageBitmap";

export type PhotoRejectionCategory =
  | "no_face"
  | "document_detected"
  | "too_much_text"
  | "contact_information"
  | "qr_code"
  | "other";

export type PhotoSafetyScanResult = {
  allowed: boolean;
  category?: PhotoRejectionCategory;
  internalReason?: string;
  riskScore: number;
};

const TEXT_DENSITY_REJECT = 0.18;
const TEXT_DENSITY_STRICT = 0.14;
const QR_RISK_SCORE = 45;
const RISK_REJECT_THRESHOLD = 55;

const OCR_KEYWORDS = [
  "nin",
  "national identification number",
  "federal republic of nigeria",
  "bvn",
  "passport",
  "driver's licence",
  "drivers licence",
  "issue date",
  "surname",
  "given names",
  "card number",
  "date of birth"
];

let blazefaceModel: { estimateFaces: (input: HTMLCanvasElement, flip?: boolean) => Promise<unknown[]> } | null =
  null;
let blazefaceLoadFailed = false;

async function tryOcrText(file: File): Promise<string> {
  try {
    const { recognize } = await import("tesseract.js");
    const result = await recognize(file, "eng", { logger: () => undefined });
    return String(result.data.text || "");
  } catch {
    return "";
  }
}

function measureTextDensityFromImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let edges = 0;
  let samples = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const right = data[i + 4] * 0.299 + data[i + 5] * 0.587 + data[i + 6] * 0.114;
      if (Math.abs(lum - right) > 42) edges++;
      samples++;
    }
  }
  return samples ? edges / samples : 0;
}

async function measureTextDensity(file: File): Promise<number> {
  const bitmap = await loadImageBitmap(file);
  try {
    const canvas = bitmapToCanvas(bitmap, 160);
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return measureTextDensityFromImageData(data, width, height);
  } finally {
    bitmap.close?.();
  }
}

async function detectQrCode(file: File): Promise<boolean> {
  try {
    const { default: jsQR } = await import("jsqr");
    const bitmap = await loadImageBitmap(file);
    try {
      const canvas = bitmapToCanvas(bitmap, 720);
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return Boolean(jsQR(imageData.data, imageData.width, imageData.height));
    } finally {
      bitmap.close?.();
    }
  } catch {
    return false;
  }
}

async function loadBlazeface() {
  if (blazefaceModel) return blazefaceModel;
  if (blazefaceLoadFailed) return null;
  try {
    const tf = await import("@tensorflow/tfjs-core");
    await import("@tensorflow/tfjs-backend-webgl");
    await tf.setBackend("webgl");
    await tf.ready();
    const blazeface = await import("@tensorflow-models/blazeface");
    blazefaceModel = await blazeface.load();
    return blazefaceModel;
  } catch {
    blazefaceLoadFailed = true;
    return null;
  }
}

function heuristicFacePresent(data: Uint8ClampedArray, width: number, height: number): boolean {
  let skinPixels = 0;
  let samples = 0;
  const yStart = Math.floor(height * 0.08);
  const yEnd = Math.floor(height * 0.82);
  const xStart = Math.floor(width * 0.12);
  const xEnd = Math.floor(width * 0.88);

  for (let y = yStart; y < yEnd; y += 2) {
    for (let x = xStart; x < xEnd; x += 2) {
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
  return samples > 0 && skinPixels / samples > 0.045;
}

async function detectFace(file: File): Promise<boolean> {
  const bitmap = await loadImageBitmap(file);
  try {
    const canvas = bitmapToCanvas(bitmap, 640);
    const model = await loadBlazeface();
    if (model) {
      const faces = await model.estimateFaces(canvas, false);
      if (faces.length > 0) return true;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return heuristicFacePresent(data, width, height);
  } finally {
    bitmap.close?.();
  }
}

function ocrHasRiskKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return OCR_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function looksLikeScreenshot(aspect: number, density: number, kind: PhotoUploadKind): boolean {
  if (kind === "cover") return false;
  if (aspect >= 1.75 && density >= TEXT_DENSITY_STRICT) return true;
  if (aspect <= 0.55 && density >= TEXT_DENSITY_STRICT) return true;
  return false;
}

function reject(
  category: PhotoRejectionCategory,
  internalReason: string,
  riskScore: number,
  kind: PhotoUploadKind
): PhotoSafetyScanResult {
  trackPhotoRejection(category, kind);
  return { allowed: false, category, internalReason, riskScore };
}

export async function scanPhotoSafety(
  file: File,
  kind: PhotoUploadKind
): Promise<PhotoSafetyScanResult> {
  const isVerificationSelfie = kind === "selfie";
  const requiresFace = !isVerificationSelfie;
  const allowDocuments = isVerificationSelfie;
  let riskScore = 0;

  const filename = file.name || "";
  if (containsContactInText(filename)) {
    return reject("contact_information", "filename_contact", riskScore, kind);
  }
  if (!allowDocuments && containsDocumentKeywords(filename)) {
    return reject("document_detected", "filename_document", riskScore, kind);
  }

  const [ocrText, density, hasQr, hasFace] = await Promise.all([
    tryOcrText(file),
    measureTextDensity(file).catch(() => 0),
    detectQrCode(file).catch(() => false),
    requiresFace || isVerificationSelfie ? detectFace(file).catch(() => false) : Promise.resolve(true)
  ]);

  const combinedText = [filename, ocrText].filter(Boolean).join("\n");
  const textScan = scanPhotoSafetyText(combinedText, { allowDocuments });
  if (textScan.blocked && textScan.category) {
    return reject(textScan.category as PhotoRejectionCategory, `text_scan:${textScan.category}`, riskScore, kind);
  }
  if (containsContactInText(ocrText)) {
    return reject("contact_information", "ocr_contact", riskScore, kind);
  }
  if (!allowDocuments && (containsDocumentKeywords(ocrText) || ocrHasRiskKeywords(ocrText))) {
    return reject("document_detected", "ocr_document", riskScore, kind);
  }

  if (density >= TEXT_DENSITY_REJECT) {
    return reject("too_much_text", `text_density:${density.toFixed(3)}`, riskScore, kind);
  }
  if (density >= TEXT_DENSITY_STRICT) {
    riskScore += 25;
  }

  if (hasQr) {
    riskScore += QR_RISK_SCORE;
    if (riskScore >= RISK_REJECT_THRESHOLD) {
      return reject("qr_code", "qr_high_risk", riskScore, kind);
    }
  }

  const bitmap = await loadImageBitmap(file).catch(() => null);
  if (bitmap) {
    const aspect = bitmap.width / Math.max(bitmap.height, 1);
    bitmap.close?.();
    if (looksLikeScreenshot(aspect, density, kind)) {
      return reject("other", `screenshot:${aspect.toFixed(2)}`, riskScore, kind);
    }
  }

  if (requiresFace && !hasFace) {
    return reject("no_face", "no_face_detected", riskScore, kind);
  }

  if (isVerificationSelfie && !hasFace) {
    return reject("no_face", "selfie_no_face", riskScore, kind);
  }

  if (riskScore >= RISK_REJECT_THRESHOLD) {
    return reject("other", `risk_score:${riskScore}`, riskScore, kind);
  }

  return { allowed: true, riskScore };
}
