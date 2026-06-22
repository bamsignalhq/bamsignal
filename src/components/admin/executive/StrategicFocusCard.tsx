import { EXECUTIVE_AREA_LABELS } from "../../../constants/executiveDashboard";
import type { ExecutiveAreaInsight } from "../../../types/executiveDashboard";

type StrategicFocusCardProps = {
  areas: ExecutiveAreaInsight[];
  focusItems: string[];
};

export function StrategicFocusCard({ areas, focusItems }: StrategicFocusCardProps) {
  return (
    <section className="strategic-focus-card concierge-consultant-card--glass cc-reveal">
      <header className="strategic-focus-card__head">
        <h3>Strategic focus</h3>
        <p>Founder and executive priorities — not day-to-day operations.</p>
      </header>

      <div className="strategic-focus-card__areas">
        {areas.map((area) => (
          <article key={area.areaId} className={`strategic-focus-card__area strategic-focus-card__area--${area.status}`}>
            <h4>{EXECUTIVE_AREA_LABELS[area.areaId]}</h4>
            <p>{area.summary}</p>
          </article>
        ))}
      </div>

      <footer className="strategic-focus-card__priorities">
        <h4>Current priorities</h4>
        <ul>
          {focusItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
