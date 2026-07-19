import { normalizePath } from "./routePath";

export type ComingSoonPageConfig = {
  path: string;
  title: string;
  eyebrow: string;
  lede: string;
};

/** Public placeholder destinations — never 404. */
export const COMING_SOON_PAGES: readonly ComingSoonPageConfig[] = [
  {
    path: "/success-stories",
    title: "Success Stories",
    eyebrow: "Coming soon",
    lede: "Real Nigerian love stories from Discover, Discreet Membership, and Signal Concierge™ — launching soon."
  },
  {
    path: "/press",
    title: "Press",
    eyebrow: "Coming soon",
    lede: "Media kits, brand assets, and press contacts for BamSignal will live here shortly."
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    eyebrow: "Coming soon",
    lede: "A clear Cookie Policy is on the way. Until then, see our Privacy Policy for how we handle data."
  },
  {
    path: "/refund-policy",
    title: "Refund Policy",
    eyebrow: "Coming soon",
    lede: "Transparent refund terms for Discover Membership, boosts, and Concierge invoices are being finalized."
  },
  {
    path: "/acceptable-use",
    title: "Acceptable Use",
    eyebrow: "Coming soon",
    lede: "Community standards for respectful use of BamSignal are being published here. See Community Guidelines for now."
  }
] as const;

const BY_PATH = new Map(COMING_SOON_PAGES.map((page) => [page.path, page]));

export function getComingSoonPage(pathname = window.location.pathname): ComingSoonPageConfig | null {
  return BY_PATH.get(normalizePath(pathname)) ?? null;
}

export function isComingSoonPath(pathname = window.location.pathname): boolean {
  return getComingSoonPage(pathname) != null;
}
