/** Central BamSignal brand asset paths — theme-aware.
 *  Generated via `npm run generate:brand` from public/brand/masters/.
 */
export type BrandTheme = "light" | "dark";

export const BRAND_THEME_COLORS = {
  dark: {
    themeColor: "#1a0a2e",
    backgroundColor: "#1a0a2e"
  },
  light: {
    themeColor: "#fdf2f8",
    backgroundColor: "#fdf2f8"
  }
} as const;

/** Wordmark logos (include BamSignal text + tagline). */
export const BRAND_LOGOS = {
  dark: {
    webp: "/brand/dark-logo.webp",
    png: "/brand/dark-logo.png"
  },
  light: {
    webp: "/brand/light-logo.webp",
    png: "/brand/light-logo.png"
  }
} as const;

/** Square app marks (signal + heart). */
export const BRAND_ICONS = {
  dark: {
    webp: "/brand/dark-icon.webp",
    png: "/brand/dark-icon.png",
    favicon: "/favicon-dark.webp",
    faviconPng: "/favicon-dark-32.png"
  },
  light: {
    webp: "/brand/light-icon.webp",
    png: "/brand/light-icon.png",
    favicon: "/favicon-light.webp",
    faviconPng: "/favicon-light-32.png"
  }
} as const;

/** Full-bleed splash art. */
export const BRAND_SPLASH = {
  dark: {
    webp: "/brand/dark-splash.webp",
    png: "/brand/dark-splash.png"
  },
  light: {
    webp: "/brand/light-splash.webp",
    png: "/brand/light-splash.png"
  }
} as const;

/** Canonical social / PWA / launcher icons (dark mark — best contrast on light cards). */
export const BRAND_SOCIAL = {
  icon192: "/icons/icon-192.webp",
  icon512: "/icons/icon-512.webp",
  icon192Png: "/icons/icon-192.png",
  icon512Png: "/icons/icon-512.png",
  androidChrome192: "/icons/android-chrome-192x192.png",
  androidChrome512: "/icons/android-chrome-512x512.png",
  maskable512: "/icons/maskable/icon-512.png",
  appleTouchIcon: "/apple-touch-icon.png",
  appleTouchIconWebp: "/apple-touch-icon.webp",
  faviconIco: "/favicon.ico",
  favicon32: "/favicon-32x32.png",
  favicon16: "/favicon-16x16.png",
  favicon48: "/favicon-48x48.png",
  /** Absolute OG/Twitter default */
  ogImagePath: "/icons/icon-512.webp"
} as const;

/** @deprecated Prefer theme helpers — kept for transitional imports */
export const BRAND_ASSETS = {
  logo: BRAND_LOGOS.dark.webp,
  logoSource: BRAND_LOGOS.dark.png,
  logoLight: BRAND_LOGOS.light.webp,
  logoDark: BRAND_LOGOS.dark.webp,
  icon: BRAND_ICONS.dark.webp,
  iconLight: BRAND_ICONS.light.webp,
  iconDark: BRAND_ICONS.dark.webp,
  splash: BRAND_SPLASH.dark.webp,
  splashLight: BRAND_SPLASH.light.webp,
  splashDark: BRAND_SPLASH.dark.webp,
  favicon: BRAND_ICONS.dark.favicon,
  faviconLight: BRAND_ICONS.light.favicon,
  faviconDark: BRAND_ICONS.dark.favicon,
  icon192: BRAND_SOCIAL.icon192,
  icon512: BRAND_SOCIAL.icon512,
  appleTouchIcon: BRAND_SOCIAL.appleTouchIconWebp,
  ogImage: BRAND_SOCIAL.ogImagePath
} as const;

export function resolveBrandTheme(theme?: string | null): BrandTheme {
  return theme === "light" ? "light" : "dark";
}

export function brandLogo(theme?: string | null, format: "webp" | "png" = "webp") {
  const t = resolveBrandTheme(theme);
  return BRAND_LOGOS[t][format];
}

export function brandIcon(theme?: string | null, format: "webp" | "png" = "webp") {
  const t = resolveBrandTheme(theme);
  return BRAND_ICONS[t][format];
}

export function brandSplash(theme?: string | null, format: "webp" | "png" = "webp") {
  const t = resolveBrandTheme(theme);
  return BRAND_SPLASH[t][format];
}

export function brandFavicon(theme?: string | null) {
  const t = resolveBrandTheme(theme);
  return BRAND_ICONS[t].favicon;
}

export function brandThemeColors(theme?: string | null) {
  return BRAND_THEME_COLORS[resolveBrandTheme(theme)];
}

export type BamEffectVariant = "send" | "accepted" | "premium" | "verified";
