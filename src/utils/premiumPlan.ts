import type { PremiumPlan } from "../constants/plans";

/** Recommended default when user taps a generic Upgrade CTA. */
export function defaultPremiumPlan(plans: PremiumPlan[]): PremiumPlan | undefined {
  return plans.find((plan) => plan.id === "monthly") ?? plans[0];
}
