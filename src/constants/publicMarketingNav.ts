import { AUTH_LOGIN_PATH, AUTH_SIGNUP_PATH } from "./routes";
import { SIGNAL_CONCIERGE_ROUTES } from "./signalConciergeRoutes";
import { normalizePath } from "./routePath";

export type PublicMarketingNavLink = {
  href: string;
  label: string;
};

/** Center links for the public marketing website (never member app tabs). */
export const PUBLIC_MARKETING_NAV_LINKS: readonly PublicMarketingNavLink[] = [
  { href: "/features", label: "How it Works" },
  { href: "/premium", label: "Discover Membership" },
  { href: "/discreet-mode", label: "Discreet Membership" },
  { href: SIGNAL_CONCIERGE_ROUTES.landing, label: "Signal Concierge™" },
  { href: "/safety", label: "Safety" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/faq", label: "FAQ" }
] as const;

export const PUBLIC_MARKETING_NAV_CTAS = {
  signIn: { href: AUTH_LOGIN_PATH, label: "Sign In" },
  getStarted: { href: AUTH_SIGNUP_PATH, label: "Get Started" }
} as const;

/** Prefix-aware active state for nested marketing hubs. */
export function isPublicMarketingNavActive(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  if (path === target) return true;
  if (target === "/") return false;
  return path.startsWith(`${target}/`);
}
