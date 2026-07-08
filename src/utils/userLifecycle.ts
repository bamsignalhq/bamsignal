import type { DatingProfile, UserProfile } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import {
  LIFECYCLE_MILESTONES,
  LIFECYCLE_STAGES,
  RECOMMENDED_ACTIONS,
  USER_LIFECYCLE_MISSION,
  type LifecycleMilestoneId,
  type LifecycleRecommendedActionId,
  type LifecycleStage,
} from "../constants/userLifecycle";
import { trackEvent, eventsSince, countEvent } from "./analytics";
import { readJson, writeJson } from "./storage";
import { calculateProfileStrength } from "./profileStrength";
import { isPremiumActive } from "../services/premiumStatus";
import { getReferralState } from "./referrals";
import { pushNotification } from "./notifications";

export type LifecycleStageHistoryEntry = {
  stage: LifecycleStage;
  at: string;
  reason: string;
};

export type UserLifecycleSnapshot = {
  mission: string;
  stage: LifecycleStage;
  stageLabel: string;
  progressPercent: number;
  stageHistory: LifecycleStageHistoryEntry[];
  milestonesCompleted: LifecycleMilestoneId[];
  nextRecommendedAction: {
    id: LifecycleRecommendedActionId;
    label: string;
    description: string;
    path?: string;
  };
  updatedAt: string;
};

type StoredLifecycle = {
  stage?: LifecycleStage;
  stageHistory?: LifecycleStageHistoryEntry[];
  milestonesCompleted?: LifecycleMilestoneId[];
  updatedAt?: string;
};

function stageMeta(stage: LifecycleStage): { label: string; percent: number } {
  return (
    LIFECYCLE_STAGES.find((s) => s.id === stage) ?? {
      label: stage,
      percent: 0,
    }
  );
}

function clampMilestones(input: LifecycleMilestoneId[]): LifecycleMilestoneId[] {
  const known = new Set(LIFECYCLE_MILESTONES.map((m) => m.id));
  const unique: LifecycleMilestoneId[] = [];
  for (const id of input) {
    if (!known.has(id)) continue;
    if (!unique.includes(id)) unique.push(id);
  }
  return unique;
}

function loadStoredLifecycle(): StoredLifecycle {
  return readJson<StoredLifecycle>(STORAGE_KEYS.lifecycle, {});
}

function saveStoredLifecycle(next: StoredLifecycle): void {
  writeJson(STORAGE_KEYS.lifecycle, next);
}

function lastStage(stageHistory: LifecycleStageHistoryEntry[] = []): LifecycleStage | null {
  return stageHistory.length ? stageHistory[0].stage : null;
}

function hasRecentActivity(days: number): boolean {
  return eventsSince("daily_active", days * 86400000) > 0;
}

function resolveMilestones(input: {
  signup: boolean;
  phoneVerified: boolean;
  selfieVerified: boolean;
  profileStrength: number;
  signalsSent: number;
  conversations: number;
  purchased: boolean;
  referralSuccessful: number;
}): LifecycleMilestoneId[] {
  const milestones: LifecycleMilestoneId[] = [];
  if (input.signup) milestones.push("signup");
  if (input.phoneVerified) milestones.push("phone_verification");
  if (input.selfieVerified) milestones.push("selfie_verification");
  if (input.profileStrength >= 70) milestones.push("profile_strength");
  if (input.signalsSent >= 1) milestones.push("first_signal");
  if (input.conversations >= 1) milestones.push("first_conversation");
  if (input.purchased) milestones.push("first_purchase");
  if (input.referralSuccessful >= 1) milestones.push("first_referral");
  return milestones;
}

