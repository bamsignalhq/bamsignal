import type { AcademyMetric } from "../../../types/consultantAcademy";

type LearningProgressCardProps = {
  metrics: AcademyMetric[];
  consultantCount: number;
};

export function LearningProgressCard({ metrics, consultantCount }: LearningProgressCardProps) {
  return (
    <section className="learning-progress-card concierge-consultant-card--glass cc-reveal">
      <header className="learning-progress-card__head">
        <h3>Learning progress</h3>
        <p>{consultantCount} consultants enrolled across all tracks.</p>
      </header>

      <div className="learning-progress-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="academy-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
