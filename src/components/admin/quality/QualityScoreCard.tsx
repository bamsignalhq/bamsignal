import { QUALITY_APPEND_ONLY_RULES } from "../../../constants/consultantQuality";
import type { QualityMetric } from "../../../types/consultantQuality";

type QualityScoreCardProps = {
  metrics: QualityMetric[];
  overallScore: number | null;
};

export function QualityScoreCard({ metrics, overallScore }: QualityScoreCardProps) {
  return (
    <section className="quality-score-card concierge-consultant-card--glass cc-reveal">
      <header className="quality-score-card__head">
        <h3>Quality scores</h3>
        {overallScore !== null ? (
          <p className="quality-score-card__overall">Portfolio average: {overallScore}%</p>
        ) : null}
      </header>

      <div className="quality-score-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="quality-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <footer className="quality-score-card__rules">
        <h4>Rules</h4>
        <ul>
          {QUALITY_APPEND_ONLY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
