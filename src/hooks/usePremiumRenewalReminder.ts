import { useCallback, useEffect, useState } from "react";
import { getSignalPassSnapshot } from "../services/premiumStatus";
import {
  premiumRenewalMessage,
  resolvePremiumRenewalStage,
  shouldPromptPremiumRenewal,
} from "../utils/premiumRenewal";
import { shouldShowPremiumRenewalBanner } from "../utils/premiumLifecycle";

type UsePremiumRenewalReminderOptions = {
  enabled?: boolean;
  onRenew: () => void;
};

export function usePremiumRenewalReminder({
  enabled = true,
  onRenew,
}: UsePremiumRenewalReminderOptions) {
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const pass = getSignalPassSnapshot();
    if (!pass.expiresAt && pass.source !== "subscription") return;

    const stage = resolvePremiumRenewalStage(pass.expiresAt);
    if (!shouldPromptPremiumRenewal(stage)) return;
    if (!shouldShowPremiumRenewalBanner(stage)) return;

    setBannerMessage(premiumRenewalMessage(stage));
  }, [enabled]);

  const dismissBanner = useCallback(() => setBannerMessage(null), []);

  const renew = useCallback(() => {
    if (renewLoading) return;
    setRenewLoading(true);
    try {
      onRenew();
      setBannerMessage(null);
    } finally {
      setRenewLoading(false);
    }
  }, [onRenew, renewLoading]);

  return {
    bannerMessage,
    renewLoading,
    dismissBanner,
    renew,
  };
}
