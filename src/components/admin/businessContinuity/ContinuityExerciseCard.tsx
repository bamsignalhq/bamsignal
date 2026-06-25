import {
  CONTINUITY_EXERCISE_STATUS_LABELS,
  RECOVERY_PLAYBOOK_DOMAIN_LABELS
} from "../../../constants/businessContinuity";
import type { ContinuityExerciseRecord } from "../../../types/businessContinuity";

type ContinuityExerciseCardProps = {
  exercises: ContinuityExerciseRecord[];
};

export function ContinuityExerciseCard({ exercises }: ContinuityExerciseCardProps) {
  return (
    <section className="continuity-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Continuity exercises</h3>
        <p>Tabletop and simulation drills to validate recovery readiness.</p>
      </header>
      <ul className="continuity-exercise-list">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="continuity-exercise">
            <div>
              <strong>{exercise.title}</strong>
              <span>{exercise.exerciseRef}</span>
            </div>
            <div className="continuity-exercise__meta">
              <span className={`continuity-pill continuity-pill--${exercise.status === "completed" ? "healthy" : "degraded"}`}>
                {CONTINUITY_EXERCISE_STATUS_LABELS[exercise.status]}
              </span>
              <span>{RECOVERY_PLAYBOOK_DOMAIN_LABELS[exercise.scenarioId]}</span>
              <span>{new Date(exercise.scheduledAt).toLocaleDateString()}</span>
            </div>
            {exercise.findings.length ? (
              <p className="continuity-exercise__findings">{exercise.findings.join(" · ")}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
