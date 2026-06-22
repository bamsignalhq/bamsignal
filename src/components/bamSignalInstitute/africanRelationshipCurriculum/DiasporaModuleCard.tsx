import {
  DIASPORA_MODULE_LABEL,
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/africanRelationshipCurriculum";
import type { DiasporaModuleViewModel } from "../../../utils/africanRelationshipCurriculumLogic";

type DiasporaModuleCardProps = {
  module: DiasporaModuleViewModel;
};

export function DiasporaModuleCard({ module }: DiasporaModuleCardProps) {
  return (
    <article className="arcur-diaspora-module institute-glass">
      <header className="arcur-diaspora-module__head">
        <h3>{module.title}</h3>
        <span className="arcur-diaspora-module__badge">{DIASPORA_MODULE_LABEL}</span>
      </header>

      <p className="arcur-diaspora-module__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="arcur-diaspora-module__description">{module.description}</p>
      <p className="arcur-diaspora-module__status">{module.statusLabel}</p>
    </article>
  );
}
