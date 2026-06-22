import { ACADEMY_MODULE_LABELS } from "../../../constants/consultantAcademy";
import type { AcademyModuleProgress } from "../../../types/consultantAcademy";

type TrainingModuleCardProps = {
  progress: AcademyModuleProgress;
};

export function TrainingModuleCard({ progress }: TrainingModuleCardProps) {
  return (
    <article className={`training-module-card training-module-card--${progress.status}`}>
      <div className="training-module-card__head">
        <h4>{ACADEMY_MODULE_LABELS[progress.moduleId]}</h4>
        <span className="training-module-card__status">{progress.status.replace("-", " ")}</span>
      </div>
      <dl className="training-module-card__meta">
        <div>
          <dt>Hours</dt>
          <dd>{progress.hoursSpent}h</dd>
        </div>
        {progress.completedAt ? (
          <div>
            <dt>Completed</dt>
            <dd>{new Date(progress.completedAt).toLocaleDateString()}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
