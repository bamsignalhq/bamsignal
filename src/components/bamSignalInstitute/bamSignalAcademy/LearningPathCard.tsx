import {
  BUILDING_STRONG_FAMILIES_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL
} from "../../../constants/bamSignalAcademy";
import type { LearningPathViewModel } from "../../../utils/bamSignalAcademyLogic";

type LearningPathCardProps = {
  path: LearningPathViewModel;
};

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <article className="bsa-path-card institute-glass">
      <header className="bsa-path-card__head">
        <h3>{path.title}</h3>
        <span className="bsa-path-card__badge">{GROWING_TOGETHER_LABEL}</span>
      </header>

      <p className="bsa-path-card__labels">
        {LEARNING_LABEL} · {BUILDING_STRONG_FAMILIES_LABEL}
      </p>
      <p className="bsa-path-card__description">{path.description}</p>
      <ul className="bsa-path-card__programs">
        {path.programLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      <p className="bsa-path-card__status">{path.statusLabel}</p>
    </article>
  );
}
