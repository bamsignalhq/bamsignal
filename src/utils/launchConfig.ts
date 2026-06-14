import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type LaunchConfig = {
  /** 24h Signal Pass trial for new signups */
  premiumTrialEnabled: boolean;
  premiumTrialHours: number;
  /** Show success stories section (off until real content) */
  socialProofEnabled: boolean;
};

export const DEFAULT_LAUNCH_CONFIG: LaunchConfig = {
  premiumTrialEnabled: false,
  premiumTrialHours: 24,
  socialProofEnabled: false
};

export function getLaunchConfig(): LaunchConfig {
  return { ...DEFAULT_LAUNCH_CONFIG, ...readJson<Partial<LaunchConfig>>(STORAGE_KEYS.launchConfig, {}) };
}

export function saveLaunchConfig(patch: Partial<LaunchConfig>): LaunchConfig {
  const next = { ...getLaunchConfig(), ...patch };
  writeJson(STORAGE_KEYS.launchConfig, next);
  return next;
}
