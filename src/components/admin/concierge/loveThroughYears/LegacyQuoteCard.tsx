import {
  LEGACY_QUOTE_DEFAULT_PRIVATE_COPY,
  LEGACY_QUOTES_LABEL,
  type LegacyQuoteEntry
} from "../../../../constants/relationshipLegacyQuotes";
import {
  CELEBRATING_YOUR_STORY_LABEL,
  JOURNEY_MEMORIES_LABEL
} from "../../../../constants/loveThroughYears";
import { RelationshipQuoteBadge } from "../RelationshipQuoteBadge";

type LegacyQuoteCardProps = {
  quotes: LegacyQuoteEntry[];
};

export function LegacyQuoteCard({ quotes }: LegacyQuoteCardProps) {
  return (
    <section className="love-through-years-quote-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{LEGACY_QUOTES_LABEL}</h3>
        <p>
          {JOURNEY_MEMORIES_LABEL} · {CELEBRATING_YOUR_STORY_LABEL}
        </p>
      </header>

      <p className="love-through-years-quote-card__private">{LEGACY_QUOTE_DEFAULT_PRIVATE_COPY}</p>

      {quotes.length ? (
        <ul className="love-through-years-quote-card__list">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <blockquote>&ldquo;{quote.body}&rdquo;</blockquote>
              <RelationshipQuoteBadge
                consentLevel={quote.consentLevel}
                consentGranted={quote.consentGranted}
                privateDefault
              />
              <time dateTime={quote.recordedAt}>
                {new Date(quote.recordedAt).toLocaleDateString()}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">
          Legacy quotes will appear here as your story is preserved with consent.
        </p>
      )}
    </section>
  );
}
