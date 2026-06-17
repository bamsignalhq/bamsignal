import { containsContactInText } from "./contactGuard";
import { trackEvent } from "./analytics";

/** @deprecated Use scanPhotoSafety via mediaModeration instead. */
export type ImageContactScanResult = {
  blocked: boolean;
  reason: "contact_text" | "text_heavy" | "none";
};

/** @deprecated Use scanPhotoSafety via mediaModeration instead. */
export async function scanImageForContactDetails(
  file: File,
  opts: { strictTextHeavy?: boolean; skipTextHeavy?: boolean; contactTextOnly?: boolean } = {}
): Promise<ImageContactScanResult> {
  const filename = file.name || "";
  if (containsContactInText(filename)) {
    trackEvent("photo_rejected_contact_text", { source: "filename" });
    return { blocked: true, reason: "contact_text" };
  }

  if (opts.skipTextHeavy || opts.contactTextOnly) {
    return { blocked: false, reason: "none" };
  }

  return { blocked: false, reason: "none" };
}

export function sameImageDataUrl(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a === b;
}
