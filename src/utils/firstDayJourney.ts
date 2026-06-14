import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile } from "../types";
import { calculateProfileStrength } from "./profileStrength";
import { readJson, writeJson } from "./storage";
import { trackEvent } from "./analytics";

export type FirstDayStep =
  | "welcome"
  | "profile_complete"
  | "discover_opened"
  | "first_signal"
  | "compat_viewed"
  | "first_connection";

export type FirstDayJourney = {
  welcomeSeen: boolean;
  profileComplete: boolean;
  discoverOpened: boolean;
  firstSignalSent: boolean;
  compatViewed: boolean;
  firstConnection: boolean;
  completedAt?: string;
};

const DEFAULT: FirstDayJourney = {
  welcomeSeen: false,
  profileComplete: false,
  discoverOpened: false,
  firstSignalSent: false,
  compatViewed: false,
  firstConnection: false
};

export function getFirstDayJourney(): FirstDayJourney {
  return readJson(STORAGE_KEYS.firstDayJourney, DEFAULT);
}

function save(journey: FirstDayJourney): FirstDayJourney {
  writeJson(STORAGE_KEYS.firstDayJourney, journey);
  return journey;
}

export function isFirstDayActive(joinedAt: string | null): boolean {
  if (!joinedAt) return true;
  const hours = (Date.now() - new Date(joinedAt).getTime()) / 3600000;
  return hours <= 48;
}

export function markFirstDayStep(step: FirstDayStep): FirstDayJourney {
  const current = getFirstDayJourney();
  const patch: Partial<FirstDayJourney> = {};

  switch (step) {
    case "welcome":
      patch.welcomeSeen = true;
      break;
    case "profile_complete":
      patch.profileComplete = true;
      break;
    case "discover_opened":
      patch.discoverOpened = true;
      break;
    case "first_signal":
      patch.firstSignalSent = true;
      break;
    case "compat_viewed":
      patch.compatViewed = true;
      break;
    case "first_connection":
      patch.firstConnection = true;
      break;
  }

  const next = { ...current, ...patch };
  if (
    next.profileComplete &&
    next.firstSignalSent &&
    next.firstConnection &&
    !next.completedAt
  ) {
    next.completedAt = new Date().toISOString();
  }
  trackEvent("first_day_step", { step });
  return save(next);
}

export function syncFirstDayFromProfile(profile: DatingProfile): FirstDayJourney {
  const journey = getFirstDayJourney();
  if (calculateProfileStrength(profile) >= 100 && !journey.profileComplete) {
    return markFirstDayStep("profile_complete");
  }
  return journey;
}

export type FirstDayChecklistItem = {
  id: FirstDayStep;
  label: string;
  done: boolean;
};

export function getFirstDayChecklist(journey = getFirstDayJourney()): FirstDayChecklistItem[] {
  return [
    { id: "profile_complete", label: "Profile complete", done: journey.profileComplete },
    { id: "first_signal", label: "First signal sent", done: journey.firstSignalSent },
    { id: "first_connection", label: "First connection started", done: journey.firstConnection }
  ];
}

export function firstDayProgress(journey = getFirstDayJourney()): { done: number; total: number } {
  const checklist = getFirstDayChecklist(journey);
  return {
    done: checklist.filter((item) => item.done).length,
    total: checklist.length
  };
}
