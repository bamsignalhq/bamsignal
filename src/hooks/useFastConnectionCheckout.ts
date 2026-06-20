import { useCallback, useState } from "react";
import type { IntentTag, UserProfile } from "../types";
import { completePendingPayment, startQuickiePassPayment } from "../services/payments";
import {
  applyQuickieIntentAfterPayment,
  handleQuickieIntentTap
} from "../utils/fastConnectionIntent";
import { clearPendingQuickieIntent, markPendingQuickieIntent, QUICKIE_INTENT } from "../utils/quickie";
import { getDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "../utils/storage";

type UseFastConnectionCheckoutOptions = {
  user: UserProfile;
  returnPath: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (message: string) => void;
};

export function useFastConnectionCheckout({
  user,
  returnPath,
  onPaymentSuccess,
  onPaymentError
}: UseFastConnectionCheckoutOptions) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleIntentTap = useCallback(
    (
      intent: IntentTag,
      currentIntents: IntentTag[],
      applyIntents: (next: IntentTag[]) => void
    ): boolean => {
      if (intent !== QUICKIE_INTENT) return false;

      const action = handleQuickieIntentTap(currentIntents);
      if (action === "deselect") {
        applyIntents(currentIntents.filter((item) => item !== QUICKIE_INTENT));
        return true;
      }
      if (action === "select") {
        applyIntents([...currentIntents, QUICKIE_INTENT]);
        return true;
      }
      if (action === "blocked") return true;
      setSheetOpen(true);
      return true;
    },
    []
  );

  const closeSheet = useCallback(() => {
    if (loading) return;
    setSheetOpen(false);
  }, [loading]);

  const continueToPayment = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    markPendingQuickieIntent();

    try {
      const result = await startQuickiePassPayment(
        user,
        {},
        { returnPath, sourcePage: returnPath }
      );
      if (!result.ok) {
        clearPendingQuickieIntent();
        if (!result.cancelled) {
          onPaymentError?.(result.error || "Payment could not start.");
        }
        return;
      }

      if (result.needsVerify) {
        const verified = await completePendingPayment(user);
        if (verified.ok) {
          applyQuickieIntentAfterPayment(user, verified.quickiePassUntil);
          setSheetOpen(false);
          onPaymentSuccess?.();
          return;
        }
        if (!verified.pending) {
          clearPendingQuickieIntent();
          onPaymentError?.(verified.error || "Payment verification failed.");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [loading, onPaymentError, onPaymentSuccess, returnPath, user]);

  const refreshProfileIntents = useCallback(() => {
    const next = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, getDatingProfile()));
    writeJson(STORAGE_KEYS.datingProfile, next);
    return next.intents;
  }, []);

  return {
    sheetOpen,
    loading,
    closeSheet,
    continueToPayment,
    handleIntentTap,
    refreshProfileIntents
  };
}
