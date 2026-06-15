import { LANDING } from "./copy";
import { STORAGE_KEYS } from "./limits";
import { readJson, writeJson } from "../utils/storage";

export type CmsContent = {
  heroHeadline: string;
  heroSubheadline: string;
  heroCta: string;
  heroSecondaryCta: string;
  safetyText: string;
  welcomeTitle: string;
  welcomeBody: string;
  welcomePhotoHint: string;
  welcomeReadyTitle: string;
  welcomeReadyBody: string;
  earlyAccessLabel: string;
  foundingMemberLabel: string;
  notificationTemplates: {
    signalReceived: string;
    signalAccepted: string;
    profileViewed: string;
    verificationApproved: string;
    premiumActivated: string;
  };
  supportWhatsapp: string;
  supportResponseTime: string;
  supportHours: string;
  growthVerifiedProfiles: string;
  growthCitiesLive: string;
  growthSignalsSent: string;
  quickiePrice: number;
  quickiePriceLabel: string;
};

export const DEFAULT_CMS: CmsContent = {
  heroHeadline: LANDING.heroHeadline,
  heroSubheadline: LANDING.heroSubheadline,
  heroCta: "Join BamSignal",
  heroSecondaryCta: "Explore Signals",
  safetyText: "Meet in public first. Keep conversations inside BamSignal until you're comfortable.",
  welcomeTitle: "Welcome to BamSignal",
  welcomeBody: "Meet people who match your vibe.",
  welcomePhotoHint: "Profiles with photos get 5× more signals. Add at least one clear photo of you.",
  welcomeReadyTitle: "Ready to Discover",
  welcomeReadyBody: "Your profile is live. Send your first signal when someone feels right.",
  earlyAccessLabel: "Early Access",
  foundingMemberLabel: "Early member",
  notificationTemplates: {
    signalReceived: "Someone sent you a signal ⚡",
    signalAccepted: "Your signal was accepted — say hi in Inbox",
    profileViewed: "Someone viewed your profile",
    verificationApproved: "You're verified! Your badge is now live.",
    premiumActivated: "Signal Pass active — unlimited signals unlocked"
  },
  supportWhatsapp: "",
  supportResponseTime: "Within 24 hours",
  supportHours: "Mon–Sat, 9am–6pm WAT",
  growthVerifiedProfiles: "ID verified",
  growthCitiesLive: "Nationwide",
  growthSignalsSent: "5 free daily",
  quickiePrice: 999,
  quickiePriceLabel: "₦999"
};

const REMOVED_HERO_SUBHEADLINE =
  "Meet verified people nearby for friendship, dating, and meaningful connections.";

export function getCms(): CmsContent {
  const saved = readJson<Partial<CmsContent>>(STORAGE_KEYS.cms, {});
  const merged = { ...DEFAULT_CMS, ...saved };
  if (merged.heroSubheadline === REMOVED_HERO_SUBHEADLINE) {
    merged.heroSubheadline = "";
    if (saved.heroSubheadline === REMOVED_HERO_SUBHEADLINE) {
      writeJson(STORAGE_KEYS.cms, { ...saved, heroSubheadline: "" });
    }
  }
  return merged;
}

export function saveCms(patch: Partial<CmsContent>): void {
  writeJson(STORAGE_KEYS.cms, { ...getCms(), ...patch });
}
