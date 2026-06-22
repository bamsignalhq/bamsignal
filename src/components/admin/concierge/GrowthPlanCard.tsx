import type { PerformanceReviewGrowthFocus } from "../../../types/consultantPerformanceReviews";

type GrowthPlanCardProps = {
  growthPlan: PerformanceReviewGrowthFocus[];
};

export function GrowthPlanCard({ growthPlan }: GrowthPlanCardProps) {
  return (
    <section className="growth-plan-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Growth Plan</h3>
        <p>Coaching-focused next steps — never quota pressure.</p>
      </header>
      {growthPlan.length === 0 ? (
        <p className="concierge-consultant__empty">Growth plan forming after the next review cycle.</p>
      ) : (
        <ul className="growth-plan-card__list">
          {growthPlan.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.categoryLabel}</span>
              <p>{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
