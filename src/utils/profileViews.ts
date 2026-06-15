import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, LikeEntry } from "../types";
import { getCachedMemberProfile } from "../services/discoverProfiles";
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

export function setProfileViewsFromServer(viewers: ProfileViewer[]): void {
  writeJson(STORAGE_KEYS.profileViews, {
    count: viewers.length,
    viewers: viewers.slice(0, 50)
  });
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

/** Build visitor list from incoming signals in the database-backed inbox */
export function syncProfileViewsFromSignals(
  viewer: DatingProfile,
  signals: LikeEntry[] = readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, [])
): ProfileViewer[] {
  const viewers: ProfileViewer[] = [];
  for (const signal of signals) {
    const profile = getCachedMemberProfile(signal.profileId);
    viewers.push({
      profileId: signal.profileId,
      name: signal.name,
      photo: signal.photo,
      age: profile?.age || 25,
      city: signal.city || profile?.city || viewer.city || "",
      compatibility: profile ? computeCompatibilityPercent(viewer, profile) : 0,
      at: signal.at
    });
  }
  setProfileViewsFromServer(viewers);
  return viewers;
}