function resolveRecommendedActionId(input: {
  stage: LifecycleStage;
  phoneVerified: boolean;
  profileStrength: number;
  hasSignals: boolean;
  hasConversations: boolean;
  purchased: boolean;
  referralSuccessful: number;
  dormant: boolean;
}): LifecycleRecommendedActionId {
  if (input.dormant) return "reengage";
  if (!input.phoneVerified) return "verify_phone";
  if (input.profileStrength < 70) return "complete_profile";
  if (!input.hasSignals) return "start_discover";
  if (!input.hasConversations) return "start_conversation";
  if (!input.purchased) return "introduce_wallet";
  if (input.referralSuccessful < 1) return "share_referral";
  if (input.stage !== "premium" && input.stage !== "ambassador") return "upgrade_premium";
  return "share_referral";
}

function computeStage(input: {
  hasUser: boolean;
  phoneVerified: boolean;
  selfieVerified: boolean;
  profileStrength: number;
  recent7d: boolean;
  engaged7d: boolean;
  premium: boolean;
  ambassador: boolean;
  dormant30d: boolean;
  wasDormant: boolean;
}): { stage: LifecycleStage; reason: string } {
  if (!input.hasUser) return { stage: "visitor", reason: "no_member_identity" };
  if (input.dormant30d) return { stage: "dormant", reason: "no_activity_30d" };
  if (input.wasDormant && input.recent7d) return { stage: "reactivated", reason: "returned_after_dormant" };
  if (input.ambassador) return { stage: "ambassador", reason: "referral_success" };
  if (input.premium) return { stage: "premium", reason: "signal_pass_active" };
  if (input.engaged7d) return { stage: "engaged", reason: "conversation_or_signals_7d" };
  if (input.recent7d) return { stage: "active", reason: "active_7d" };
  if (input.profileStrength >= 70) return { stage: "profile_complete", reason: "profile_strength" };
  if (input.phoneVerified || input.selfieVerified) return { stage: "verified", reason: "verification_signal" };
  return { stage: "registered", reason: "registered_identity" };
}

export function getLifecycle(input?: {
  user?: UserProfile | null;
  profile?: DatingProfile | null;
}): UserLifecycleSnapshot {
  const now = new Date().toISOString();
  const stored = loadStoredLifecycle();

  const user =
    input?.user ??
    readJson<UserProfile | null>(STORAGE_KEYS.userProfile, null);
  const profile =
    input?.profile ??
    readJson<DatingProfile | null>(STORAGE_KEYS.datingProfile, null);

  const hasUser = Boolean(user?.email || user?.phone);
  const phoneVerified = Boolean((user as any)?.phoneVerified);
  const selfieVerified = Boolean(profile?.verified);
  const strength = profile ? calculateProfileStrength(profile, { phoneVerified, isPremium: isPremiumActive() }) : 0;

  const signalsSent = countEvent("signal_sent");
  const conversations = countEvent("message_started");
  const purchased = countEvent("payment_successful") > 0;
  const everActive =
    countEvent("daily_active") > 0 || signalsSent > 0 || conversations > 0 || purchased;

  const referralState = user ? getReferralState(user) : null;
  const referralSuccessful = referralState?.successfulReferrals ?? 0;
  const ambassador = referralSuccessful >= 3;

  const recent7d = hasRecentActivity(7);
  const engaged7d =
    eventsSince("signal_sent", 7 * 86400000) > 0 ||
    eventsSince("message_started", 7 * 86400000) > 0;
  // New signups with no history are not dormant — only previously active members.
  const dormant30d = everActive && !hasRecentActivity(30);

  const wasDormant = lastStage(stored.stageHistory) === "dormant" || stored.stage === "dormant";

  const premium = isPremiumActive();

  const computed = computeStage({
    hasUser,
    phoneVerified,
    selfieVerified,
    profileStrength: strength,
    recent7d,
    engaged7d,
    premium,
    ambassador,
    dormant30d,
    wasDormant,
  });

  const stageHistory = Array.isArray(stored.stageHistory) ? stored.stageHistory.slice() : [];
  const previousStage = stored.stage ?? lastStage(stageHistory) ?? null;

  if (previousStage !== computed.stage) {
    const entry: LifecycleStageHistoryEntry = {
      stage: computed.stage,
      at: now,
      reason: computed.reason,
    };
    stageHistory.unshift(entry);
    trackEvent("lifecycle_stage_changed", { stage: computed.stage, reason: computed.reason });
    pushNotification({
      type: "lifecycle_milestone",
      title: "Lifecycle updated",
      body: `You are now ${stageMeta(computed.stage).label}.`,
    });
  }

  const computedMilestones = resolveMilestones({
    signup: hasUser,
    phoneVerified,
    selfieVerified,
    profileStrength: strength,
    signalsSent,
    conversations,
    purchased,
    referralSuccessful,
  });

  const mergedMilestones = clampMilestones([
    ...(Array.isArray(stored.milestonesCompleted) ? stored.milestonesCompleted : []),
    ...computedMilestones,
  ]);

  const nextActionId = resolveRecommendedActionId({
    stage: computed.stage,
    phoneVerified,
    profileStrength: strength,
    hasSignals: signalsSent > 0,
    hasConversations: conversations > 0,
    purchased,
    referralSuccessful,
    dormant: computed.stage === "dormant",
  });

  const nextAction = { id: nextActionId, ...RECOMMENDED_ACTIONS[nextActionId] };

  const nextStored: StoredLifecycle = {
    stage: computed.stage,
    stageHistory: stageHistory.slice(0, 25),
    milestonesCompleted: mergedMilestones,
    updatedAt: now,
  };
  saveStoredLifecycle(nextStored);

  const meta = stageMeta(computed.stage);
  return {
    mission: USER_LIFECYCLE_MISSION,
    stage: computed.stage,
    stageLabel: meta.label,
    progressPercent: meta.percent,
    stageHistory: nextStored.stageHistory ?? [],
    milestonesCompleted: mergedMilestones,
    nextRecommendedAction: nextAction,
    updatedAt: now,
  };
}

