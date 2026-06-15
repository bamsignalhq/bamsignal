import { TRUST_ITEMS } from "./landingProfiles";

export const HOME_HERO = {
  badge: "",
  headline: "Meet someone real in your city.",
  subheadline: "",
  primaryCta: "Join BamSignal",
  secondaryCta: ""
} as const;

export const HOME_HERO_TRUST = ["Verified Profiles", "Safer Conversations"] as const;

export const HOME_SECTIONS = {
  cities: {
    eyebrow: "City Spotlight",
    title: "Featured Members Everywhere",
    lede: "Pick a city — real people, real Naija energy."
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
