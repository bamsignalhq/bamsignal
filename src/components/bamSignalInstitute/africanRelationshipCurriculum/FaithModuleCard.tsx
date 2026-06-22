import {
  FAITH_MODULE_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/africanRelationshipCurriculum";
import type { FaithModuleViewModel } from "../../../utils/africanRelationshipCurriculumLogic";

type FaithModuleCardProps = {
  module: FaithModuleViewModel;
};

export function FaithModuleCard({ module }: FaithModuleCardProps) {
  return (
    <article className="arcur-faith-module institute-glass">
      <header className="arcur-faith-module__head">
        <h3>{module.title}</h3>
        <span className="arcur-faith-module__badge">{FAITH_MODULE_LABEL}</span>
      </header>

      <p className="arcur-faith-module__labels">
        {LEARNING_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="arcur-faith-module__description">{module.description}</p>
      <p className="arcur-faith-module__status">{module.statusLabel}</p>
    </article>
  );
}
