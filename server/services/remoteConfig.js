/**
 * Remote Configuration Center™ — server-side config cache and resolution.
 */

export const REMOTE_CONFIG_SERVER_DEFAULTS = {
  "signals.free_daily_limit": 5,
  "messaging.max_messages_per_day": 50,
  "discovery.max_profile_photos": 6,
  "discovery.min_profile_completeness": 70,
  "payments.boost_pricing_ngn": 1500,
  "payments.referral_reward_ngn": 500,
  "consultations.pricing_ngn": 25000,
  "consultations.voice_duration_seconds": 60,
  "consultations.working_hours": { start: "09:00", end: "18:00", timezone: "Africa/Lagos" },
  "consultations.duration_minutes": 45,
  "consultations.meeting_buffer_minutes": 15,
  "verification.otp_cooldown_seconds": 60,
  "verification.pin_attempt_limit": 5,
  "notifications.retry_interval_seconds": 300,
  "notifications.templates": { consultationReminder: "consult-reminder-v2", paymentReceipt: "payment-receipt-v1" },
  "matching.assignment_rules": { cityMatch: true, languageMatch: true, maxActiveJourneys: 12 },
  "matching.journey_status_rules": { maxActivePerMember: 1, autoArchiveDays: 90 },
  "moderation.support_sla_hours": 24,
  "moderation.success_story_policies": { requireDualConsent: true, moderationQueue: true },
  "ai.matching_experiment_weight": 0.15
};

const CACHE_TTL_MS = 60_000;
let cachedSnapshot = null;
let cachedAt = 0;

export function canAccessRemoteConfigurationCenter(permissions = []) {
  return (
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageGovernance") ||
    permissions.includes("ManageOperations")
  );
}

export function remoteConfigurationRouteRegistered(source) {
  return source.includes("/hard/configuration") && source.includes("configuration");
}

export function buildRemoteConfigSnapshot(entries = []) {
  const config = { ...REMOTE_CONFIG_SERVER_DEFAULTS };
  for (const entry of entries) {
    const key = entry.configKey ?? entry.key;
    if (!key) continue;
    if (entry.status && entry.status !== "active") continue;
    config[key] = entry.value ?? entry.draftValue;
  }
  return {
    generatedAt: new Date().toISOString(),
    config,
    revision: entries.length
  };
}

export function getCachedRemoteConfigSnapshot(entries) {
  const now = Date.now();
  if (cachedSnapshot && now - cachedAt < CACHE_TTL_MS) {
    return cachedSnapshot;
  }
  cachedSnapshot = buildRemoteConfigSnapshot(entries);
  cachedAt = now;
  return cachedSnapshot;
}

export function invalidateRemoteConfigCache() {
  cachedSnapshot = null;
  cachedAt = 0;
}

export function resolveRemoteConfigValue(key, entries = [], defaults = REMOTE_CONFIG_SERVER_DEFAULTS) {
  const active = entries.find((item) => (item.configKey ?? item.key) === key && item.status === "active");
  if (active) return active.value;
  return defaults[key];
}

export function validateRemoteConfigValue(valueType, value) {
  if (value === undefined || value === null) return { ok: false, reason: "missing-value" };
  if (valueType === "number" && typeof value !== "number") return { ok: false, reason: "invalid-number" };
  if (valueType === "boolean" && typeof value !== "boolean") return { ok: false, reason: "invalid-boolean" };
  if (valueType === "string" && typeof value !== "string") return { ok: false, reason: "invalid-string" };
  return { ok: true };
}

export const REMOTE_CONFIG_SERVER_SEED = Object.entries(REMOTE_CONFIG_SERVER_DEFAULTS).map(([configKey, value], index) => ({
  id: `rcfg_${index + 1}`,
  configKey,
  key: configKey,
  value,
  valueType: typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "json",
  status: "active"
}));
