import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "../types";
import { completePendingPayment, startFastConnectionRenewalPayment } from "../services/payments";
import { fetchFastConnectionSignalStatus } from "../services/fastConnectionPool";
import { applyQuickieIntentAfterPayment } from "../utils/fastConnectionIntent";
import {
  expiryBannerCopy,
  shouldShowFastConnectionExpiryBanner
} from "../utils/fastConnectionLifecycle";
import { isFastConnectionInterested } from "../utils/fastConnectionState";
import { useMemberProfileListener } from "./useMemberProfileListener";

type UseFastConnectionExpiryReminderOptions = {
  user: UserProfile;
  enabled?: boolean;
  onRenewNavigate: () => void;
};

export function useFastConnectionExpiryReminder({
  user,
  enabled = true,
  onRenewNavigate
}: UseFastConnectionExpiryReminderOptions) {
  const { profile } = useMemberProfileListener();
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !isFastConnectionInterested(profile)) return;

    void (async () => {
      const status = await fetchFastConnectionSignalStatus(user);
      if (!status.passActive || !status.expiryReminder) return;
      if (!shouldShowFastConnectionExpiryBanner(status.expiryReminder)) return;
      setBannerMessage(expiryBannerCopy(status.expiryReminder));
    })();
  }, [enabled, profile, user]);

  const dismissBanner = useCallback(() => setBannerMessage(null), []);

  const renew = useCallback(async () => {
    if (renewLoading) return;
    setRenewLoading(true);
    try {
      const result = await startFastConnectionRenewalPayment(user);
      if (!result.ok) return;
      if (result.needsVerify) {
        const verified = await completePendingPayment(user);
        if (verified.ok) {
          applyQuickieIntentAfterPayment(user, verified.quickiePassUntil);
          setBannerMessage(null);
          onRenewNavigate();
        }
      }
    } finally {
      setRenewLoading(false);
    }
  }, [onRenewNavigate, renewLoading, user]);

  return {
    bannerMessage,
    renewLoading,
    dismissBanner,
    renew
  };
}
