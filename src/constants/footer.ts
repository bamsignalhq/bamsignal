export const FOOTER_TAGLINE = "Send a Signal";
export const FOOTER_SUBTAGLINE = "Meet people who match your vibe.";

export const FOOTER_COPYRIGHT = `© ${new Date().getFullYear()} BamSignal`;

export const FOOTER_EARLY_ACCESS_LABEL = "Early Access Nigeria";

export const FOOTER_QUICK_LINKS = [
  { href: "/about", label: "About" },
  { href: "/safety", label: "Safety" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" }
] as const;

/** @deprecated Use FOOTER_QUICK_LINKS */
export const FOOTER_LINKS = FOOTER_QUICK_LINKS;

export const LEGAL_PATHS = ["/about", "/safety", "/privacy", "/terms", "/contact"] as const;

export type LegalPath = (typeof LEGAL_PATHS)[number];

export function getLegalPath(pathname = window.location.pathname): LegalPath | null {
  const path = pathname.replace(/\/$/, "") || "/";
  return LEGAL_PATHS.includes(path as LegalPath) ? (path as LegalPath) : null;
}

export { navigateToPath } from "./routes";
