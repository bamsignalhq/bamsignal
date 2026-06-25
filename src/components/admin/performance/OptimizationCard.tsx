import {
  OPTIMIZATION_CATEGORY_LABELS
} from "../../../constants/performanceCenter";
import type { PerformanceOptimizationItem } from "../../../types/performanceCenter";

type OptimizationCardProps = {
  items: PerformanceOptimizationItem[];
};

export function OptimizationCard({ items }: OptimizationCardProps) {
  return (
    <section className="performance-center-card optimization-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Optimization</h3>
        <p>Largest queries, slowest pages, heavy APIs, and background job bottlenecks.</p>
      </header>
      {items.length ? (
        <ul className="performance-center-card__list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="performance-center-card__row">
                <strong>{item.title}</strong>
                <span className={`performance-center-card__impact performance-center-card__impact--${item.impact}`}>
                  {item.impact}
                </span>
              </div>
              <div className="performance-center-card__meta">
                <span>{OPTIMIZATION_CATEGORY_LABELS[item.categoryId]}</span>
                <span>{item.itemRef}</span>
                <span>{item.ownerEmail}</span>
              </div>
              <p className="performance-center-card__detail">{item.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="performance-center-card__empty">No open optimization items.</p>
      )}
      <p className="performance-center-card__footnote">
        Categories: {Object.values(OPTIMIZATION_CATEGORY_LABELS).join(" · ")}
      </p>
    </section>
  );
}
