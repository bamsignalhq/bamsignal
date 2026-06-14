import type { UserProfile } from "../types";
import { STORAGE_KEYS } from "./limits";
import { defaultSafetySettings } from "./safety";
import { rememberUsernameEmail } from "../utils/authIdentity";
import { writeJson } from "../utils/storage";

/** Local demo member — use on /love/login while building */
export const DEMO_USER = {
  username: "ada",
  pin: "123456",
  profile: {
    name: "Ada Demo",
    username: "ada",
    email: "demo@bamsignal.com",
    phone: "08012345678"
  } satisfies UserProfile
};

/** Platform admin — use on /hard/auth while building */
export const DEMO_ADMIN = {
  email: "ops@bamsignal.com",
  password: "ops123"
};

export function matchDemoUser(username: string, pin: string): boolean {
  return username.trim().toLowerCase() === DEMO_USER.username && pin === DEMO_USER.pin;
}

export function matchDemoAdmin(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
}

/** Seed a realistic demo profile for local study sessions */
export function seedDemoMemberProfile(): void {
  rememberUsernameEmail(DEMO_USER.username, DEMO_USER.profile.email);
  writeJson(STORAGE_KEYS.userProfile, DEMO_USER.profile);
  writeJson(STORAGE_KEYS.datingProfile, {
    photos: ["/showcase/hero-lagos-young-professionals-01.webp"],
    age: 28,
    gender: "Woman",
    state: "Lagos",
    city: "Lagos",
    bio: "Product designer in Lekki. Weekend rooftops, cinema dates, and good conversation.",
    lookingFor: "Men",
    intents: ["Relationship"],
    interests: ["Music", "Travel", "Food", "Movies"],
    verified: true,
    premium: false,
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
    reportCount: 0,
    visibility: { showReligion: true, showEthnicity: false, showState: true },
    matchingPrivacy: {
      useReligionForMatching: true,
      useEthnicityForMatching: true,
      useStateForMatching: true
    },
    safetySettings: defaultSafetySettings(),
    religion: "Christian",
    stateOfOrigin: "Enugu"
  });
}
