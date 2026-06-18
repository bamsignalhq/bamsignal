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
  welcomePhotoHint: "",
  welcomeReadyTitle: "Welcome to BamSignal ❤️",
  welcomeReadyBody:
    "Your profile is ready. Discover genuine people around you and take things one signal at a time.",
  earlyAccessLabel: "Early Access",
  foundingMemberLabel: "Early member",
  notificationTemplates: {
    signalReceived: "Someone is interested in getting to know you.",
    signalAccepted: "You can now start chatting.",
    profileViewed: "Someone noticed your profile.",
    verificationApproved: "You're verified! Your badge is now live.",
    premiumActivated: "Enjoy unlimited connections."
  },
  supportWhatsapp: "",
  supportResponseTime: "Within few hours",
  supportHours: "9am–6pm WAT",
  growthVerifiedProfiles: "ID verified",
  growthCitiesLive: "Nationwide",
  growthSignalsSent: "5 free daily",
  quickiePrice: 999,
  quickiePriceLabel: "₦999"
};

const REMOVED_HERO_SUBHEADLINE =
  "Meet verified people nearby for friendship, dating, and meaningful connections.";

const LEGACY_SUPPORT_RESPONSE_TIME = "Within 24 hours";
const LEGACY_SUPPORT_HOURS = "Mon–Sat, 9am–6pm WAT";

export function getCms(): CmsContent {
  const saved = readJson<Partial<CmsContent>>(STORAGE_KEYS.cms, {});
  const merged = { ...DEFAULT_CMS, ...saved };
  if (merged.heroSubheadline === REMOVED_HERO_SUBHEADLINE) {
    merged.heroSubheadline = "";
    if (saved.heroSubheadline === REMOVED_HERO_SUBHEADLINE) {
      writeJson(STORAGE_KEYS.cms, { ...saved, heroSubheadline: "" });
    }
  }
  if (
    merged.supportResponseTime === LEGACY_SUPPORT_RESPONSE_TIME &&
    saved.supportResponseTime === LEGACY_SUPPORT_RESPONSE_TIME
  ) {
    merged.supportResponseTime = DEFAULT_CMS.supportResponseTime;
  }
  if (merged.supportHours === LEGACY_SUPPORT_HOURS && saved.supportHours === LEGACY_SUPPORT_HOURS) {
    merged.supportHours = DEFAULT_CMS.supportHours;
  }
  return merged;
}

export function saveCms(patch: Partial<CmsContent>): void {
  writeJson(STORAGE_KEYS.cms, { ...getCms(), ...patch });
}
