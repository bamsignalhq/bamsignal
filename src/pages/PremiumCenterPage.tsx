import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BRAND, MONETIZATION_COPY } from "../constants/copy";
import {
  PREMIUM_EXPERIENCE_MISSION,
  PREMIUM_FEATURE_AUDIT,
  PREMIUM_VALUE_VS_PRICE,
} from "../constants/premiumExperience";
import type { PlanId, PremiumPlan } from "../constants/plans";
import { plansForSale } from "../constants/plans";
import {
  PremiumMembershipHead,
  PremiumPlanButtonList
} from "../components/premium/PremiumMembershipShell";
import { MemberLoadingState } from "../components/member";
import { PremiumPurchaseHistory } from "../components/premium/PremiumPurchaseHistory";
import { CommercialDashboardSummary } from "../components/commercial/CommercialDashboardSummary";
import {
  listLocalConversationUnlocks,
  type ConversationUnlockRecord
} from "../constants/conversationUnlock";
import { getSignalPassSnapshot } from "../services/premiumStatus";
import { refreshMemberBoostEntitlements } from "../services/boostEntitlements";
import { listPremiumPurchaseHistory } from "../utils/premiumPurchaseHistory";
import {
  premiumRenewalMessage,
  remainingPremiumTimeLabel,
  resolvePremiumRenewalStage,
} from "../utils/premiumRenewal";
import { getPremiumUsageSnapshot } from "../utils/premiumUsage";
import { formatEntitlementUntil } from "../utils/memberEntitlements";
import { getBoostPerformanceSnapshot } from "../utils/boostPerformance";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson } from "../utils/storage";
import type { UserProfile } from "../types";

type PremiumCenterPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onBack: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
  loading?: boolean;
  onOpenDiscreet?: () => void;
};

const FEATURED_PLAN_ORDER: PlanId[] = ["monthly", "weekly"];

