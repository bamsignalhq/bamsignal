import { JOURNEY_ID_BRAND, JOURNEY_ID_LABEL } from "../../constants/journeyId";

type JourneyIdCardProps = {
  journeyId: string;
  className?: string;
};

export function JourneyIdCard({ journeyId, className = "" }: JourneyIdCardProps) {
  return (
    <section
      className={`journey-id-card signal-concierge-glass${className ? ` ${className}` : ""}`}
      aria-label={JOURNEY_ID_LABEL}
    >
      <p className="journey-id-card__brand">{JOURNEY_ID_BRAND}</p>
      <p className="journey-id-card__label">{JOURNEY_ID_LABEL}</p>
      <p className="journey-id-card__value" aria-live="polite">
        {journeyId}
      </p>
      <p className="journey-id-card__note">
        Your permanent relationship journey reference. It never changes — through consultant updates,
        relocation, pauses, or reactivation.
      </p>
    </section>
  );
}
