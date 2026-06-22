import {
  BUILDING_STRONG_COMMUNITIES_LABEL,
  FOUNDATION_IMPACT_PILLARS,
  GIVING_BACK_LABEL,
  IMPACT_LABEL,
  SUPPORTING_FAMILIES_LABEL
} from "../../constants/bamSignalFoundation";
import type { FoundationImpactPillarId } from "../../constants/bamSignalFoundation";

type FoundationImpactCardProps = {
  pillarId?: FoundationImpactPillarId;
};

export function FoundationImpactCard({ pillarId }: FoundationImpactCardProps) {
  const pillars = pillarId
    ? FOUNDATION_IMPACT_PILLARS.filter((pillar) => pillar.id === pillarId)
    : FOUNDATION_IMPACT_PILLARS;

  return (
    <section className="bf-impact-card foundation-glass">
      <header className="bf-impact-card__head">
        <h3>{IMPACT_LABEL}</h3>
        <p>
          {GIVING_BACK_LABEL} · {SUPPORTING_FAMILIES_LABEL} · {BUILDING_STRONG_COMMUNITIES_LABEL}
        </p>
      </header>

      <ul className="bf-impact-card__list">
        {pillars.map((pillar) => (
          <li key={pillar.id}>
            <strong>{pillar.label}</strong>
            <span>{pillar.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
