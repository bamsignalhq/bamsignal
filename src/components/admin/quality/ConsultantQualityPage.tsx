import { useCallback, useMemo, useState } from "react";
import {
  CONSULTANT_QUALITY_FUTURE_KINDS,
  QUALITY_RATINGS,
  QUALITY_RATING_LABELS
} from "../../../constants/consultantQuality";
import {
  CONSULTANT_QUALITY_ADMIN_BRAND,
  CONSULTANT_QUALITY_ADMIN_PATH
} from "../../../constants/consultantQualityAdmin";
import type { QualityRatingId } from "../../../constants/consultantQuality";
import { buildConsultantQualityBundle } from "../../../utils/consultantQualityEngine";
import { averageQualityScore, emptyQualityFilters } from "../../../utils/consultantQualityLogic";
import { ConsultationAuditCard } from "./ConsultationAuditCard";
import { DocumentationAuditCard } from "./DocumentationAuditCard";
import { ImprovementPlanCard } from "./ImprovementPlanCard";
import { IntroductionAuditCard } from "./IntroductionAuditCard";
import { QualityReviewCard } from "./QualityReviewCard";
import { QualityScoreCard } from "./QualityScoreCard";

export function ConsultantQualityPage() {
  const [filters, setFilters] = useState(() => emptyQualityFilters());
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildConsultantQualityBundle(filters, selectedReviewId);
  }, [filters, refreshKey, selectedReviewId]);

  const selectedReview =
    bundle.reviews.find((review) => review.id === selectedReviewId) ?? bundle.selectedReview;

  const portfolioAverage = useMemo(
    () => averageQualityScore(bundle.reviews),
    [bundle.reviews]
  );

  const handleReset = useCallback(() => {
    setFilters(emptyQualityFilters());
    setSelectedReviewId(null);
  }, []);

  return (
    <div className="consultant-quality-page">
      <header className="consultant-quality-page__head">
        <div>
          <h2>{CONSULTANT_QUALITY_ADMIN_BRAND}</h2>
          <p>
            Structured quality review framework for consultants operating independently —
            consultation, introduction, documentation, and conduct audits with append-only records.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <QualityScoreCard metrics={bundle.metrics} overallScore={portfolioAverage} />

      <div className="consultant-quality-page__filters">
        <label className="quality-search-field">
          <span>Search</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Consultant, journey, reviewer…"
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>

        <label className="quality-search-field">
          <span>Rating filter</span>
          <select
            value={filters.rating}
            onChange={(event) =>
              setFilters({ ...filters, rating: event.target.value as QualityRatingId | "all" })
            }
          >
            <option value="all">All ratings</option>
            {QUALITY_RATINGS.map((rating) => (
              <option key={rating.id} value={rating.id}>
                {QUALITY_RATING_LABELS[rating.id]}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="consultant-quality-page__body">
        <section className="consultant-quality-page__list">
          <h3>Quality reviews</h3>
          {bundle.reviews.length ? (
            bundle.reviews.map((review) => (
              <QualityReviewCard
                key={review.id}
                review={review}
                selected={selectedReviewId === review.id}
                onSelect={() => setSelectedReviewId(review.id)}
              />
            ))
          ) : (
            <p className="consultant-quality-page__empty">No reviews match the current filters.</p>
          )}
        </section>

        <div className="consultant-quality-page__detail">
          {selectedReview ? (
            <>
              <QualityReviewCard review={selectedReview} />
              <ConsultationAuditCard areaRatings={selectedReview.areaRatings} />
              <IntroductionAuditCard areaRatings={selectedReview.areaRatings} />
              <DocumentationAuditCard areaRatings={selectedReview.areaRatings} />
              <ImprovementPlanCard
                improvementPlan={selectedReview.improvementPlan}
                appendLog={selectedReview.appendLog}
              />
            </>
          ) : (
            <p className="consultant-quality-page__empty">
              Select a review to inspect consultation, introduction, and documentation audits.
            </p>
          )}
        </div>
      </div>

      <footer className="consultant-quality-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {CONSULTANT_QUALITY_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {CONSULTANT_QUALITY_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
