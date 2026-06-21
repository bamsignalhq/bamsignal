import { MOCK_PROFILES } from "./mockProfiles";
import { MOMENT_SETS, photoForCity } from "../constants/showcase";
import { defaultSafetySettings } from "../constants/safety";
import type { ChatMessage, DatingProfile, DiscoverProfile, Match, UserProfile } from "../types";
import { emptyHomeAdvancedFilters } from "../utils/homeFilters";
import type { HomeAdvancedFilters } from "../types";

export const STORE_CAPTIONS = [
  "Meet People Who Match Your Vibe",
  "Discover Genuine Connections",
  "Chat Naturally",
  "Build Your Profile",
  "Find What Matters To You",
  "Across Nigerian Cities",
  "Unlock More Connections",
  "Safer And Verified"
] as const;

export const STORE_VIEWER_USER: UserProfile = {
  name: "Chioma Adeleke",
  username: "chioma",
  email: "chioma@bamsignal.com",
  phone: "08031234567",
  phoneVerified: true
};

export const STORE_VIEWER_PROFILE: DatingProfile = {
  photos: [
    photoForCity("Lagos"),
    MOMENT_SETS.lagosRooftop[1],
    MOMENT_SETS.movieDate[0]
  ],
  coverPhoto: MOMENT_SETS.lagosRooftop[2],
  coverPhotoExplicit: true,
  age: 27,
  gender: "Woman",
  state: "Lagos",
  city: "Lagos",
  bio: "Product lead in Victoria Island. Weekend rooftops, live music, and honest conversation.",
  lookingFor: "Men",
  intents: ["SeriousRelationship", "MeaningfulConversations"],
  interests: ["Music", "Travel", "Food", "Movies"],
  verified: true,
  premium: false,
  onboardingComplete: true,
  createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  reportCount: 0,
  visibility: { showReligion: true, showEthnicity: true, showState: true },
  matchingPrivacy: {
    useReligionForMatching: true,
    useEthnicityForMatching: true,
    useStateForMatching: true
  },
  safetySettings: defaultSafetySettings("Woman"),
  religion: "Christian",
  ethnicity: "Igbo",
  stateOfOrigin: "Anambra",
  lifestyle: "Career focused"
};

export const STORE_HOME_PROFILES: DiscoverProfile[] = MOCK_PROFILES.slice(0, 9).map((profile, index) => ({
  ...profile,
  id: `sample-${profile.id}`,
  city: index % 3 === 0 ? "Lagos" : profile.city,
  distanceKm: 2 + (index % 6)
}));

export const STORE_DISCOVER_PROFILE: DiscoverProfile =
  MOCK_PROFILES.find((p) => p.name === "Blessing") ?? MOCK_PROFILES[0];

export const STORE_CHAT_MATCH: Match = {
  id: "match-store-1",
  profileId: STORE_DISCOVER_PROFILE.id,
  name: STORE_DISCOVER_PROFILE.name,
  photo: STORE_DISCOVER_PROFILE.photo,
  city: STORE_DISCOVER_PROFILE.city,
  matchedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  lastActiveAt: new Date(Date.now() - 2 * 3600000).toISOString()
};

export const STORE_CHAT_THREADS: Match[] = [
  STORE_CHAT_MATCH,
  {
    id: "match-store-2",
    profileId: "p8",
    name: "Ibrahim",
    photo: photoForCity("Lagos"),
    city: "Lagos",
    matchedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "match-store-3",
    profileId: "p3",
    name: "Ngozi",
    photo: photoForCity("Port Harcourt"),
    city: "Port Harcourt",
    matchedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const STORE_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    from: "them",
    text: "Hey Chioma! Your Lagos rooftop photo caught my eye.",
    at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: "m2",
    from: "me",
    text: "Thank you! Are you around VI too?",
    at: new Date(Date.now() - 2.8 * 3600000).toISOString()
  },
  {
    id: "m3",
    from: "them",
    text: "Yes — Wuse on weekdays, Lekki on weekends. Coffee Saturday?",
    at: new Date(Date.now() - 2.5 * 3600000).toISOString()
  },
  {
    id: "m4",
    from: "me",
    text: "That works. 4pm at Terra Kulture?",
    at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

export const STORE_FILTER_DEMO: HomeAdvancedFilters = {
  ...emptyHomeAdvancedFilters(),
  religions: ["Christian", "Muslim"],
  bodyTypes: ["Athletic", "Average"],
  relationshipIntentions: ["Serious relationship"],
  tribes: ["Igbo", "Yoruba"],
  genotypes: ["AA", "AS"]
};

export const STORE_CITY_TABS = ["Lagos", "Abuja", "Port Harcourt"] as const;

export function profilesForCity(city: string): DiscoverProfile[] {
  return MOCK_PROFILES.filter((p) => p.city === city).slice(0, 4);
}
