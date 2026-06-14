export const FOOTER_TRUST_LINE = "Verified profiles • Safer chats • Real connections";

export const FOOTER_COPYRIGHT = "© 2026 BamSignal";

export const FOOTER_EARLY_ACCESS_LABEL = "Early Access Nigeria";

export const FOOTER_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/safety", label: "Safety" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" }
] as const;

export const LEGAL_PATHS = ["/about", "/safety", "/privacy", "/terms", "/contact"] as const;

export type LegalPath = (typeof LEGAL_PATHS)[number];

export function getLegalPath(pathname = window.location.pathname): LegalPath | null {
  const path = pathname.replace(/\/$/, "") || "/";
  return LEGAL_PATHS.includes(path as LegalPath) ? (path as LegalPath) : null;
}

export { navigateToPath } from "./routes";
