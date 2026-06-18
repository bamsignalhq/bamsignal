import { MOMENT_SETS, photoForCity } from "../constants/showcase";
import { MOCK_PROFILES } from "../data/mockProfiles";
import type { DiscoverProfile, LikeEntry, UserProfile } from "../types";
import { isReviewerDemoChatUser } from "./reviewerDemoChats";

const DEMO_PREFIX = "demo-signal-";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function photoForName(name: string): string {
  const found = MOCK_PROFILES.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (found) return found.photo;
  const cityPhotos: Record<string, string> = {
    Ada: MOMENT_SETS.lagosRooftop[1],
    Chioma: MOMENT_SETS.movieDate[0],
    Tomi: photoForCity("Port Harcourt"),
    Blessing: MOCK_PROFILES.find((p) => p.name === "Blessing")?.photo ?? photoForCity("Lagos"),
    Mide: MOMENT_SETS.sundayHangout[0],
    Esther: photoForCity("Enugu"),
    Sarah: photoForCity("Benin")
  };
  return cityPhotos[name] ?? photoForCity("Lagos");
}

export function isDemoSignalEntry(entry: Pick<LikeEntry, "id" | "profileId">): boolean {
  return Boolean(
    entry.id?.startsWith(DEMO_PREFIX) || entry.profileId.startsWith(DEMO_PREFIX)
  );
}

export function getReviewerDemoIncomingSignals(): LikeEntry[] {
  return [
    {
      id: `${DEMO_PREFIX}ada`,
      profileId: `${DEMO_PREFIX}ada`,
      name: "Ada",
      age: 26,
      photo: photoForName("Ada"),
      city: "Lagos",
      state: "Lagos",
      distanceKm: 2.4,
      verified: true,
      at: minutesAgo(5),
      message: "I really like your vibe. You seem so genuine and kind."
    },
    {
      id: `${DEMO_PREFIX}chioma`,
      profileId: `${DEMO_PREFIX}chioma`,
      name: "Chioma",
      age: 27,
      photo: photoForName("Chioma"),
      city: "Abuja",
      state: "FCT",
      distanceKm: 18,
      verified: true,
      at: hoursAgo(1),
      message: "You caught my attention. Let's see where this goes."
    },
    {
      id: `${DEMO_PREFIX}tomi`,
      profileId: `${DEMO_PREFIX}tomi`,
      name: "Tomi",
      age: 25,
      photo: photoForName("Tomi"),
      city: "Port Harcourt",
      state: "Rivers",
      distanceKm: 32,
      verified: true,
      at: hoursAgo(3),
      message: "You seem like someone I'd love to get to know better."
    },
    {
      id: `${DEMO_PREFIX}blessing`,
      profileId: `${DEMO_PREFIX}blessing`,
      name: "Blessing",
      age: 24,
      photo: photoForName("Blessing"),
      city: "Lagos",
      state: "Lagos",
      distanceKm: 6,
      verified: true,
      at: hoursAgo(8),
      message: "Your profile stood out. Would love to connect."
    },
    {
      id: `${DEMO_PREFIX}mide`,
      profileId: `${DEMO_PREFIX}mide`,
      name: "Mide",
      age: 28,
      photo: photoForName("Mide"),
      city: "Ibadan",
      state: "Oyo",
      distanceKm: 14,
      verified: false,
      at: hoursAgo(20),
      message: "You seem thoughtful. Say hi when you're free."
    }
  ];
}

export function getReviewerDemoMayLikeProfiles(): DiscoverProfile[] {
  const base = (name: string, age: number, city: string, state: string, id: string): DiscoverProfile => ({
    id,
    name,
    age,
    city,
    state,
    bio: "Open to meaningful connections across Nigeria.",
    photo: photoForName(name),
    intents: ["Relationship", "Chat"],
    interests: ["Music", "Food", "Travel"],
    verified: true,
    premium: false,
    distanceKm: 4 + age % 6,
    createdAt: hoursAgo(48)
  });

  return [
    base("Blessing", 24, "Lagos", "Lagos", `${DEMO_PREFIX}may-blessing`),
    base("Mide", 28, "Ibadan", "Oyo", `${DEMO_PREFIX}may-mide`),
    base("Esther", 26, "Enugu", "Enugu", `${DEMO_PREFIX}may-esther`),
    base("Sarah", 27, "Benin City", "Edo", `${DEMO_PREFIX}may-sarah`)
  ];
}

export function mergeReviewerDemoSignals(
  user: UserProfile,
  realSignals: LikeEntry[]
): LikeEntry[] {
  if (!isReviewerDemoChatUser(user)) return realSignals;
  const hasReal = realSignals.some((s) => !isDemoSignalEntry(s));
  if (hasReal) return realSignals;
  if (realSignals.length > 0) return realSignals;
  return getReviewerDemoIncomingSignals();
}
