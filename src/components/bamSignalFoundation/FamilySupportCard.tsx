import { BUILDING_STRONG_COMMUNITIES_LABEL, SUPPORTING_FAMILIES_LABEL } from "../../constants/bamSignalFoundation";
import type { FoundationProgramViewModel } from "../../utils/bamSignalFoundationLogic";

type FamilySupportCardProps = {
  program: FoundationProgramViewModel;
};

export function FamilySupportCard({ program }: FamilySupportCardProps) {
  return (
    <article className="bf-program-card bf-program-card--family foundation-glass">
      <header className="bf-program-card__head">
        <h3>{program.title}</h3>
        <span className="bf-program-card__badge">Family</span>
      </header>

      <p className="bf-program-card__labels">
        {SUPPORTING_FAMILIES_LABEL} · {BUILDING_STRONG_COMMUNITIES_LABEL}
      </p>
      <p className="bf-program-card__description">{program.description}</p>
      <p className="bf-program-card__status">{program.statusLabel}</p>
    </article>
  );
}
