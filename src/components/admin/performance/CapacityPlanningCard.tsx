import { PERFORMANCE_HEALTH_STATUS_LABELS } from "../../../constants/performanceCenter";
import type { PerformanceCapacityPlan } from "../../../types/performanceCenter";

type CapacityPlanningCardProps = {
  plans: PerformanceCapacityPlan[];
  recommendations: string[];
};

export function CapacityPlanningCard({ plans, recommendations }: CapacityPlanningCardProps) {
  return (
    <section className="performance-center-card capacity-planning-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Capacity planning</h3>
        <p>Current capacity, expected load, projected growth, and remaining headroom.</p>
      </header>
      {plans.length ? (
        <ul className="performance-center-card__list">
          {plans.map((item) => (
            <li key={item.id}>
              <div className="performance-center-card__row">
                <strong>{item.domain}</strong>
                <span
                  className={`performance-center-card__badge performance-center-card__badge--${item.status}`}
                >
                  {item.remainingHeadroomPercent}% headroom
                </span>
              </div>
              <div className="performance-center-card__meta">
                <span>Current {item.currentCapacity.toLocaleString()}</span>
                <span>Expected {item.expectedCapacity.toLocaleString()}</span>
                <span>+{item.projectedGrowthPercent}% growth</span>
              </div>
              <p className="performance-center-card__detail">{item.recommendation}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="performance-center-card__empty">No capacity plans in this section.</p>
      )}
      {recommendations.length ? (
        <footer className="performance-center-card__recommendations">
          <h4>Scaling recommendations</h4>
          <ul>
            {recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
