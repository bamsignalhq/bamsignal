import type { GrowthTrendPoint } from "../../../types/executiveDashboard";

type GrowthTrendCardProps = {
  points: GrowthTrendPoint[];
  viewLabel: string;
};

export function GrowthTrendCard({ points, viewLabel }: GrowthTrendCardProps) {
  return (
    <section className="growth-trend-card concierge-consultant-card--glass cc-reveal">
      <header className="growth-trend-card__head">
        <h3>Growth</h3>
        <p>Applications, consultations, and revenue trend — {viewLabel}.</p>
      </header>

      <div className="growth-trend-card__table" role="table" aria-label="Growth trend">
        <div className="growth-trend-card__row growth-trend-card__row--head" role="row">
          <span role="columnheader">Period</span>
          <span role="columnheader">Applications</span>
          <span role="columnheader">Consultations</span>
          <span role="columnheader">Revenue</span>
        </div>
        {points.map((point) => (
          <div key={point.period} className="growth-trend-card__row" role="row">
            <span role="cell">{point.period}</span>
            <span role="cell">{point.applications.toLocaleString("en-NG")}</span>
            <span role="cell">{point.consultations.toLocaleString("en-NG")}</span>
            <span role="cell">₦{point.revenueNgn.toLocaleString("en-NG")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
