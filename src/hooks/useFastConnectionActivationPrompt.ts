import { useCallback, useEffect, useRef, useState } from "react";
import type { UserProfile } from "../types";
import { completePendingPayment, startFastConnectionActivationPayment } from "../services/payments";
import { applyQuickieIntentAfterPayment } from "../utils/fastConnectionIntent";
import {
  shouldShowFastConnectionActivationPrompt,
  snoozeFastConnectionActivation
} from "../utils/fastConnectionState";
import { useMemberProfileListener } from "./useMemberProfileListener";

type UseFastConnectionActivationPromptOptions = {
  user: UserProfile;
  enabled?: boolean;
  onPaymentError?: (message: string) => void;
};

export function useFastConnectionActivationPrompt({
  user,
  enabled = true,
  onPaymentError
}: UseFastConnectionActivationPromptOptions) {
  const { profile } = useMemberProfileListener();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (!enabled || shownRef.current) return;
    if (!shouldShowFastConnectionActivationPrompt(profile)) return;
    shownRef.current = true;
    setOpen(true);
  }, [enabled, profile]);

  const dismiss = useCallback(() => {
    if (loading) return;
    setOpen(false);
  }, [loading]);

  const snooze = useCallback(() => {
    if (loading) return;
    snoozeFastConnectionActivation();
    setOpen(false);
  }, [loading]);

  const activate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await startFastConnectionActivationPayment(user);
      if (!result.ok) {
        if (!result.cancelled) {
          onPaymentError?.(result.error || "Payment could not start.");
        }
        return;
      }

      if (result.needsVerify) {
        const verified = await completePendingPayment(user);
        if (verified.ok) {
          applyQuickieIntentAfterPayment(user, verified.quickiePassUntil);
          setOpen(false);
          return;
        }
        if (!verified.pending) {
          onPaymentError?.(verified.error || "Fast Connection was not activated.");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [loading, onPaymentError, user]);

  return {
    open,
    loading,
    dismiss,
    snooze,
    activate
  };
}
