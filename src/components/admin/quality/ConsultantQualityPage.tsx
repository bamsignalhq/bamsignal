import { useCallback, useMemo, useState } from "react";
import { CONSULTANT_QUALITY_FUTURE_KINDS } from "../../../constants/consultantQuality";
import {
  CONSULTANT_QUALITY_ADMIN_BRAND,
  CONSULTANT_QUALITY_ADMIN_PATH
} from "../../../constants/consultantQualityAdmin";
import { buildConsultantQualityBundle } from "../../../utils/consultantQualityEngine";
import { averageQualityScore, emptyQualityFilters } from "../../../utils/consultantQualityLogic";
import { CertificationCard } from "./CertificationCard";
import { CoachingCard } from "./CoachingCard";
import { ConsultantQualityCard } from "./ConsultantQualityCard";
import { ImprovementPlanCard } from "./ImprovementPlanCard";
import { QualityTrendCard } from "./QualityTrendCard";
import { ReviewHistoryCard } from "./ReviewHistoryCard";

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
            Institutional consultant excellence — eight quality standards, certification levels,
            structured reviews, improvement plans, coaching, and append-only audit records.
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

      <ConsultantQualityCard
        metrics={bundle.metrics}
        standardsCoverage={bundle.standardsCoverage}
        overallScore={portfolioAverage}
      />

      <div className="consultant-quality-page__body">
        <div className="consultant-quality-page__column">
          <ReviewHistoryCard
            reviews={bundle.reviews}
            filters={filters}
            selectedReviewId={selectedReviewId}
            onFilterChange={setFilters}
            onSelectReview={setSelectedReviewId}
            onReset={handleReset}
          />
          <ImprovementPlanCard
            improvementPlans={bundle.improvementPlans}
            legacyPlan={selectedReview?.improvementPlan}
            appendLog={selectedReview?.appendLog}
          />
        </div>
        <div className="consultant-quality-page__column">
          <CertificationCard certifications={bundle.certifications} />
          <QualityTrendCard trend={bundle.qualityTrend} />
          <CoachingCard sessions={bundle.coachingSessions} upcoming={bundle.upcomingCoaching} />
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
        <p>Generated {new Date(bundle.generatedAt).toLocaleString()}</p>
      </footer>
    </div>
  );
}
