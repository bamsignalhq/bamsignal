import { STEWARDSHIP_LABEL } from "../../../constants/governanceFramework";
import type { GovernancePillarCardViewModel } from "../../../types/governanceFramework";

type GovernancePillarCardProps = {
  pillar: GovernancePillarCardViewModel;
};

export function GovernancePillarCard({ pillar }: GovernancePillarCardProps) {
  return (
    <article className="govf-pillar-card institute-glass">
      <header className="govf-pillar-card__head">
        <h3>{pillar.title}</h3>
        <span className="govf-pillar-card__badge">{STEWARDSHIP_LABEL}</span>
      </header>
      <p className="govf-pillar-card__order">Pillar {pillar.pillarOrder}</p>
      <p className="govf-pillar-card__description">{pillar.description}</p>
      <p className="govf-pillar-card__status">{pillar.statusLabel}</p>
    </article>
  );
}
