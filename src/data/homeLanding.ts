import { HOW_IT_WORKS, TRUST_ITEMS } from "./landingProfiles";

export const HOME_HERO = {
  badge: "Built for Nigeria · Early access",
  headline: "Meet someone real in your city.",
  subheadline:
    "Verified profiles, safer chats, and connections that start with a signal — from Lagos rooftops to Sunday hangouts.",
  primaryCta: "Start free",
  secondaryCta: "See how it works"
} as const;

export const HOME_SECTIONS = {
  pulse: "Live across Nigeria",
  cities: {
    eyebrow: "Your city, your people",
    title: "Signals around Nigeria",
    lede: "Tap a city. See real vibes — not stock photos."
  },
  moments: {
    eyebrow: "Naija lifestyle",
    title: "Moments that feel like home",
    lede: "Suya runs, cinema dates, beach days — the scenes you actually live."
  },
  how: {
    eyebrow: "Simple & intentional",
    title: "How BamSignal works",
    lede: "No endless noise. Just real people, nearby, ready to connect."
  },
  trust: {
    eyebrow: "Safety first",
    title: "Built so you stay in control",
    lede: "Verification, chat protection, and settings you can change anytime."
  },
  premium: {
    eyebrow: "Signal Pass",
    title: "Stand out when it matters",
    lede: "More signals, clearer visibility, and priority when someone special appears.",
    cta: "View plans",
    perks: [
      "Unlimited daily signals",
      "See who signaled you",
      "Priority in discovery",
      "Advanced filters"
    ] as const
  },
  final: {
    eyebrow: "Join free",
    headline: "Someone nearby might signal you today.",
    sub: "5 signals and 5 messages daily — upgrade anytime for unlimited."
  }
} as const;

export const HOME_HOW_STEPS = HOW_IT_WORKS.slice(0, 3);

export const HOME_TRUST = TRUST_ITEMS;

export const HOME_CITY_MARQUEE = [
  "New signal in Lekki",
  "Verified profile in Abuja",
  "Match in Port Harcourt",
  "Active now in Enugu",
  "Sunday hangout crew in Ibadan",
  "Rooftop linkup in Lagos"
] as const;
