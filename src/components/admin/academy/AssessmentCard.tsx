import { ACADEMY_MODULE_LABELS } from "../../../constants/consultantAcademy";
import type { AcademyAssessmentRecord } from "../../../types/consultantAcademy";

type AssessmentCardProps = {
  assessments: AcademyAssessmentRecord[];
};

export function AssessmentCard({ assessments }: AssessmentCardProps) {
  return (
    <section className="assessment-card concierge-consultant-card--glass cc-reveal">
      <header className="assessment-card__head">
        <h3>Assessments</h3>
        <p>Module assessment scores and pass status.</p>
      </header>

      {assessments.length ? (
        <ul className="assessment-card__list">
          {assessments.map((assessment) => (
            <li key={assessment.id}>
              <strong>{ACADEMY_MODULE_LABELS[assessment.moduleId]}</strong>
              <span className={assessment.passed ? "assessment-card__pass" : "assessment-card__fail"}>
                {assessment.score}% — {assessment.passed ? "Passed" : "Failed"}
              </span>
              <span>{new Date(assessment.takenAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="assessment-card__empty">No assessments completed yet.</p>
      )}
    </section>
  );
}
