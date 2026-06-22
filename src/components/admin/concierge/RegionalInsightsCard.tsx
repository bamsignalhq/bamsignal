import { JOURNEY_INTELLIGENCE_REGIONAL_SECTIONS } from "../../../constants/journeyIntelligence";
import type {
  JourneyIntelligenceRegionalInsights,
  JourneyIntelligenceRegionalRow
} from "../../../types/journeyIntelligence";

type RegionalInsightsCardProps = {
  regional: JourneyIntelligenceRegionalInsights;
};

const REGIONAL_ROWS: Record<
  (typeof JOURNEY_INTELLIGENCE_REGIONAL_SECTIONS)[number]["id"],
  keyof JourneyIntelligenceRegionalInsights
> = {
  cities: "cities",
  countries: "countries",
  "diaspora-corridors": "diasporaCorridors",
  "legacy-cities": "legacyCities"
};

export function RegionalInsightsCard({ regional }: RegionalInsightsCardProps) {
  return (
    <section className="journey-intelligence-card regional-insights-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Regional insights</h3>
        <p>City, country, corridor, and legacy city journeys — no public rankings.</p>
      </header>
      <div className="regional-insights-card__grid">
        {JOURNEY_INTELLIGENCE_REGIONAL_SECTIONS.map((section) => {
          const rows: JourneyIntelligenceRegionalRow[] = regional[REGIONAL_ROWS[section.id]];
          return (
            <div key={section.id} className="regional-insights-card__block">
              <h4>{section.label}</h4>
              {rows.length === 0 ? (
                <p className="concierge-consultant__empty">No {section.label.toLowerCase()} data yet.</p>
              ) : (
                <ul>
                  {rows.map((row) => (
                    <li key={row.id}>
                      <span>{row.label}</span>
                      <strong>{row.count}</strong>
                      {row.hint ? <small>{row.hint}</small> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
