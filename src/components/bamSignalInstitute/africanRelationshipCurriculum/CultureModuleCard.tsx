import {
  CULTURE_MODULE_LABEL,
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/africanRelationshipCurriculum";
import type { CultureModuleViewModel } from "../../../utils/africanRelationshipCurriculumLogic";

type CultureModuleCardProps = {
  module: CultureModuleViewModel;
};

export function CultureModuleCard({ module }: CultureModuleCardProps) {
  return (
    <article className="arcur-culture-module institute-glass">
      <header className="arcur-culture-module__head">
        <h3>{module.title}</h3>
        <span className="arcur-culture-module__badge">{CULTURE_MODULE_LABEL}</span>
      </header>

      <p className="arcur-culture-module__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="arcur-culture-module__description">{module.description}</p>
      <p className="arcur-culture-module__status">{module.statusLabel}</p>
    </article>
  );
}
