import { containsContactInText } from "./contactGuard";
import { trackEvent } from "./analytics";

async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image load failed"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0);
    return createImageBitmap(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function tryOcrText(_file: File): Promise<string> {
  // OCR via tesseract.js can be enabled later as an optional dependency.
  return "";
}

function measureTextDensity(file: File): Promise<number> {
  return loadImageBitmap(file).then(async (bitmap) => {
    const width = 120;
    const height = Math.max(40, Math.round((bitmap.height / bitmap.width) * width));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return 0;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const { data } = ctx.getImageData(0, 0, width, height);
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
  });
}

export type ImageContactScanResult = {
  blocked: boolean;
  reason: "contact_text" | "text_heavy" | "none";
};

export async function scanImageForContactDetails(
  file: File,
  opts: { strictTextHeavy?: boolean; skipTextHeavy?: boolean; contactTextOnly?: boolean } = {}
): Promise<ImageContactScanResult> {
  const filename = file.name || "";
  if (containsContactInText(filename)) {
    trackEvent("photo_rejected_contact_text", { source: "filename" });
    return { blocked: true, reason: "contact_text" };
  }

  const ocrText = await tryOcrText(file);
  if (ocrText && containsContactInText(ocrText)) {
    trackEvent("photo_rejected_contact_text", { source: "ocr" });
    return { blocked: true, reason: "contact_text" };
  }

  if (opts.skipTextHeavy || opts.contactTextOnly) {
    return { blocked: false, reason: "none" };
  }

  const density = await measureTextDensity(file).catch(() => 0);
  const threshold = opts.strictTextHeavy ? 0.14 : 0.2;
  if (density >= threshold) {
    trackEvent("photo_rejected_contact_text", { source: "text_heavy" });
    return { blocked: true, reason: "text_heavy" };
  }

  return { blocked: false, reason: "none" };
}

export function sameImageDataUrl(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a === b;
}
