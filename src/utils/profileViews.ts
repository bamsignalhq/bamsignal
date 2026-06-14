import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson, getDailyKey } from "./storage";

export type ProfileViewer = {
  name: string;
  photo: string;
  city: string;
  at: string;
};

type ProfileViewsState = {
  count: number;
  viewers: ProfileViewer[];
};

export function getProfileViews(): ProfileViewsState {
  return readJson<ProfileViewsState>(STORAGE_KEYS.profileViews, { count: 0, viewers: [] });
}

/** Views recorded today — used by dashboard momentum bar */
export function getProfileViewsToday(): number {
  const today = getDailyKey();
  return getProfileViews().viewers.filter(
    (viewer) => new Date(viewer.at).toLocaleDateString("en-CA") === today
  ).length;
}

export function recordProfileView(viewer: Omit<ProfileViewer, "at">): void {
  const state = getProfileViews();
  state.count += 1;
  state.viewers.unshift({ ...viewer, at: new Date().toISOString() });
  writeJson(STORAGE_KEYS.profileViews, {
    count: state.count,
    viewers: state.viewers.slice(0, 30)
  });
}

/** Demo: simulate occasional views for launch */
export function maybeSimulateProfileView(): void {
  const state = getProfileViews();
  if (state.count > 0 && Math.random() > 0.35) return;
  const names = ["Adaeze", "David", "Ngozi", "Funke", "Tunde"];
  const cities = ["Lagos", "Abuja", "Enugu", "Port Harcourt"];
  recordProfileView({
    name: names[Math.floor(Math.random() * names.length)],
    photo: "/showcase/hero-lagos-young-professionals-01.webp",
    city: cities[Math.floor(Math.random() * cities.length)]
  });
}
