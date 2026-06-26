import type { PerformanceCertificationRegression } from "../../../types/performanceCertification";

type PerformanceRegressionListProps = {
  regressions: PerformanceCertificationRegression[];
};

export function PerformanceRegressionList({ regressions }: PerformanceRegressionListProps) {
  return (
    <section className="institutional-card performance-regression-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Regression list</h3>
        <p>Metrics that worsened vs previous release.</p>
      </header>
      {regressions.length === 0 ? (
        <p className="institutional-card__empty">No regressions detected.</p>
      ) : (
        <ul className="institutional-card__list">
          {regressions.map((item) => (
            <li key={item.id}>
              <div className="institutional-card__row">
                <strong>{item.title}</strong>
                <span className={`performance-regression-badge performance-regression-badge--${item.severity}`}>
                  +{item.deltaPercent}%
                </span>
              </div>
              <p>{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
