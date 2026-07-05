import type { NavTab } from "../types";
import { normalizePath } from "./routePath";

export const ONBOARDING_PATH = "/onboarding";

export type MemberAppPath = "home" | "onboarding" | NavTab;

const TAB_TO_PATH: Record<NavTab, string> = {
  home: "/home",
  discover: "/discover",
  likes: "/signals",
  chats: "/chats",
  me: "/profile"
};

const PATH_TO_TAB: Record<string, NavTab> = {
  "/home": "home",
  "/fast-connection": "home",
  "/discover": "discover",
  "/signals": "likes",
  "/chats": "chats",
  "/profile": "me",
  "/voice-vibe": "me",
  "/trusted-member": "me",
  "/saved-profiles": "me",
  "/settings": "me",
  "/subscription": "me",
  "/referral": "me"
};

export function memberPathForTab(tab: NavTab): string {
  return TAB_TO_PATH[tab];
}

export function parseMemberPath(pathname = window.location.pathname): MemberAppPath | null {
  const path = normalizePath(pathname);
  if (path === ONBOARDING_PATH) return "onboarding";
  const tab = PATH_TO_TAB[path];
  if (tab) return tab;
  if (path.startsWith("/home/")) return "home";
  return null;
}

export function isMemberAppPath(pathname = window.location.pathname): boolean {
  return parseMemberPath(pathname) !== null;
}

export function isOnboardingPath(pathname = window.location.pathname): boolean {
  return normalizePath(pathname) === ONBOARDING_PATH;
}

export function memberTabFromPath(pathname = window.location.pathname): NavTab | null {
  const parsed = parseMemberPath(pathname);
  if (!parsed || parsed === "onboarding") return null;
  return parsed;
}
