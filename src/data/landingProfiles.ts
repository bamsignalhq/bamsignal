import { photoForCity } from "../constants/showcase";

export type LandingPreviewProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  distance: string;
  lastActive: string;
  bio: string;
  photo: string;
  verified: boolean;
  online: boolean;
  interests: string[];
};

export const LANDING_PREVIEW_PROFILES: LandingPreviewProfile[] = [
  {
    id: "hero-1",
    name: "Adaeze",
    age: 27,
    city: "Lagos",
    distance: "3km away",
    lastActive: "Active now",
    bio: "Weekend beach trips and good vibes. Always down for suya and gist.",
    photo: photoForCity("Lagos"),
    verified: true,
    online: true,
    interests: ["Travel", "Movies", "Food"]
  },
  {
    id: "hero-2",
    name: "Chidinma",
    age: 25,
    city: "Abuja",
    distance: "5km away",
    lastActive: "Active now",
    bio: "Love good food and good conversations. Let's start with small chops.",
    photo: photoForCity("Abuja"),
    verified: true,
    online: true,
    interests: ["Music", "Business", "Travel"]
  },
  {
    id: "hero-3",
    name: "David",
    age: 29,
    city: "Port Harcourt",
    distance: "8km away",
    lastActive: "Active today",
    bio: "Movies, music and meaningful conversations. Ambitious but grounded.",
    photo: photoForCity("Port Harcourt"),
    verified: true,
    online: false,
    interests: ["Fitness", "Movies", "Music"]
  },
  {
    id: "hero-4",
    name: "Sandra",
    age: 26,
    city: "Enugu",
    distance: "4km away",
    lastActive: "Active now",
    bio: "Sunday hangouts, cinema dates, and people who show up authentically.",
    photo: photoForCity("Enugu"),
    verified: true,
    online: true,
    interests: ["Travel", "Business", "Movies"]
  }
];

export const LIVE_ACTIVITY_MESSAGES = [
  "Verified profiles across Nigeria",
  "Send a Signal when someone feels right"
] as const;

export const ACTIVITY_METRICS = [
  { value: "5 free daily", label: "Signals" },
  { value: "ID verified", label: "Profiles" },
  { value: "Nationwide", label: "Coverage" }
] as const;

export const RECENT_ACTIVITY = [
  "New signal in Lagos",
  "Signal accepted in Abuja",
  "New member joined in Enugu",
  "New connection in Port Harcourt",
  "Verified profile in Ibadan"
] as const;

export const TRUST_ITEMS = [
  { title: "Verified profiles", body: "Real people, not random accounts." },
  { title: "Safer conversations", body: "Chat inside BamSignal until trust builds." },
  { title: "Contact exchange protection", body: "Phone numbers and socials stay blocked early." },
  { title: "Built for genuine connections", body: "Dating, friendship, and good vibes — not noise." }
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Create your profile",
    body: "Photos, city, and what you're looking for.",
    accent: "pink"
  },
  {
    step: 2,
    title: "Discover people nearby",
    body: "Browse verified profiles around you daily.",
    accent: "purple"
  },
  {
    step: 3,
    title: "Send a BamSignal",
    body: "Stand out when someone really catches your eye.",
    accent: "violet"
  },
  {
    step: 4,
    title: "Start a real conversation",
    body: "Message safely until you're ready to meet.",
    accent: "magenta"
  }
] as const;

export const ONBOARDING_CULTURAL_COPY =
  "Help BamSignal understand the kind of people you connect with best. These details are optional and can be hidden from your profile.";

export const PREFERENCE_CULTURAL_COPY =
  "Choose what matters to you. We'll use it to improve your matches, not limit your experience.";
