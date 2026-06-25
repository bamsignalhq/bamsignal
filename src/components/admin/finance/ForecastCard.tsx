import type { FinanceForecastItem } from "../../../types/financeOperations";

type ForecastCardProps = {
  forecast: FinanceForecastItem[];
};

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  return (
    <section className="finance-card forecast-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Forecast</h3>
        <p>Projected revenue, expenses, and net position based on current institutional trends.</p>
      </header>
      <ul className="finance-list">
        {forecast.map((item) => (
          <li key={item.id} className="finance-list__item">
            <div>
              <strong>{item.label}</strong>
              <span className={`finance-pill finance-pill--${item.confidence}`}>{item.confidence}</span>
            </div>
            <div className="finance-list__meta">
              <span>{formatNgn(item.projectedNgn)}</span>
              <span>{item.horizon}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
