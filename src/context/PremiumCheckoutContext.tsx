import { createContext, useContext, type ReactNode } from "react";
import type { PremiumPlan } from "../constants/plans";
import { MONETIZATION_COPY } from "../constants/copy";

export type CheckoutPhase = "idle" | "preparing" | "opening";

export type PremiumCheckoutContextValue = {
  busy: boolean;
  phase: CheckoutPhase;
  label: string;
  startPremiumCheckout: (plan?: PremiumPlan) => void;
};

const PremiumCheckoutContext = createContext<PremiumCheckoutContextValue | null>(null);

export function PremiumCheckoutProvider({
  children,
  value
}: {
  children: ReactNode;
  value: PremiumCheckoutContextValue;
}) {
  return <PremiumCheckoutContext.Provider value={value}>{children}</PremiumCheckoutContext.Provider>;
}

export function usePremiumCheckout(): PremiumCheckoutContextValue {
  const ctx = useContext(PremiumCheckoutContext);
  if (!ctx) {
    return {
      busy: false,
      phase: "idle",
      label: MONETIZATION_COPY.checkoutLoading,
      startPremiumCheckout: () => undefined
    };
  }
  return ctx;
}
