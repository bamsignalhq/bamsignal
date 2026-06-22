import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  MEMBERSHIP_TIER_LABEL
} from "../../../constants/houseMembership";
import type { MembershipTierCardViewModel } from "../../../utils/houseMembershipLogic";

type MembershipTierCardProps = {
  tier: MembershipTierCardViewModel;
};

export function MembershipTierCard({ tier }: MembershipTierCardProps) {
  return (
    <article className="hmem-tier-card institute-glass">
      <header className="hmem-tier-card__head">
        <h3>{tier.title}</h3>
        <span className="hmem-tier-card__badge">{MEMBERSHIP_TIER_LABEL}</span>
      </header>
      <p className="hmem-tier-card__order">Level {tier.tierOrder}</p>
      <p className="hmem-tier-card__description">{tier.description}</p>
      <p className="hmem-tier-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hmem-tier-card__status">{tier.statusLabel}</p>
    </article>
  );
}
