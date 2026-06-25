import {
  QUALITY_APPEND_ONLY_RULES,
  QUALITY_STANDARDS
} from "../../../constants/consultantQuality";
import type { ConsultantQualityBundle } from "../../../types/consultantQuality";

type ConsultantQualityCardProps = {
  metrics: ConsultantQualityBundle["metrics"];
  standardsCoverage: ConsultantQualityBundle["standardsCoverage"];
  overallScore: number | null;
};

export function ConsultantQualityCard({
  metrics,
  standardsCoverage,
  overallScore
}: ConsultantQualityCardProps) {
  return (
    <section className="quality-card consultant-quality-card concierge-consultant-card--glass cc-reveal">
      <header className="consultant-quality-card__head">
        <h3>Consultant quality</h3>
        <p>
          Institutional standards across {QUALITY_STANDARDS.length} excellence areas — append-only
          reviews with full audit trail.
        </p>
        {overallScore !== null ? (
          <p className="consultant-quality-card__overall">Portfolio average: {overallScore}%</p>
        ) : null}
      </header>

      <div className="consultant-quality-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="quality-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="consultant-quality-card__standards">
        <h4>Standards coverage</h4>
        <ul>
          {standardsCoverage.map((item) => (
            <li key={item.standardId}>
              <span>{item.label}</span>
              <strong>{item.averageScore === null ? "—" : `${item.averageScore}%`}</strong>
              <span className="consultant-quality-card__count">{item.reviewCount} ratings</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="consultant-quality-card__rules">
        <h4>Integrity rules</h4>
        <ul>
          {QUALITY_APPEND_ONLY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
