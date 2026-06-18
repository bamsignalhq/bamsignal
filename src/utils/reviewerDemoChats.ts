import { MOMENT_SETS, photoForCity } from "../constants/showcase";
import { STORAGE_KEYS } from "../constants/limits";
import { MOCK_PROFILES } from "../data/mockProfiles";
import type { ChatMessage, ChatThread, Match, UserProfile } from "../types";
import { readJson, writeJson } from "./storage";

const PLAY_REVIEWER_EMAIL = "reviewer@bamsignal.com";
const PLAY_REVIEWER_USERNAME = "playreview";
const DEMO_PREFIX = "demo-reviewer-";

export const DEMO_TYPING_MATCH_ID = `${DEMO_PREFIX}amaka`;

export function isReviewerDemoChatUser(user: Pick<UserProfile, "email" | "username">): boolean {
  const email = (user.email || "").trim().toLowerCase();
  const username = (user.username || "").trim().toLowerCase();
  if (email === PLAY_REVIEWER_EMAIL || username === PLAY_REVIEWER_USERNAME) return true;
  if (import.meta.env.DEV && (email === "demo@bamsignal.com" || username === "ada")) return true;
  return false;
}

export function isDemoTypingMatch(matchId: string): boolean {
  return matchId === DEMO_TYPING_MATCH_ID;
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function msg(id: string, from: "me" | "them", text: string, minutesBack: number): ChatMessage {
  return { id, from, text, at: minutesAgo(minutesBack) };
}

function profilePhoto(name: string): string {
  const found = MOCK_PROFILES.find((p) => p.name === name);
  if (found) return found.photo;
  return photoForCity("Lagos");
}

/** Safe demo inbox for Play reviewer / local demo when no real matches exist. */
export function seedReviewerDemoChatsIfNeeded(user: UserProfile): boolean {
  if (!isReviewerDemoChatUser(user)) return false;

  const matches = readJson<Match[]>(STORAGE_KEYS.matches, []);
  const hasRealMatches = matches.some((m) => !m.id.startsWith(DEMO_PREFIX));
  if (hasRealMatches) return false;
  if (matches.length > 0) return false;

  const now = Date.now();
  const todayMorning = new Date(now);
  todayMorning.setHours(11, 24, 0, 0);
  const chiomaTime =
    todayMorning.getTime() <= now
      ? todayMorning.toISOString()
      : minutesAgo(12);

  const demoMatches: Match[] = [
    {
      id: `${DEMO_PREFIX}chiomaka`,
      profileId: "demo-chiomaka",
      name: "Chiomaka ❤️",
      photo: MOMENT_SETS.lagosRooftop[0],
      city: "Lagos",
      matchedAt: hoursAgo(72),
      lastActiveAt: minutesAgo(2)
    },
    {
      id: `${DEMO_PREFIX}kelechi`,
      profileId: MOCK_PROFILES.find((p) => p.name === "Kelechi")?.id ?? "p10",
      name: "Kelechi",
      photo: profilePhoto("Kelechi"),
      city: "Port Harcourt",
      matchedAt: hoursAgo(48),
      lastActiveAt: minutesAgo(18)
    },
    {
      id: DEMO_TYPING_MATCH_ID,
      profileId: MOCK_PROFILES.find((p) => p.name === "Amaka")?.id ?? "p7",
      name: "Amaka",
      photo: profilePhoto("Amaka"),
      city: "Benin",
      matchedAt: hoursAgo(24),
      lastActiveAt: minutesAgo(1)
    },
    {
      id: `${DEMO_PREFIX}tunde`,
      profileId: MOCK_PROFILES.find((p) => p.name === "Tunde")?.id ?? "p6",
      name: "Tunde",
      photo: profilePhoto("Tunde"),
      city: "Owerri",
      matchedAt: hoursAgo(120),
      lastActiveAt: hoursAgo(3)
    },
    {
      id: `${DEMO_PREFIX}bola`,
      profileId: "demo-bola",
      name: "Bola",
      photo: MOMENT_SETS.sundayHangout[1],
      city: "Ibadan",
      matchedAt: hoursAgo(36),
      lastActiveAt: hoursAgo(2)
    },
    {
      id: `${DEMO_PREFIX}david`,
      profileId: MOCK_PROFILES.find((p) => p.name === "David")?.id ?? "p2",
      name: "David",
      photo: profilePhoto("David"),
      city: "Abuja",
      matchedAt: hoursAgo(96),
      lastActiveAt: hoursAgo(5)
    }
  ];

  const threads: Record<string, ChatThread> = {
    [`${DEMO_PREFIX}chiomaka`]: {
      matchId: `${DEMO_PREFIX}chiomaka`,
      pinned: true,
      readAt: minutesAgo(40),
      messages: [
        msg("c1", "them", "Good morning! How's Lagos treating you?", 180),
        msg("c2", "me", "Busy but good — you?", 175),
        msg("c3", "them", "Hey, hope your day is going well 😊", 12),
        { id: "c4", from: "them", text: "Free for coffee later?", at: chiomaTime }
      ]
    },
    [`${DEMO_PREFIX}kelechi`]: {
      matchId: `${DEMO_PREFIX}kelechi`,
      readAt: minutesAgo(90),
      peerSeenAt: minutesAgo(5),
      messages: [
        msg("k1", "them", "That suya spot in PH is undefeated.", 120),
        msg("k2", "me", "We should go again this weekend.", 25),
        msg("k3", "them", "That suya place was amazing 😂", 22)
      ]
    },
    [DEMO_TYPING_MATCH_ID]: {
      matchId: DEMO_TYPING_MATCH_ID,
      readAt: minutesAgo(8),
      messages: [
        msg("a1", "me", "Are you still in Benin this week?", 45),
        msg("a2", "them", "Yes! Back Sunday.", 30)
      ]
    },
    [`${DEMO_PREFIX}tunde`]: {
      matchId: `${DEMO_PREFIX}tunde`,
      readAt: hoursAgo(4),
      messages: [
        msg("t1", "them", "Sunday hangout at Jara?", 300),
        msg("t2", "me", "Sounds good — what time?", 280),
        msg("t3", "them", "Let's say 4pm.", 260)
      ]
    },
    [`${DEMO_PREFIX}bola`]: {
      matchId: `${DEMO_PREFIX}bola`,
      readAt: hoursAgo(6),
      messages: [
        msg("b1", "them", "Your profile made me smile.", 200),
        msg("b2", "me", "Likewise — love the Ibadan vibes.", 195),
        msg("b3", "them", "Comedy show this Friday if you're free.", 190)
      ]
    },
    [`${DEMO_PREFIX}david`]: {
      matchId: `${DEMO_PREFIX}david`,
      readAt: hoursAgo(8),
      messages: [
        msg("d1", "them", "Abuja traffic is wild today.", 400),
        msg("d2", "me", "Tell me about it 😅", 395),
        msg("d3", "them", "We should grab lunch in Wuse when you're in town.", 390)
      ]
    }
  };

  writeJson(STORAGE_KEYS.matches, demoMatches);
  writeJson(STORAGE_KEYS.chats, threads);
  return true;
}
