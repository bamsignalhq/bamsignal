import type { ProfileMilestoneUnlock } from "../constants/firstTimeUser";

export type ProfileCompletionMilestone = {
  percent: 20 | 40 | 60 | 80 | 100;
  label: string;
  unlocks: ProfileMilestoneUnlock[];
  example: string;
  reached: boolean;
};

export const PROFILE_COMPLETION_MILESTONES: Omit<ProfileCompletionMilestone, "reached">[] = [
  {
    percent: 20,
    label: "Getting started",
    unlocks: ["trust_score"],
    example: "Main photo + city"
  },
  {
    percent: 40,
    label: "Visible",
    unlocks: ["visibility"],
    example: "Bio + intent"
  },
  {
    percent: 60,
    label: "Recommendable",
    unlocks: ["recommendations"],
    example: "Interests + lifestyle"
  },
  {
    percent: 80,
    label: "Trusted path",
    unlocks: ["trust_score", "visibility"],
    example: "Voice or verification"
  },
  {
    percent: 100,
    label: "Complete",
    unlocks: ["trust_score", "visibility", "recommendations", "rewards"],
    example: "Welcome BayGold eligible"
  }
];

const UNLOCK_LABELS: Record<ProfileMilestoneUnlock, string> = {
  trust_score: "Trust Score",
  visibility: "Visibility",
  recommendations: "Recommendations",
  rewards: "Rewards"
};

export function formatUnlockLabels(unlocks: ProfileMilestoneUnlock[]): string {
  return unlocks.map((id) => UNLOCK_LABELS[id]).join(" · ");
}

export function resolveProfileMilestones(score: number): ProfileCompletionMilestone[] {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return PROFILE_COMPLETION_MILESTONES.map((m) => ({
    ...m,
    reached: clamped >= m.percent
  }));
}

export function nextProfileMilestone(score: number): ProfileCompletionMilestone | null {
  return resolveProfileMilestones(score).find((m) => !m.reached) ?? null;
}
