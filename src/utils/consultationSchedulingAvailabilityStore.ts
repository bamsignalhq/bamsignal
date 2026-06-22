import {
  CONSULTATION_SCHEDULING_DEFAULT_DAYS,
  CONSULTATION_SCHEDULING_DEFAULT_DURATION_MINUTES,
  CONSULTATION_SCHEDULING_DEFAULT_HORIZON_DAYS,
  CONSULTATION_SCHEDULING_DEFAULT_HOURS,
  CONSULTATION_SCHEDULING_DEFAULT_TIMEZONE
} from "../constants/consultationScheduling";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConsultantAvailabilityConfig } from "../types/consultationScheduling";
import { readJson, writeJson } from "./storage";

type AvailabilityConfigStore = {
  configs: Record<string, ConsultantAvailabilityConfig>;
  updatedAt: string;
};

const CONFIG_STORE_KEY = STORAGE_KEYS.conciergeSchedulingAvailabilityStore;

function loadConfigStore(): AvailabilityConfigStore {
  return readJson<AvailabilityConfigStore>(CONFIG_STORE_KEY, {
    configs: {},
    updatedAt: new Date().toISOString()
  });
}

function saveConfigStore(store: AvailabilityConfigStore): void {
  writeJson(CONFIG_STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

export function defaultConsultantAvailabilityConfig(
  consultantId: string,
  timezone = CONSULTATION_SCHEDULING_DEFAULT_TIMEZONE
): ConsultantAvailabilityConfig {
  const now = new Date().toISOString();
  return {
    consultantId,
    timezone,
    availableDays: [...CONSULTATION_SCHEDULING_DEFAULT_DAYS],
    availableHours: [...CONSULTATION_SCHEDULING_DEFAULT_HOURS],
    blackoutPeriods: [],
    durationMinutes: CONSULTATION_SCHEDULING_DEFAULT_DURATION_MINUTES,
    horizonDays: CONSULTATION_SCHEDULING_DEFAULT_HORIZON_DAYS,
    updatedAt: now
  };
}

export function getConsultantAvailabilityConfig(consultantId: string): ConsultantAvailabilityConfig {
  const store = loadConfigStore();
  return store.configs[consultantId] ?? defaultConsultantAvailabilityConfig(consultantId);
}

export function saveConsultantAvailabilityConfig(
  config: Omit<ConsultantAvailabilityConfig, "updatedAt"> & { updatedAt?: string }
): ConsultantAvailabilityConfig {
  const store = loadConfigStore();
  const next: ConsultantAvailabilityConfig = {
    ...defaultConsultantAvailabilityConfig(config.consultantId, config.timezone),
    ...config,
    updatedAt: config.updatedAt ?? new Date().toISOString()
  };
  saveConfigStore({
    configs: { ...store.configs, [config.consultantId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function resetConsultantAvailabilityConfigStoreForTests(): void {
  writeJson(CONFIG_STORE_KEY, { configs: {}, updatedAt: new Date().toISOString() });
}
