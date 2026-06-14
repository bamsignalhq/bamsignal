import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, LikeEntry } from "../types";
import { getDiscoverProfile } from "../data/mockProfiles";
import { computeCompatibilityPercent } from "./compatibility";
import { readJson, writeJson, getDailyKey } from "./storage";

export type ProfileViewer = {
  profileId: string;
  name: string;
  photo: string;
  age: number;
  city: string;
  compatibility: number;
  at: string;
};

type ProfileViewsState = {
  count: number;
  viewers: ProfileViewer[];
};

export function getProfileViews(): ProfileViewsState {
  return readJson<ProfileViewsState>(STORAGE_KEYS.profileViews, { count: 0, viewers: [] });
}

export function getProfileViewsToday(): number {
  const today = getDailyKey();
  return getProfileViews().viewers.filter(
    (viewer) => new Date(viewer.at).toLocaleDateString("en-CA") === today
  ).length;
}

export function recordProfileView(viewer: Omit<ProfileViewer, "at">): void {
  const state = getProfileViews();
  const exists = state.viewers.some((v) => v.profileId === viewer.profileId);
  if (exists) {
    const viewers = state.viewers.map((v) =>
      v.profileId === viewer.profileId
        ? { ...v, at: new Date().toISOString(), compatibility: viewer.compatibility }
        : v
    );
    writeJson(STORAGE_KEYS.profileViews, { count: state.count, viewers: viewers.slice(0, 50) });
    return;
  }
  state.count += 1;
  state.viewers.unshift({ ...viewer, at: new Date().toISOString() });
  writeJson(STORAGE_KEYS.profileViews, {
    count: state.count,
    viewers: state.viewers.slice(0, 50)
  });
}

/** Sync real viewers from incoming signals — no fake simulation */
export function syncProfileViewsFromSignals(
  viewer: DatingProfile,
  signals: LikeEntry[] = readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, [])
): void {
  for (const signal of signals) {
    const profile = getDiscoverProfile(signal.profileId);
    if (!profile) continue;
    recordProfileView({
      profileId: profile.id,
      name: profile.name,
      photo: profile.photo,
      age: profile.age,
      city: profile.city,
      compatibility: computeCompatibilityPercent(viewer, profile)
    });
  }
}
