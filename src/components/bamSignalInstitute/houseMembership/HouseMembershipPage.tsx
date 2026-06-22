import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  HOUSE_MEMBERSHIP_LABEL,
  HOUSE_MEMBERSHIP_PURPOSE_COPY,
  HOUSE_MEMBERSHIP_RESERVED_COPY,
  HOUSE_MEMBERSHIP_SUBCOPY,
  HOUSE_MEMBERSHIP_TITLE,
  LEARNING_LABEL,
  PREPARED_MEMBERSHIP_LEVELS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseMembership";
import { getHouseMembershipBundle } from "../../../utils/HouseMembershipEngine";
import { HousePrivilegesCard } from "./HousePrivilegesCard";
import { MembershipTierCard } from "./MembershipTierCard";

export function HouseMembershipPage() {
  const bundle = useMemo(() => getHouseMembershipBundle(), []);

  return (
    <div className="hmem-page">
      <header className="hmem-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_MEMBERSHIP_LABEL}</p>
        <h1>{HOUSE_MEMBERSHIP_TITLE}</h1>
        <p>{HOUSE_MEMBERSHIP_SUBCOPY}</p>
        <p className="hmem-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hmem-page__purpose">{HOUSE_MEMBERSHIP_PURPOSE_COPY}</p>
      </header>

      <section className="hmem-page__prepared institute-glass">
        <h2>Levels</h2>
        <p>{bundle.levelCount} membership levels — architecture preview, not enrollment yet.</p>
        <ul className="hmem-page__prepared-list">
          {PREPARED_MEMBERSHIP_LEVELS.map((level) => (
            <li key={level.id}>
              <strong>{level.title}</strong>
              <span>{level.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hmem-page__section">
        <header className="bi-section-head">
          <h2>Membership tiers</h2>
          <p>Community through Founders Circle — prepared, not enabled yet.</p>
        </header>
        <div className="hmem-page__grid">
          {bundle.membershipTiers.map((tier) => (
            <MembershipTierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </section>

      <section className="hmem-page__section">
        <header className="bi-section-head">
          <h2>House privileges</h2>
          <p>Privileges per level — architecture reserved, not billing yet.</p>
        </header>
        <div className="hmem-page__grid">
          {bundle.housePrivileges.map((privileges) => (
            <HousePrivilegesCard key={privileges.id} privileges={privileges} />
          ))}
        </div>
      </section>

      <section className="hmem-page__reserved-note institute-glass">
        <p>{HOUSE_MEMBERSHIP_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
