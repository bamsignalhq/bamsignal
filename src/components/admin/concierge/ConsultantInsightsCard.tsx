import { JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS } from "../../../constants/journeyIntelligence";
import type { JourneyIntelligenceConsultantInsight } from "../../../types/journeyIntelligence";

type ConsultantInsightsCardProps = {
  consultants: JourneyIntelligenceConsultantInsight[];
};

export function ConsultantInsightsCard({ consultants }: ConsultantInsightsCardProps) {
  return (
    <section className="journey-intelligence-card consultant-insights-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultant insights</h3>
        <p>Steward-level journey outcomes — human care, not leaderboards.</p>
      </header>
      {consultants.length === 0 ? (
        <p className="concierge-consultant__empty">No consultant journey data yet.</p>
      ) : (
        <ul className="consultant-insights-card__list">
          {consultants.slice(0, 8).map((consultant) => (
            <li key={consultant.id}>
              <div className="consultant-insights-card__head">
                <strong>{consultant.name}</strong>
                <span>{consultant.narrative}</span>
              </div>
              <dl className="consultant-insights-card__metrics">
                <div>
                  <dt>{JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS.consultations}</dt>
                  <dd>{consultant.consultations}</dd>
                </div>
                <div>
                  <dt>{JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS.introductions}</dt>
                  <dd>{consultant.introductions}</dd>
                </div>
                <div>
                  <dt>{JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS.relationships}</dt>
                  <dd>{consultant.relationships}</dd>
                </div>
                <div>
                  <dt>{JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS.engagements}</dt>
                  <dd>{consultant.engagements}</dd>
                </div>
                <div>
                  <dt>{JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS.marriages}</dt>
                  <dd>{consultant.marriages}</dd>
                </div>
                <div>
                  <dt>{JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS.legacyFamilies}</dt>
                  <dd>{consultant.legacyFamilies}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
