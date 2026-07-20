import { AUTH_SIGNUP_PATH } from "../constants/routes";
import { SIGNAL_CONCIERGE_ROUTES } from "../constants/signalConciergeRoutes";
import type { ProductLandingId } from "../constants/productRoutes";
import { PRODUCT_ROUTES } from "../constants/productRoutes";

export type ProductTone = "discover" | "discreet" | "concierge";

export type ProductLandingContent = {
  id: ProductLandingId;
  path: string;
  tone: ProductTone;
  eyebrow: string;
  /** Short intent line — what the visitor wants. */
  intent: string;
  title: string;
  lede: string;
  /** Calm supporting paragraphs — keep short. */
  story: readonly string[];
  principles: readonly { label: string; detail: string }[];
  statusNote?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  seoTitle: string;
  seoDescription: string;
};

export const HOME_WAYS = {
  eyebrow: "Three experiences",
  title: "Find love your way",
  lede: "Three distinct relationship experiences — not three versions of the same feed."
} as const;

export const HOME_WAY_CARDS = [
  {
    id: "dating" as const,
    tone: "discover" as const,
    title: "Discover",
    intent: "I want to meet people myself.",
    lede: "Explore profiles, send Signals, and build connections at your own pace.",
    href: PRODUCT_ROUTES.dating,
    cta: "Explore Discover"
  },
  {
    id: "discreetMode" as const,
    tone: "discreet" as const,
    title: "Discreet Membership",
    intent: "I want to date privately.",
    lede: "Browse privately. Reveal yourself only when you choose.",
    href: PRODUCT_ROUTES.discreetMode,
    cta: "Explore Discreet Membership"
  },
  {
    id: "signalConcierge" as const,
    tone: "concierge" as const,
    title: "Signal Concierge™",
    intent: "I want a dedicated matchmaker.",
    lede: "BamSignal’s dedicated matchmaking service — guided introductions, separate from Discover.",
    href: SIGNAL_CONCIERGE_ROUTES.landing,
    cta: "Explore Signal Concierge"
  }
] as const;

export const PRODUCT_LANDINGS: Record<ProductLandingId, ProductLandingContent> = {
  dating: {
    id: "dating",
    path: PRODUCT_ROUTES.dating,
    tone: "discover",
    eyebrow: "Discover",
    intent: "I want to meet people myself.",
    title: "Find meaningful connections, your way.",
    lede: "Discover gives you the freedom to explore profiles, start conversations and build genuine relationships at your own pace.",
    story: [
      "This is the self-directed BamSignal experience — warm, social, and entirely in your hands.",
      "Browse with intention. Send a Signal when someone feels right. Chat when interest is mutual."
    ],
    principles: [
      { label: "Explore freely", detail: "Profiles, filters, and Signals — on your schedule." },
      { label: "Mutual by design", detail: "Conversation opens when both sides connect." },
      { label: "Your pace", detail: "No rush. No performance. Just genuine interest." }
    ],
    primaryCta: { label: "Join BamSignal", href: AUTH_SIGNUP_PATH },
    secondaryCta: { label: "How Discover works", href: "/features/discover" },
    seoTitle: "Discover | Find meaningful connections on BamSignal",
    seoDescription:
      "Discover is BamSignal’s self-directed dating experience — explore profiles, send Signals, and build relationships at your own pace."
  },
  discreetMode: {
    id: "discreetMode",
    path: PRODUCT_ROUTES.discreetMode,
    tone: "discreet",
    eyebrow: "Discreet Membership",
    intent: "I want to date privately.",
    title: "Dating without being discovered.",
    lede: "Discreet Membership is its own experience — full Discover power while you remain undiscoverable.",
    story: [
      "This is not Premium, VIP, or a privacy toggle. It is a separate membership for people who value privacy and control.",
      "You enjoy unlimited Signals, messaging, search, and filters — but you never appear in Discover, search, recommendations, Nearby, or suggestions.",
      "A member only sees your profile after you intentionally initiate contact."
    ],
    principles: [
      {
        label: "Invisible by default",
        detail: "Never in Discover, search, Nearby, suggestions, recommendations, or previews."
      },
      {
        label: "You initiate",
        detail: "Browse, filter, and send Signals. Recipients see you only after you reach out."
      },
      {
        label: "Full Discover power",
        detail: "Unlimited Signals, messaging, and filters — privacy without giving up capability."
      }
    ],
    statusNote: "Discreet Membership · ₦9,999 for 30 days. Members purchase and renew inside the app.",
    primaryCta: { label: "Join BamSignal", href: AUTH_SIGNUP_PATH },
    secondaryCta: { label: "Speak with us", href: "/contact" },
    seoTitle: "Discreet Membership | Dating without being discovered",
    seoDescription:
      "Discreet Membership is BamSignal’s private dating experience — full Discover power while you remain undiscoverable until you initiate contact."
  }
};
