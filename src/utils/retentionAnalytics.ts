import { STORAGE_KEYS } from "../constants/limits";
import { countEvent, countEventToday, eventsSince } from "./analytics";
import { readJson } from "./storage";

type EventRow = { event: string; at: string };

function signupDates(): string[] {
  const rows = readJson<EventRow[]>(STORAGE_KEYS.analytics, []);
  return rows.filter((r) => r.event === "signup_completed").map((r) => r.at.slice(0, 10));
}

function activeOnDay(signupDay: string, offsetDays: number): boolean {
  const target = new Date(signupDay);
  target.setDate(target.getDate() + offsetDays);
  const key = target.toISOString().slice(0, 10);
  const activeDays = readJson<string[]>(STORAGE_KEYS.dailyActiveDays, []);
  return activeDays.includes(key);
}

function retentionRate(offsetDays: number): number {
  const cohort = [...new Set(signupDates())];
  if (!cohort.length) return 0;
  const retained = cohort.filter((day) => activeOnDay(day, offsetDays)).length;
  return Math.round((retained / cohort.length) * 100);
}

export function getRetentionMetrics() {
  const signups = countEvent("signup_completed");
  const profilesCompleted = countEvent("profile_completed");
  const verifications = countEvent("verification_approved");
  const payments = countEvent("payment_successful");
  const referrals = countEvent("referral_signup");

  return {
    day1Retention: retentionRate(1),
    day7Retention: retentionRate(7),
    day30Retention: retentionRate(30),
    profileCompletionRate: signups ? Math.round((profilesCompleted / signups) * 100) : 0,
    verificationRate: signups ? Math.round((verifications / signups) * 100) : 0,
    premiumConversionRate: signups ? Math.round((payments / signups) * 100) : 0,
    referralConversionRate: signups ? Math.round((referrals / signups) * 100) : 0,
    signupsToday: countEventToday("signup_completed"),
    dau: Math.max(eventsSince("daily_active", 86400000), countEventToday("daily_active")),
    wau: eventsSince("daily_active", 7 * 86400000),
    mau: eventsSince("daily_active", 30 * 86400000)
  };
}

export function getBusinessMetrics() {
  return {
    signalsSent: countEvent("signal_sent"),
    signalsSentToday: countEventToday("signal_sent"),
    signalsAccepted: countEvent("signal_accepted"),
    signalsAcceptedToday: countEventToday("signal_accepted"),
    messagesSent: countEvent("message_started"),
    messagesSentToday: countEventToday("message_started"),
    premiumRevenueEvents: countEvent("payment_successful"),
    premiumRevenueToday: countEventToday("payment_successful"),
    referralSignups: countEvent("referral_signup"),
    verificationRequests: countEvent("verification_approved"),
    reports: countEvent("safety_report"),
    upgradeImpressions: countEvent("upgrade_impression"),
    upgradeClicks: countEvent("upgrade_click"),
    ...getRetentionMetrics()
  };
}
