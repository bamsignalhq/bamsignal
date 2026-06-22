import {
  LEGACY_FAMILIES_CHILDREN_COPY,
  LEGACY_FAMILIES_PRIVACY_COPY,
  LEGACY_FAMILY_LABEL
} from "../../../../constants/legacyFamilies";
import type { LegacyFamiliesViewModel } from "../../../../utils/legacyFamiliesLogic";

type LegacyChildrenCardProps = {
  family: LegacyFamiliesViewModel;
};

export function LegacyChildrenCard({ family }: LegacyChildrenCardProps) {
  return (
    <section className="legacy-children-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{LEGACY_FAMILY_LABEL}</h3>
        <p>{LEGACY_FAMILIES_CHILDREN_COPY}</p>
      </header>

      <p className="legacy-children-card__privacy">{LEGACY_FAMILIES_PRIVACY_COPY}</p>

      <div className="legacy-children-card__count">
        <span>Children Count</span>
        <strong>{family.childrenCount}</strong>
      </div>

      {family.currentCountry ? (
        <div className="legacy-children-card__country">
          <span>Current Country</span>
          <strong>{family.currentCountry}</strong>
        </div>
      ) : null}
    </section>
  );
}