export function updateLifecycle(input: {
  stage?: LifecycleStage;
  milestoneCompleted?: LifecycleMilestoneId;
  reason?: string;
}): UserLifecycleSnapshot {
  const now = new Date().toISOString();
  const stored = loadStoredLifecycle();
  const stageHistory = Array.isArray(stored.stageHistory) ? stored.stageHistory.slice() : [];
  const milestones = Array.isArray(stored.milestonesCompleted) ? stored.milestonesCompleted.slice() : [];

  if (input.stage) {
    stageHistory.unshift({
      stage: input.stage,
      at: now,
      reason: input.reason ?? "manual_update",
    });
    trackEvent("lifecycle_stage_changed", { stage: input.stage, reason: input.reason ?? "manual_update" });
  }

  if (input.milestoneCompleted) {
    if (!milestones.includes(input.milestoneCompleted)) {
      milestones.push(input.milestoneCompleted);
      trackEvent("lifecycle_milestone", { milestone: input.milestoneCompleted });
      pushNotification({
        type: "lifecycle_milestone",
        title: "Milestone achieved",
        body: LIFECYCLE_MILESTONES.find((m) => m.id === input.milestoneCompleted)?.label ?? "Milestone achieved",
      });
    }
  }

  saveStoredLifecycle({
    stage: input.stage ?? stored.stage,
    stageHistory: stageHistory.slice(0, 25),
    milestonesCompleted: clampMilestones(milestones),
    updatedAt: now,
  });

  return getLifecycle();
}

export function recommendNextStep(): UserLifecycleSnapshot["nextRecommendedAction"] {
  const lifecycle = getLifecycle();
  trackEvent("lifecycle_next_step", { action: lifecycle.nextRecommendedAction.id });
  if (lifecycle.stage === "dormant") {
    pushNotification({
      type: "lifecycle_next_step",
      title: "Welcome back",
      body: lifecycle.nextRecommendedAction.description,
    });
  }
  return lifecycle.nextRecommendedAction;
}

