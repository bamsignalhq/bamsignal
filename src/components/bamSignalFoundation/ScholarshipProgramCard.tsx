import { GIVING_BACK_LABEL, IMPACT_LABEL } from "../../constants/bamSignalFoundation";
import type { FoundationProgramViewModel } from "../../utils/bamSignalFoundationLogic";

type ScholarshipProgramCardProps = {
  program: FoundationProgramViewModel;
};

export function ScholarshipProgramCard({ program }: ScholarshipProgramCardProps) {
  return (
    <article className="bf-program-card bf-program-card--scholarship foundation-glass">
      <header className="bf-program-card__head">
        <h3>{program.title}</h3>
        <span className="bf-program-card__badge">{IMPACT_LABEL}</span>
      </header>

      <p className="bf-program-card__labels">{GIVING_BACK_LABEL} · Scholarships</p>
      <p className="bf-program-card__description">{program.description}</p>
      <p className="bf-program-card__status">{program.statusLabel}</p>
    </article>
  );
}
