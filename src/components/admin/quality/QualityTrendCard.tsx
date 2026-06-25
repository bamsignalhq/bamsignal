import type { QualityTrendPoint } from "../../../types/consultantQuality";

type QualityTrendCardProps = {
  trend: QualityTrendPoint[];
};

export function QualityTrendCard({ trend }: QualityTrendCardProps) {
  const maxScore = Math.max(...trend.map((item) => item.averageScore), 100);

  return (
    <section className="quality-card quality-trend-card concierge-consultant-card--glass cc-reveal">
      <header className="quality-trend-card__head">
        <h3>Quality trend</h3>
        <p>Monthly average quality scores and review volume across the consultant portfolio.</p>
      </header>

      {trend.length ? (
        <ul className="quality-trend-card__chart">
          {trend.map((point) => (
            <li key={point.month}>
              <span className="quality-trend-card__month">{point.month}</span>
              <div className="quality-trend-card__bar-wrap">
                <div
                  className="quality-trend-card__bar"
                  style={{ width: `${Math.round((point.averageScore / maxScore) * 100)}%` }}
                />
              </div>
              <strong>{point.averageScore}%</strong>
              <span className="quality-trend-card__count">{point.reviewCount} reviews</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="quality-trend-card__empty">No trend data available yet.</p>
      )}
    </section>
  );
}
