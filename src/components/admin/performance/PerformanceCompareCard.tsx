import {
  PERFORMANCE_COMPARE_WINDOWS,
  type PerformanceCompareWindowId
} from "../../../constants/performanceCenter";

type PerformanceCompareCardProps = {
  activeWindow: PerformanceCompareWindowId;
  onWindowChange: (windowId: PerformanceCompareWindowId) => void;
};

export function PerformanceCompareCard({
  activeWindow,
  onWindowChange
}: PerformanceCompareCardProps) {
  return (
    <section className="performance-center-card performance-compare-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Compare</h3>
        <p>Baseline current metrics against previous release and historical windows.</p>
      </header>
      <nav className="performance-compare-card__windows" aria-label="Compare windows">
        {PERFORMANCE_COMPARE_WINDOWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`performance-compare-card__window-btn${
              activeWindow === item.id ? " is-active" : ""
            }`}
            onClick={() => onWindowChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </section>
  );
}
