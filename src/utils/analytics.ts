import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type AnalyticsEvent =
  | "signup_started"
  | "signup_completed"
  | "photo_uploaded"
  | "profile_completed"
  | "signal_sent"
  | "signal_received"
  | "signal_accepted"
  | "profile_viewed"
  | "paywall_seen"
  | "payment_started"
  | "payment_successful"
  | "payment_failed"
  | "daily_active"
  | "message_started"
  | "waitlist_joined"
  | "city_selected"
  | "state_selected"
  | "quickie_paywall_shown"
  | "quickie_unlock"
  | "exchange_requested"
  | "exchange_accepted"
  | "exchange_declined"
  | "exchange_completed"
  | "contact_sharing_disabled"
  | "contact_request_expired"
  | "boost_activated"
  | "upgrade_impression"
  | "upgrade_click"
  | "premium_trial_started"
  | "premium_trial_expired"
  | "first_day_step"
  | "safety_report"
  | "safety_block"
  | "safety_mute"
  | "safety_hide"
  | "safety_restrict"
  | "contact_share_attempt"
  | "referral_signup"
  | "share_profile"
  | "share_referral"
  | "share_success_story"
  | "campaign_impression"
  | "campaign_conversion"
  | "lifecycle_stage_changed"
  | "lifecycle_milestone"
  | "lifecycle_next_step"
  | "verification_approved"
  | "photo_rejected_contact_text"
  | "photo_rejected"
  | "home_search";

type EventRow = { event: AnalyticsEvent; at: string; meta?: Record<string, string> };

function resolveCity(meta?: Record<string, string>): string {
  if (meta?.city?.trim()) return meta.city.trim();
  const profile = readJson<{ city?: string }>(STORAGE_KEYS.datingProfile, {});
  return profile.city?.trim() || "Unknown";
}

export function trackEvent(event: AnalyticsEvent, meta?: Record<string, string>): void {
  const rows = readJson<EventRow[]>(STORAGE_KEYS.analytics, []);
  rows.push({
    event,
    at: new Date().toISOString(),
    meta: { ...meta, city: resolveCity(meta) }
  });
  writeJson(STORAGE_KEYS.analytics, rows.slice(-500));
  if (import.meta.env.DEV) {
    console.info("[analytics]", event, meta ?? "");
  }
}

export function countEvent(event: AnalyticsEvent): number {
  return readJson<EventRow[]>(STORAGE_KEYS.analytics, []).filter((r) => r.event === event).length;
}

export function countEventToday(event: AnalyticsEvent): number {
  return eventsSince(event, 24 * 60 * 60 * 1000);
}

export function eventsSince(event: AnalyticsEvent, sinceMs: number): number {
  const since = Date.now() - sinceMs;
  return readJson<EventRow[]>(STORAGE_KEYS.analytics, []).filter(
    (r) => r.event === event && new Date(r.at).getTime() >= since
  ).length;
}

export function recordDailyActive(): void {
  const today = new Date().toISOString().slice(0, 10);
  const days = readJson<string[]>(STORAGE_KEYS.dailyActiveDays, []);
  if (days.includes(today)) return;
  writeJson(STORAGE_KEYS.dailyActiveDays, [...days, today].slice(-90));
  trackEvent("daily_active");
}

export function dailyActiveUsersToday(): number {
  const today = new Date().toISOString().slice(0, 10);
  const days = readJson<string[]>(STORAGE_KEYS.dailyActiveDays, []);
  const fromDays = days.filter((d) => d === today).length;
  const fromEvents = eventsSince("daily_active", 24 * 60 * 60 * 1000);
  return Math.max(fromDays, fromEvents > 0 ? 1 : 0, fromEvents);
}
