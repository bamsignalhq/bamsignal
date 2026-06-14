import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PremiumPlan, PremiumPlanInput } from "../constants/plans";
import { DEFAULT_PREMIUM_PLANS } from "../constants/plans";
import { fetchPremiumPlans } from "../services/plans";

type PlansContextValue = {
  plans: PremiumPlan[];
  loading: boolean;
  refreshPlans: () => Promise<void>;
};

const PlansContext = createContext<PlansContextValue>({
  plans: DEFAULT_PREMIUM_PLANS,
  loading: true,
  refreshPlans: async () => undefined
});

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<PremiumPlan[]>(DEFAULT_PREMIUM_PLANS);
  const [loading, setLoading] = useState(true);

  const refreshPlans = useCallback(async () => {
    setLoading(true);
    const next = await fetchPremiumPlans();
    setPlans(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshPlans();
  }, [refreshPlans]);

  const value = useMemo(
    () => ({ plans, loading, refreshPlans }),
    [plans, loading, refreshPlans]
  );

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>;
}

export function usePlans() {
  return useContext(PlansContext);
}

export type { PremiumPlanInput };
