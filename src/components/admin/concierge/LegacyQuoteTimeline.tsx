import type { LegacyQuoteEntry } from "../../../constants/relationshipLegacyQuotes";
import { RelationshipQuoteBadge } from "./RelationshipQuoteBadge";

type LegacyQuoteTimelineProps = {
  quotes: LegacyQuoteEntry[];
};

export function LegacyQuoteTimeline({ quotes }: LegacyQuoteTimelineProps) {
  if (!quotes.length) {
    return (
      <p className="concierge-consultant__empty legacy-quote-timeline__empty">
        No legacy quotes recorded yet.
      </p>
    );
  }

  return (
    <ol className="legacy-quote-timeline">
      {quotes.map((quote) => (
        <li key={quote.id} className="legacy-quote-timeline__item">
          <div className="legacy-quote-timeline__head">
            <RelationshipQuoteBadge
              consentLevel={quote.consentLevel}
              consentGranted={quote.consentGranted}
            />
            <time dateTime={quote.recordedAt}>{new Date(quote.recordedAt).toLocaleDateString()}</time>
          </div>
          <blockquote className="legacy-quote-timeline__quote">
            <p>{quote.body}</p>
          </blockquote>
          {quote.recordedBy ? (
            <span className="legacy-quote-timeline__by">{quote.recordedBy}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