export function PremiumCenterPage({
  isPremium,
  plans,
  onBack,
  onSelectPlan,
  loading,
  onOpenDiscreet,
}: PremiumCenterPageProps) {
  const pass = getSignalPassSnapshot();
  const usage = useMemo(() => getPremiumUsageSnapshot(), [isPremium]);
  const history = useMemo(() => listPremiumPurchaseHistory(), [isPremium]);
  const [unlocks, setUnlocks] = useState<ConversationUnlockRecord[]>(() =>
    listLocalConversationUnlocks()
  );
  const member = useMemo(
    () => readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" }),
    [isPremium]
  );
  const boostPerf = useMemo(() => getBoostPerformanceSnapshot(member), [isPremium, member, unlocks]);
  const renewalStage = resolvePremiumRenewalStage(pass.expiresAt);
  const renewalCopy = premiumRenewalMessage(renewalStage);

  useEffect(() => {
    let cancelled = false;
    void refreshMemberBoostEntitlements(member).then(() => {
      if (!cancelled) setUnlocks(listLocalConversationUnlocks());
    });
    return () => {
      cancelled = true;
    };
  }, [member.email, member.phone, isPremium]);

  const orderedPlans = useMemo(() => {
    const salePlans = plansForSale(plans);
    const byId = new Map(salePlans.map((plan) => [plan.id, plan]));
    return FEATURED_PLAN_ORDER.map((id) => byId.get(id)).filter(
      (plan): plan is PremiumPlan => Boolean(plan),
    );
  }, [plans]);

  return (
    <div className="page premium-page premium-page--fintech premium-center">
      <PremiumMembershipHead onBack={onBack} subtitle={PREMIUM_EXPERIENCE_MISSION} />

      {isPremium ? (
        <section className="premium-center__status card">
          <p className="premium-center__eyebrow">Current plan · Discover Membership</p>
          <p className="premium-center__remaining">
            {remainingPremiumTimeLabel(pass.expiresAt)}
          </p>
          {pass.expiresAt ? (
            <p className="premium-center__muted">
              Expires {formatEntitlementUntil(pass.expiresAt)}
            </p>
          ) : null}
          {renewalCopy ? <p className="premium-center__renewal">{renewalCopy}</p> : null}
        </section>
      ) : (
        <section className="premium-center__status card">
          <p className="premium-center__eyebrow">Current plan · Free</p>
          <p className="premium-center__muted">5 Signals every day · {BRAND.paywallBody}</p>
        </section>
      )}

      <section className="premium-center__section card" aria-labelledby="premium-boost-status-title">
        <h2 id="premium-boost-status-title" className="premium-center__section-title">
          Boost status & performance
        </h2>
        {boostPerf.active ? (
          <div className="premium-center__usage-grid">
            <div>
              <p className="premium-center__muted">Boost</p>
              <p className="premium-center__stat">{boostPerf.productLabel}</p>
              <p className="premium-center__muted">{boostPerf.remainingLabel}</p>
            </div>
            <div>
              <p className="premium-center__muted">Profile views during boost</p>
              <p className="premium-center__stat">{boostPerf.profileViewsDuringBoost}</p>
            </div>
            <div>
              <p className="premium-center__muted">Signals received during boost</p>
              <p className="premium-center__stat">{boostPerf.signalsReceivedDuringBoost}</p>
            </div>
            <div>
              <p className="premium-center__muted">Discover impressions tracked</p>
              <p className="premium-center__stat">{boostPerf.impressionsDuringBoost}</p>
            </div>
          </div>
        ) : (
          <p className="premium-center__muted">
            No active Profile Boost. Ranking boosts last 24 hours and do not grant membership.
          </p>
        )}
      </section>

      <section className="premium-center__section card" aria-labelledby="premium-unlocks-title">
        <h2 id="premium-unlocks-title" className="premium-center__section-title">
          Unlocked conversations
        </h2>
        <p className="premium-center__muted">
          Each ₦500 Conversation Unlock applies to one specific profile permanently. It never grants
          Discover Membership and does not change daily Signal limits.
        </p>
        {unlocks.length ? (
          <ul className="premium-center__history-list">
            {unlocks.map((entry) => (
              <li key={entry.targetProfileId} className="premium-center__history-item">
                <div>
                  <strong>{entry.targetName || "Unlocked conversation"}</strong>
                  <p className="premium-center__muted">
                    Permanent · one profile · {formatEntitlementUntil(entry.purchasedAt)}
                  </p>
                </div>
                <span className="premium-center__status premium-center__status--active">Active</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="premium-center__empty">
            Unlocked conversations appear here after you pay ₦500 to message one specific profile.
          </p>
        )}
      </section>

      <section className="premium-center__section card" aria-labelledby="premium-benefits-title">
        <h2 id="premium-benefits-title" className="premium-center__section-title">
          Benefits
        </h2>
        <ul className="premium-center__benefits">
          {PREMIUM_FEATURE_AUDIT.map((feature) => (
            <li key={feature.id}>
              <Check size={16} aria-hidden />
              <div>
                <strong>{feature.label}</strong>
                <p className="premium-center__muted">{feature.summary}</p>
                <p className="premium-center__value">{feature.valueNote}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {isPremium ? (
        <section className="premium-center__section card" aria-labelledby="premium-usage-title">
          <h2 id="premium-usage-title" className="premium-center__section-title">
            Usage
          </h2>
          <div className="premium-center__usage-grid">
            <div>
              <p className="premium-center__muted">Signals today</p>
              <p className="premium-center__stat">
                {usage.signalsUsedToday} · {usage.signalsLimitLabel}
              </p>
            </div>
            <div>
              <p className="premium-center__muted">Messages today</p>
              <p className="premium-center__stat">
                {usage.messagesUsedToday} · {usage.messagesLimitLabel}
              </p>
            </div>
            <div>
              <p className="premium-center__muted">Profile views</p>
              <p className="premium-center__stat">
                {usage.profileViewsTotal} total · {usage.profileViewsToday} today
              </p>
            </div>
            <div>
              <p className="premium-center__muted">Advanced filters</p>
              <p className="premium-center__stat">{usage.advancedFilterCount} active</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="premium-center__section card" aria-labelledby="premium-renewal-title">
        <h2 id="premium-renewal-title" className="premium-center__section-title">
          {isPremium ? "Renewal" : "Choose a plan"}
        </h2>
        {!isPremium ? (
          <p className="premium-center__muted">
            Weekly ₦999 · Monthly ₦2,999 — unlimited Signals, messaging, and Discover Membership benefits.
          </p>
        ) : null}
        <PremiumPlanButtonList
          plans={orderedPlans}
          onSelectPlan={onSelectPlan}
          loading={loading}
          planHint={(plan) => PREMIUM_VALUE_VS_PRICE[plan.id]?.headline}
        />
        {loading ? (
          <MemberLoadingState label={MONETIZATION_COPY.checkoutLoading} compact />
        ) : null}
      </section>

      <section className="premium-center__section card" aria-labelledby="premium-history-title">
        <h2 id="premium-history-title" className="premium-center__section-title">
          Discover Membership history
        </h2>
        <PremiumPurchaseHistory purchases={history} />
      </section>

      <CommercialDashboardSummary isPremium={isPremium} onOpenDiscreet={onOpenDiscreet} />
    </div>
  );
}
