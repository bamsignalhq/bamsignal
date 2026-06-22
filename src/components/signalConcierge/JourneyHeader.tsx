import { JOURNEY_ID_BRAND, JOURNEY_ID_LABEL } from "../../constants/journeyId";

type JourneyHeaderProps = {
  journeyId?: string;
  title?: string;
  subtitle?: string;
  className?: string;
};

export function JourneyHeader({
  journeyId,
  title,
  subtitle,
  className = ""
}: JourneyHeaderProps) {
  return (
    <header
      className={`journey-header${className ? ` ${className}` : ""}`}
      aria-label={journeyId ? `${JOURNEY_ID_LABEL} ${journeyId}` : JOURNEY_ID_BRAND}
    >
      <p className="journey-header__brand">{JOURNEY_ID_BRAND}</p>
      {title ? <h1 className="journey-header__title">{title}</h1> : null}
      {subtitle ? <p className="journey-header__subtitle">{subtitle}</p> : null}
      {journeyId ? (
        <div className="journey-header__id">
          <span>{JOURNEY_ID_LABEL}</span>
          <strong>{journeyId}</strong>
        </div>
      ) : null}
    </header>
  );
}
