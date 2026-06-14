import { STORAGE_KEYS } from "../constants/limits";
import { getLaunchConfig } from "./launchConfig";
import { readJson, writeJson } from "./storage";
import { trackEvent } from "./analytics";
import { notifyPremiumActivated } from "./notifyHelpers";

type TrialState = {
  startedAt: string;
  expiresAt: string;
  used: boolean;
};

export function getPremiumTrialState(): TrialState | null {
  return readJson<TrialState | null>(STORAGE_KEYS.premiumTrial, null);
}

export function isPremiumTrialActive(): boolean {
  const trial = getPremiumTrialState();
  if (!trial) return false;
  return new Date(trial.expiresAt).getTime() > Date.now();
}

export function isPremiumTrialExpired(): boolean {
  const trial = getPremiumTrialState();
  if (!trial?.used) return false;
  return new Date(trial.expiresAt).getTime() <= Date.now();
}

/** Grant trial on new signup when admin experiment is enabled */
export function maybeGrantPremiumTrial(isNewSignup: boolean): boolean {
  if (!isNewSignup) return false;
  const config = getLaunchConfig();
  if (!config.premiumTrialEnabled) return false;
  if (getPremiumTrialState()?.used) return false;

  const startedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + config.premiumTrialHours * 3600000).toISOString();
  writeJson(STORAGE_KEYS.premiumTrial, { startedAt, expiresAt, used: true });
  trackEvent("premium_trial_started", { hours: String(config.premiumTrialHours) });
  notifyPremiumActivated();
  return true;
}

export function premiumTrialHoursRemaining(): number {
  const trial = getPremiumTrialState();
  if (!trial || !isPremiumTrialActive()) return 0;
  return Math.max(0, Math.ceil((new Date(trial.expiresAt).getTime() - Date.now()) / 3600000));
}

export function checkPremiumTrialExpiry(): void {
  if (isPremiumTrialExpired()) {
    trackEvent("premium_trial_expired");
  }
}
