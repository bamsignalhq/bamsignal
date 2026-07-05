import { PREMIUM_GRACE_DAYS } from "../constants/premiumExperience";

export type PremiumRenewalStage =
  | "active"
  | "seven_days"
  | "three_days"
  | "one_day"
  | "expiry"
  | "grace"
  | "lapsed"
  | "none";

const MS_DAY = 86400000;

export function resolvePremiumRenewalStage(expiresAt: string | null): PremiumRenewalStage {
  if (!expiresAt) return "none";
  const untilMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(untilMs)) return "none";

  const msLeft = untilMs - Date.now();
  if (msLeft > 7 * MS_DAY) return "active";
  if (msLeft > 3 * MS_DAY) return "seven_days";
  if (msLeft > 1 * MS_DAY) return "three_days";
  if (msLeft > 0) return "one_day";
  if (msLeft > -MS_DAY) return "expiry";

  const daysPast = Math.ceil((Date.now() - untilMs) / MS_DAY);
  if (daysPast <= PREMIUM_GRACE_DAYS) return "grace";
  return "lapsed";
}

export function premiumRenewalMessage(stage: PremiumRenewalStage): string | null {
  switch (stage) {
    case "seven_days":
      return "Signal Pass renews in 7 days — keep unlimited Signals and priority visibility.";
    case "three_days":
      return "Signal Pass ends in 3 days. Renew to avoid losing Premium benefits.";
    case "one_day":
      return "Signal Pass ends tomorrow. Renew now to stay uninterrupted.";
    case "expiry":
      return "Signal Pass ends today. Renew to keep your Premium benefits.";
    case "grace":
      return `Grace period — renew within ${PREMIUM_GRACE_DAYS} days to restore full Premium access.`;
    case "lapsed":
      return "Signal Pass expired. Renew to unlock unlimited Signals again.";
    default:
      return null;
  }
}

export function remainingPremiumTimeLabel(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  const untilMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(untilMs)) return "—";

  const msLeft = untilMs - Date.now();
  if (msLeft <= 0) {
    const stage = resolvePremiumRenewalStage(expiresAt);
    if (stage === "grace") return "Grace period";
    if (stage === "lapsed") return "Expired";
    return "Ends today";
  }

  const days = Math.ceil(msLeft / MS_DAY);
  if (days === 1) return "1 day left";
  if (days < 30) return `${days} days left`;

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(untilMs));
  } catch {
    return expiresAt;
  }
}

export function shouldPromptPremiumRenewal(stage: PremiumRenewalStage): boolean {
  return (
    stage === "seven_days" ||
    stage === "three_days" ||
    stage === "one_day" ||
    stage === "expiry" ||
    stage === "grace" ||
    stage === "lapsed"
  );
}
