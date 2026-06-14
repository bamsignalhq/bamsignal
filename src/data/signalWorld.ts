import { MOMENT_SETS, SHOWCASE } from "../constants/showcase";

export const HERO_ACTIVITIES = [
  "Adaeze just sent a signal in Lagos",
  "Chidi connected in Abuja",
  "Ngozi joined from Port Harcourt",
  "Emeka discovered someone nearby in Enugu"
] as const;

export const SIGNAL_FEED_ITEMS = [
  "New signal sent in Lekki",
  "Signal accepted in Abuja",
  "Verified profile joined in Enugu",
  "New connection in Port Harcourt",
  "Priority signal in Victoria Island",
  "Someone nearby sent a signal in Ikeja"
] as const;

export const TRUST_PILLARS = ["Verified", "Protected", "Nearby", "Real"] as const;

export const NEARBY_SIGNAL_NODES = [
  {
    id: "adaeze",
    name: "Adaeze",
    age: 27,
    distance: "3km away",
    x: 28,
    y: 38,
    photo: SHOWCASE.hero
  },
  {
    id: "chidi",
    name: "Chidi",
    age: 31,
    distance: "5km away",
    x: 62,
    y: 52,
    photo: MOMENT_SETS.movieDate[0]
  },
  {
    id: "ngozi",
    name: "Ngozi",
    age: 25,
    distance: "8km away",
    x: 48,
    y: 68,
    photo: MOMENT_SETS.beachDay[0]
  }
] as const;
