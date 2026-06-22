import { useCallback, useEffect, useState } from "react";
import {
  CONSULTANT_PERFORMANCE_TITLE,
  CONSULTANT_STRENGTHS_TITLE,
  JOURNEY_SUCCESS_TITLE,
  PERFORMANCE_TRENDS_TITLE,
  RELATIONSHIP_QUALITY_TITLE,
  SCORECARD_SUBCOPY
} from "../../../constants/consultantPerformanceScorecard";
import {
  fetchAdminConciergeConsultantPerformance,
  fetchAdminConciergeConsultants
} from "../../../services/adminConcierge";
import type { ConciergeConsultantRecord } from "../../../types/conciergeConsultantDirectory";
import type { ConsultantPerformanceScorecard } from "../../../types/consultantPerformanceScorecard";
import { ConsultantAchievementsCard } from "./ConsultantAchievementsCard";
import { ConsultantScoreCard } from "./ConsultantScoreCard";
import { RelationshipMetricsCard } from "./RelationshipMetricsCard";

export function ConsultantPerformancePage() {
  const [consultants, setConsultants] = useState<ConciergeConsultantRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<ConsultantPerformanceScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConsultants = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminConciergeConsultants();
    setConsultants(result.consultants.filter((item) => item.status === "active"));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadConsultants();
  }, [loadConsultants]);

  useEffect(() => {
    if (!selectedId) {
      setScorecard(null);
      return;
    }
    void fetchAdminConciergeConsultantPerformance(selectedId).then((result) => {
      setScorecard(result.scorecard);
    });
  }, [selectedId]);

  return (
    <div className="consultant-performance-page">
      <header className="consultant-performance-page__head">
        <div>
          <h2>{CONSULTANT_PERFORMANCE_TITLE}</h2>
          <p>{SCORECARD_SUBCOPY}</p>
        </div>
      </header>

      <div className="consultant-performance-page__body">
        <aside className="consultant-performance-page__list concierge-consultant-card--glass">
          <h3>Consultants</h3>
          {loading ? <p className="concierge-consultant__empty">Loading consultants…</p> : null}
          <ul>
            {consultants.map((consultant) => (
              <li key={consultant.id}>
                <button
                  type="button"
                  className={`consultant-performance-page__row${
                    selectedId === consultant.id ? " is-active" : ""
                  }`}
                  onClick={() => setSelectedId(consultant.id)}
                >
                  <strong>{consultant.name}</strong>
                  <span>{consultant.primaryRole.replace(/-/g, " ")}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="consultant-performance-page__detail">
          {scorecard ? (
            <>
              <ConsultantScoreCard
                consultantName={scorecard.consultantName}
                health={scorecard.health}
                memberSatisfaction={scorecard.relationshipMetrics.memberSatisfaction}
                retentionRate={scorecard.relationshipMetrics.retentionRate}
              />
              <RelationshipMetricsCard metrics={scorecard.relationshipMetrics} />
              <ConsultantAchievementsCard achievements={scorecard.achievements} />

              <section className="consultant-performance-trends concierge-consultant-card concierge-consultant-card--glass cc-reveal">
                <header className="concierge-consultant-card__head">
                  <h3>{PERFORMANCE_TRENDS_TITLE}</h3>
                  <p>{JOURNEY_SUCCESS_TITLE} over time — outcome-focused, never a sales leaderboard.</p>
                </header>
                <ul className="consultant-performance-trends__list">
                  {scorecard.trends.map((trend) => (
                    <li key={trend.label}>
                      <span>{trend.label}</span>
                      <strong>
                        {trend.value}
                        {trend.unit ?? ""}
                      </strong>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="consultant-performance-page__columns">
                <section className="consultant-performance-outcomes concierge-consultant-card concierge-consultant-card--glass cc-reveal">
                  <header className="concierge-consultant-card__head">
                    <h3>{JOURNEY_SUCCESS_TITLE}</h3>
                  </header>
                  <ul>
                    {scorecard.journeyOutcomes.map((outcome) => (
                      <li key={outcome.id}>
                        <span>{outcome.label}</span>
                        <strong>{outcome.count}</strong>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="consultant-performance-strengths concierge-consultant-card concierge-consultant-card--glass cc-reveal">
                  <header className="concierge-consultant-card__head">
                    <h3>{CONSULTANT_STRENGTHS_TITLE}</h3>
                    <p>{RELATIONSHIP_QUALITY_TITLE}</p>
                  </header>
                  <ul>
                    {scorecard.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          ) : (
            <div className="concierge-consultant-card concierge-consultant-card--glass consultant-performance-page__placeholder cc-reveal">
              <h3>Select a consultant</h3>
              <p>Review relationship outcomes, journey success, and member satisfaction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
