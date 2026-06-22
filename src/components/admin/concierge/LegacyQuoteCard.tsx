import {
  LEGACY_QUOTE_CONSENT_LEVELS,
  LEGACY_QUOTE_CONSENT_REQUIRED_COPY,
  LEGACY_QUOTE_DEFAULT_PRIVATE_COPY,
  LEGACY_QUOTE_EXAMPLES,
  LEGACY_QUOTE_FUTURE_CAPABILITIES,
  LEGACY_QUOTE_RESERVED_COPY,
  LEGACY_QUOTES_LABEL,
  RELATIONSHIP_LEGACY_LABEL,
  RELATIONSHIP_LEGACY_QUOTES_SUBCOPY,
  RELATIONSHIP_LEGACY_QUOTES_TITLE,
  type LegacyQuoteEntry
} from "../../../constants/relationshipLegacyQuotes";
import { getRelationshipLegacyQuotesArchitectureTimeline } from "../../../utils/RelationshipLegacyQuotesEngine";
import { LegacyQuoteTimeline } from "./LegacyQuoteTimeline";
import { RelationshipQuoteBadge } from "./RelationshipQuoteBadge";

type LegacyQuoteCardProps = {
  quotes?: LegacyQuoteEntry[];
  showArchitecturePreview?: boolean;
};

export function LegacyQuoteCard({ quotes, showArchitecturePreview = false }: LegacyQuoteCardProps) {
  const timelineQuotes =
    quotes ?? (showArchitecturePreview ? getRelationshipLegacyQuotesArchitectureTimeline() : []);

  return (
    <div className="relationship-legacy-quotes">
      <section className="legacy-quote-card concierge-consultant-card--glass">
        <header className="concierge-consultant-card__head">
          <h3>{RELATIONSHIP_LEGACY_QUOTES_TITLE}</h3>
          <p>{RELATIONSHIP_LEGACY_QUOTES_SUBCOPY}</p>
        </header>

        <p className="legacy-quote-card__labels">
          {LEGACY_QUOTES_LABEL} · {RELATIONSHIP_LEGACY_LABEL}
        </p>

        <p className="legacy-quote-card__private">{LEGACY_QUOTE_DEFAULT_PRIVATE_COPY}</p>
        <p className="legacy-quote-card__consent">{LEGACY_QUOTE_CONSENT_REQUIRED_COPY}</p>

        <div className="legacy-quote-card__examples">
          <h4>Example quotes</h4>
          <ul>
            {LEGACY_QUOTE_EXAMPLES.map((example) => (
              <li key={example}>
                <blockquote>&ldquo;{example}&rdquo;</blockquote>
              </li>
            ))}
          </ul>
        </div>

        <div className="legacy-quote-card__consent-levels">
          <h4>Consent required</h4>
          <ul className="legacy-quote-card__consent-list">
            {LEGACY_QUOTE_CONSENT_LEVELS.map((level) => (
              <li key={level.id}>
                <RelationshipQuoteBadge consentLevel={level.id} consentGranted={false} privateDefault={false} />
                <p>{level.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="legacy-quote-card__future">
          <h4>Future ready</h4>
          <ul>
            {LEGACY_QUOTE_FUTURE_CAPABILITIES.map((capability) => (
              <li key={capability.id}>
                <strong>{capability.label}</strong>
                <span>{capability.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="legacy-quote-card__reserved">{LEGACY_QUOTE_RESERVED_COPY}</p>
      </section>

      <section className="legacy-quote-timeline-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{LEGACY_QUOTES_LABEL}</h3>
          <p>{RELATIONSHIP_LEGACY_LABEL}</p>
        </header>
        <LegacyQuoteTimeline quotes={timelineQuotes} />
      </section>
    </div>
  );
}
