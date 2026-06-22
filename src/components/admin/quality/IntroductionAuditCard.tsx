import {
  INTRODUCTION_AUDIT_AREAS,
  QUALITY_REVIEW_AREA_LABELS,
  QUALITY_RATING_LABELS
} from "../../../constants/consultantQuality";
import type { QualityAreaRating } from "../../../types/consultantQuality";

type IntroductionAuditCardProps = {
  areaRatings: QualityAreaRating[];
};

export function IntroductionAuditCard({ areaRatings }: IntroductionAuditCardProps) {
  const areas = areaRatings.filter((area) => INTRODUCTION_AUDIT_AREAS.includes(area.areaId));

  return (
    <section className="introduction-audit-card concierge-consultant-card--glass cc-reveal">
      <header className="introduction-audit-card__head">
        <h3>Introduction audit</h3>
        <p>Introductions, follow-up quality, and recommendations.</p>
      </header>

      {areas.length ? (
        <ul className="introduction-audit-card__list">
          {areas.map((area) => (
            <li key={area.areaId}>
              <strong>{QUALITY_REVIEW_AREA_LABELS[area.areaId]}</strong>
              <span className={`introduction-audit-card__rating introduction-audit-card__rating--${area.rating}`}>
                {QUALITY_RATING_LABELS[area.rating]}
              </span>
              <p>{area.note}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="introduction-audit-card__empty">No introduction audit areas rated.</p>
      )}
    </section>
  );
}
