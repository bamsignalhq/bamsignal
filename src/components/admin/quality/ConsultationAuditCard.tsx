import {
  CONSULTATION_AUDIT_AREAS,
  QUALITY_REVIEW_AREA_LABELS,
  QUALITY_RATING_LABELS
} from "../../../constants/consultantQuality";
import type { QualityAreaRating } from "../../../types/consultantQuality";

type ConsultationAuditCardProps = {
  areaRatings: QualityAreaRating[];
};

export function ConsultationAuditCard({ areaRatings }: ConsultationAuditCardProps) {
  const areas = areaRatings.filter((area) => CONSULTATION_AUDIT_AREAS.includes(area.areaId));

  return (
    <section className="consultation-audit-card concierge-consultant-card--glass cc-reveal">
      <header className="consultation-audit-card__head">
        <h3>Consultation audit</h3>
        <p>Consultation quality, meeting notes, and member satisfaction.</p>
      </header>

      {areas.length ? (
        <ul className="consultation-audit-card__list">
          {areas.map((area) => (
            <li key={area.areaId}>
              <strong>{QUALITY_REVIEW_AREA_LABELS[area.areaId]}</strong>
              <span className={`consultation-audit-card__rating consultation-audit-card__rating--${area.rating}`}>
                {QUALITY_RATING_LABELS[area.rating]}
              </span>
              <p>{area.note}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="consultation-audit-card__empty">No consultation audit areas rated.</p>
      )}
    </section>
  );
}
