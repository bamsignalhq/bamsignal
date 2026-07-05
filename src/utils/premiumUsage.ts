import { FREE_DAILY_MESSAGES, FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import { countEvent, countEventToday } from "./analytics";
import { advancedFromMatchPreferences, homeAdvancedFilterCount } from "./homeFilters";
import { readDailyCount, getRemainingDaily, readJson } from "./storage";
import { hasUnlimitedSignalsAccess } from "../services/premiumStatus";
import type { MatchPreferences } from "../types";

export type PremiumUsageSnapshot = {
  signalsUsedToday: number;
  signalsLimitLabel: string;
  messagesUsedToday: number;
  messagesLimitLabel: string;
  profileViewsTotal: number;
  profileViewsToday: number;
  advancedFilterCount: number;
  searchesThisWeek: number;
  unlimitedSignals: boolean;
  updatedAt: string;
};

function readProfileViews(): { count: number } {
  return readJson(STORAGE_KEYS.profileViews, { count: 0, viewers: [] });
}

export function getPremiumUsageSnapshot(): PremiumUsageSnapshot {
  const unlimited = hasUnlimitedSignalsAccess();
  const signalsUsed = readDailyCount(STORAGE_KEYS.dailySwipes);
  const messagesUsed = readDailyCount(STORAGE_KEYS.dailyMessages);
  const views = readProfileViews();
  const prefs = readJson<MatchPreferences>(STORAGE_KEYS.matchPreferences, {} as MatchPreferences);
  const advanced = advancedFromMatchPreferences(prefs);

  return {
    signalsUsedToday: signalsUsed,
    signalsLimitLabel: unlimited
      ? "Unlimited"
      : `${getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES)}/${FREE_DAILY_SWIPES} left`,
    messagesUsedToday: messagesUsed,
    messagesLimitLabel: unlimited
      ? "Unlimited"
      : `${getRemainingDaily(STORAGE_KEYS.dailyMessages, FREE_DAILY_MESSAGES)}/${FREE_DAILY_MESSAGES} left`,
    profileViewsTotal: views.count ?? 0,
    profileViewsToday: countEventToday("profile_viewed"),
    advancedFilterCount: homeAdvancedFilterCount(advanced),
    searchesThisWeek: countEvent("home_search"),
    unlimitedSignals: unlimited,
    updatedAt: new Date().toISOString(),
  };
}
