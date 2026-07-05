import { useCallback, useState } from "react";
import type { IntentTag, UserProfile } from "../types";
import {
  applyQuickieIntentAfterPayment,
  handleQuickieIntentTap
} from "../utils/fastConnectionIntent";
import { clearPendingQuickieIntent, markPendingQuickieIntent, QUICKIE_INTENT } from "../utils/quickie";
import { getDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "../utils/storage";
import { startBayGoldFunding } from "../services/walletPurchaseFlow";

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
  const [walletOpen, setWalletOpen] = useState(false);
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

  const continueToPayment = useCallback(() => {
    markPendingQuickieIntent();
    setSheetOpen(false);
    setWalletOpen(true);
  }, []);

  const closeWallet = useCallback(() => {
    if (loading) return;
    setWalletOpen(false);
    clearPendingQuickieIntent();
  }, [loading]);

  const onWalletCompleted = useCallback(() => {
    applyQuickieIntentAfterPayment(user);
    clearPendingQuickieIntent();
    setWalletOpen(false);
    onPaymentSuccess?.();
  }, [onPaymentSuccess, user]);

  const onBuyBayGold = useCallback(
    async (ctx: { resumeToken?: string; shortfallBayGold?: number }) => {
      setWalletOpen(false);
      setLoading(true);
      try {
        const result = await startBayGoldFunding({
          resumeToken: ctx.resumeToken,
          shortfallBayGold: ctx.shortfallBayGold,
          returnPath
        });
        if (!result.ok && !result.cancelled) {
          onPaymentError?.(result.error || "BayGold funding could not start.");
        }
      } finally {
        setLoading(false);
      }
    },
    [onPaymentError, returnPath]
  );

  const refreshProfileIntents = useCallback(() => {
    const next = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, getDatingProfile()));
    writeJson(STORAGE_KEYS.datingProfile, next);
    return next.intents;
  }, []);

  return {
    sheetOpen,
    walletOpen,
    loading,
    closeSheet,
    closeWallet,
    continueToPayment,
    onWalletCompleted,
    onBuyBayGold,
    handleIntentTap,
    refreshProfileIntents
  };
}
