import {
  DOCUMENTATION_AUDIT_AREAS,
  QUALITY_REVIEW_AREA_LABELS,
  QUALITY_RATING_LABELS
} from "../../../constants/consultantQuality";
import type { QualityAreaRating } from "../../../types/consultantQuality";

type DocumentationAuditCardProps = {
  areaRatings: QualityAreaRating[];
};

export function DocumentationAuditCard({ areaRatings }: DocumentationAuditCardProps) {
  const areas = areaRatings.filter((area) => DOCUMENTATION_AUDIT_AREAS.includes(area.areaId));

  return (
    <section className="documentation-audit-card concierge-consultant-card--glass cc-reveal">
      <header className="documentation-audit-card__head">
        <h3>Documentation audit</h3>
        <p>Documentation quality and professional conduct.</p>
      </header>

      {areas.length ? (
        <ul className="documentation-audit-card__list">
          {areas.map((area) => (
            <li key={area.areaId}>
              <strong>{QUALITY_REVIEW_AREA_LABELS[area.areaId]}</strong>
              <span className={`documentation-audit-card__rating documentation-audit-card__rating--${area.rating}`}>
                {QUALITY_RATING_LABELS[area.rating]}
              </span>
              <p>{area.note}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="documentation-audit-card__empty">No documentation audit areas rated.</p>
      )}
    </section>
  );
}
