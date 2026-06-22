import {
  legacyQuoteConsentLabel,
  type LegacyQuoteConsentLevel
} from "../../../constants/relationshipLegacyQuotes";

type RelationshipQuoteBadgeProps = {
  consentLevel?: LegacyQuoteConsentLevel | null;
  consentGranted?: boolean;
  privateDefault?: boolean;
};

export function RelationshipQuoteBadge({
  consentLevel = null,
  consentGranted = false,
  privateDefault = true
}: RelationshipQuoteBadgeProps) {
  if (privateDefault && !consentGranted) {
    return <span className="relationship-quote-badge relationship-quote-badge--private">Private</span>;
  }

  return (
    <span
      className={`relationship-quote-badge relationship-quote-badge--consent${
        consentGranted ? " relationship-quote-badge--granted" : ""
      }`}
    >
      {legacyQuoteConsentLabel(consentLevel)}
    </span>
  );
}
