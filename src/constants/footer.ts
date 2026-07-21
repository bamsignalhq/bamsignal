import { CORPORATE } from "./corporate";
import { AUTH_SIGNUP_PATH } from "./routes";
import { SIGNAL_CONCIERGE_ROUTES } from "./signalConciergeRoutes";

export const FOOTER_TAGLINE =
  "Find meaningful relationships built on trust, privacy and intentional connections.";
export const FOOTER_SUBTAGLINE = "Discover · Discreet Membership · Signal Concierge™";

export const FOOTER_COPYRIGHT = `© ${new Date().getFullYear()} BamSignal.`;
export const FOOTER_MADE_IN = "Made with ❤️ in Nigeria.";

export const FOOTER_EARLY_ACCESS_LABEL = "Early Access Nigeria";

export const FOOTER_CTA = {
  title: "Ready to find your signal?",
  body: "Join thousands of Nigerians building meaningful relationships.",
  primary: { label: "Create Free Account", href: AUTH_SIGNUP_PATH },
  secondary: { label: "Apply for Signal Concierge™", href: SIGNAL_CONCIERGE_ROUTES.landing }
} as const;

export type FooterLink = {
  href: string;
  label: string;
  comingSoon?: boolean;
  /** Open in a new tab (parent-company / external destinations) */
  external?: boolean;
};

/** Column 2 — Discover */
export const FOOTER_DISCOVER_LINKS: readonly FooterLink[] = [
  { href: "/features", label: "How it Works" },
  { href: "/premium", label: "Membership" },
  { href: "/premium", label: "Pricing" },
  { href: "/premium", label: "Conversation Unlock" },
  { href: "/premium/boost-visibility", label: "Profile Boost" }
] as const;

/** Column 3 — Privacy */
export const FOOTER_PRIVACY_LINKS: readonly FooterLink[] = [
  { href: "/discreet-mode", label: "Discreet Membership" },
  { href: SIGNAL_CONCIERGE_ROUTES.landing, label: "Signal Concierge™" },
  { href: "/safety", label: "Safety Centre" },
  { href: "/safety-policy", label: "Community Guidelines" },
  { href: "/help/verification", label: "Verification" }
] as const;

/** Column 4 — Company */
export const FOOTER_COMPANY_LINKS: readonly FooterLink[] = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: CORPORATE.careersUrl, label: "Careers", external: true },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" }
] as const;

/** Column 5 — Legal */
export const FOOTER_LEGAL_LINKS: readonly FooterLink[] = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/acceptable-use", label: "Acceptable Use" }
] as const;

/** @deprecated Prefer FOOTER_DISCOVER_LINKS */
export const FOOTER_PRODUCT_LINKS = [
  { href: "/dating", label: "Discover" },
  { href: "/discreet-mode", label: "Discreet Mode" },
  { href: "/signal-concierge", label: "Signal Concierge™" }
] as const;

/** @deprecated Prefer FOOTER_PRIVACY_LINKS / FOOTER_COMPANY_LINKS */
export const FOOTER_TRUST_LINKS = [
  { href: "/help/verification", label: "Verification" },
  { href: "/safety", label: "Trust Centre" },
  { href: "/safety-policy", label: "Community Guidelines" },
  { href: "/premium", label: "Pricing" },
  { href: "/help", label: "Help Centre" },
  { href: "/contact", label: "Contact" }
] as const;

/** Compact quick links kept for legacy / secondary surfaces. */
export const FOOTER_QUICK_LINKS = [
  { href: "/about", label: "About" },
  { href: "/safety", label: "Safety" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" }
] as const;

/** @deprecated Use FOOTER_QUICK_LINKS */
export const FOOTER_LINKS = FOOTER_QUICK_LINKS;

export const LEGAL_PATHS = [
  "/about",
  "/safety-policy",
  "/privacy",
  "/terms",
  "/delete-account"
] as const;

export type LegalPath = (typeof LEGAL_PATHS)[number];

export function getLegalPath(pathname = window.location.pathname): LegalPath | null {
  const path = pathname.replace(/\/$/, "") || "/";
  return LEGAL_PATHS.includes(path as LegalPath) ? (path as LegalPath) : null;
}

export { navigateToPath } from "./routePath";
