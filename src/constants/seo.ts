export const SITE_URL = "https://bamsignal.com";
export const SITE_NAME = "BamSignal";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icons/icon-512.webp`;

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
