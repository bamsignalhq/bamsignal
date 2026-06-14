/** Central brand asset paths — generated from public/brand/logo.png via npm run generate:brand */
export const BRAND_ASSETS = {
  logo: "/brand/logo.webp",
  logoSource: "/brand/logo.png",
  favicon: "/favicon.webp",
  icon192: "/icons/icon-192.webp",
  icon512: "/icons/icon-512.webp",
  appleTouchIcon: "/apple-touch-icon.webp",
  ogImage: "/icons/icon-512.webp"
} as const;

export type BamEffectVariant = "send" | "accepted" | "premium" | "verified";
