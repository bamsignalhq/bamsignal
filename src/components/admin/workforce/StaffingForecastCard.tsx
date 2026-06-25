import { WORKFORCE_REGION_LABELS } from "../../../constants/workforceManagement";
import type { StaffingForecastRecord } from "../../../types/workforceManagement";

type StaffingForecastCardProps = {
  forecasts: StaffingForecastRecord[];
};

export function StaffingForecastCard({ forecasts }: StaffingForecastCardProps) {
  return (
    <section className="workforce-card staffing-forecast-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Staffing forecast</h3>
        <p>Simple institutional forecasting — hiring needs, shortages, and consultation demand. No AI.</p>
      </header>
      {forecasts.length === 0 ? (
        <p className="concierge-consultant__empty">No forecasts generated yet.</p>
      ) : (
        <ul className="staffing-forecast-card__list">
          {forecasts.map((forecast) => (
            <li key={forecast.id}>
              <div>
                <strong>{WORKFORCE_REGION_LABELS[forecast.regionId]}</strong>
                <span>{forecast.forecastPeriod}</span>
              </div>
              <div className="staffing-forecast-card__metrics">
                <span>Demand {forecast.projectedConsultationDemand}</span>
                <span>Shortage {forecast.consultantShortage}</span>
                <span>Hiring {forecast.estimatedHiringNeeds}</span>
                <span>Pressure {forecast.staffingPressureScore}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
