import type { Match } from "../types";

const MILESTONES = [
  { months: 12, label: "1 year" },
  { months: 6, label: "6 months" },
  { months: 3, label: "3 months" },
  { months: 1, label: "1 month" }
] as const;

export function connectionAnniversaryMessage(matchedAt: string, now = Date.now()): string | null {
  const start = new Date(matchedAt).getTime();
  if (!Number.isFinite(start)) return null;

  const elapsedMs = Math.max(0, now - start);
  const elapsedMonths = elapsedMs / (30.44 * 24 * 60 * 60 * 1000);

  for (const milestone of MILESTONES) {
    const windowDays = 3;
    const targetMs = milestone.months * 30.44 * 24 * 60 * 60 * 1000;
    const diffDays = Math.abs(elapsedMs - targetMs) / (24 * 60 * 60 * 1000);
    if (diffDays <= windowDays && elapsedMonths >= milestone.months * 0.9) {
      return `You've been connected for ${milestone.label} ❤️`;
    }
  }
  return null;
}

export function matchAnniversaryBanner(match: Match): string | null {
  return connectionAnniversaryMessage(match.matchedAt);
}
