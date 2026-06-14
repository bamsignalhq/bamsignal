import { trackEvent } from "./analytics";

export type UpgradeSource =
  | "signal_limit"
  | "visitors"
  | "premium_filter"
  | "priority_signal"
  | "paywall_modal"
  | "discover_state_change"
  | "premium_page"
  | "dashboard";

export function trackUpgradeImpression(source: UpgradeSource): void {
  trackEvent("upgrade_impression", { source });
}

export function trackUpgradeClick(source: UpgradeSource): void {
  trackEvent("upgrade_click", { source });
}

export function trackUpgradePurchase(source: UpgradeSource, planId?: string): void {
  trackEvent("payment_successful", { source, plan: planId ?? "unknown" });
}
