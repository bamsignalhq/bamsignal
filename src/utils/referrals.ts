import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";
import { readJson, writeJson } from "./storage";

import { AUTH_SIGNUP_PATH } from "../constants/routes";

const REFERRAL_GOAL = 3;
const REWARD_DAYS = 7;

export type ReferralState = {
  code: string;
  invitesSent: number;
  successfulReferrals: number;
  rewardsClaimed: number;
  lastRewardAt?: string;
};

function randomCode(name: string): string {
  const base = (name || "BAM")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export function getReferralState(user: UserProfile): ReferralState {
  const stored = readJson<ReferralState | null>(STORAGE_KEYS.referrals, null);
  if (stored?.code) return stored;

  const code = user.referralCode?.trim().toUpperCase() || randomCode(user.name);
  const initial: ReferralState = { code, invitesSent: 0, successfulReferrals: 0, rewardsClaimed: 0 };
  writeJson(STORAGE_KEYS.referrals, initial);
  return initial;
}

export function referralShareUrl(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://bamsignal.com";
  return `${origin}${AUTH_SIGNUP_PATH}?ref=${encodeURIComponent(code)}`;
}

export function recordInviteSent(): ReferralState {
  const state = readJson<ReferralState>(STORAGE_KEYS.referrals, {
    code: "BAM0000",
    invitesSent: 0,
    successfulReferrals: 0,
    rewardsClaimed: 0
  });
  const next = { ...state, invitesSent: state.invitesSent + 1 };
  writeJson(STORAGE_KEYS.referrals, next);
  return next;
}

/** Referral credits are applied server-side when referred users finish onboarding. */
export function recordSuccessfulReferral(): ReferralState {
  return readJson<ReferralState>(STORAGE_KEYS.referrals, {
    code: "BAM0000",
    invitesSent: 0,
    successfulReferrals: 0,
    rewardsClaimed: 0
  });
}

export function referralProgress(state: ReferralState): {
  goal: number;
  current: number;
  remaining: number;
  rewardLabel: string;
  pendingRewards: number;
} {
  const cycle = state.successfulReferrals % REFERRAL_GOAL;
  const earned = Math.floor(state.successfulReferrals / REFERRAL_GOAL);
  return {
    goal: REFERRAL_GOAL,
    current: cycle,
    remaining: REFERRAL_GOAL - cycle,
    rewardLabel: `${REWARD_DAYS}-day Signal Pass`,
    pendingRewards: Math.max(0, earned - state.rewardsClaimed)
  };
}
