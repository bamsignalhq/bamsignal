import {
  GIVING_BACK_LABEL,
  LEGACY_ENDOWMENT_FORBIDDEN_COPY,
  ENDOWMENT_PROGRAM_LABEL,
  STRENGTHENING_FAMILIES_LABEL
} from "../../../constants/legacyEndowment";
import type { EndowmentProgramViewModel } from "../../../utils/legacyEndowmentLogic";

type EndowmentProgramCardProps = {
  program: EndowmentProgramViewModel;
};

export function EndowmentProgramCard({ program }: EndowmentProgramCardProps) {
  return (
    <article className="lgnd-program-card institute-glass">
      <header className="lgnd-program-card__head">
        <h3>{program.title}</h3>
        <span className="lgnd-program-card__badge">{ENDOWMENT_PROGRAM_LABEL}</span>
      </header>
      <p className="lgnd-program-card__labels">
        {GIVING_BACK_LABEL} · {STRENGTHENING_FAMILIES_LABEL}
      </p>
      <p className="lgnd-program-card__description">{program.description}</p>
      <p className="lgnd-program-card__forbidden">
        Not {LEGACY_ENDOWMENT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lgnd-program-card__status">{program.statusLabel}</p>
    </article>
  );
}
