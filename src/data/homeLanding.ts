import { TRUST_ITEMS } from "./landingProfiles";

export const HOME_HERO = {
  badge: "",
  headline: "Meet people who match your vibe.",
  subheadline:
    "Good conversations often begin with a signal. Discover new people and connect at your own pace.",
  primaryCta: "Join BamSignal",
  secondaryCta: ""
} as const;

export const HOME_HERO_TRUST = [] as const;

export const HOME_SECTIONS = {
  cities: {
    eyebrow: "City Spotlight",
    title: "Featured Members Everywhere",
    lede: "Real people, real connections — pick a city and explore."
  },
  moments: {
    eyebrow: "Naija lifestyle",
    title: "Moments that feel like home",
    lede: "Suya runs, cinema dates, beach days — the scenes you actually live."
  },
  trust: {
    eyebrow: "Safety",
    title: "Safety"
  },
  final: {
    headline: "Ready to send your first signal?",
    cta: "Join BamSignal"
  }
} as const;

export const HOME_TRUST = TRUST_ITEMS;
