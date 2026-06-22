import { SUPPORTING_FAMILIES_LABEL } from "../../constants/bamSignalFoundation";
import type { FoundationProgramViewModel } from "../../utils/bamSignalFoundationLogic";

type WidowsSupportCardProps = {
  program: FoundationProgramViewModel;
};

export function WidowsSupportCard({ program }: WidowsSupportCardProps) {
  return (
    <article className="bf-program-card bf-program-card--widows foundation-glass">
      <header className="bf-program-card__head">
        <h3>{program.title}</h3>
        <span className="bf-program-card__badge">Compassion</span>
      </header>

      <p className="bf-program-card__labels">{SUPPORTING_FAMILIES_LABEL}</p>
      <p className="bf-program-card__description">{program.description}</p>
      <p className="bf-program-card__status">{program.statusLabel}</p>
    </article>
  );
}
