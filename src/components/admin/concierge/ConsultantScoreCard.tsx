import {
  CONSULTANT_HEALTH_TITLE,
  HEALTH_METRIC_LABELS
} from "../../../constants/consultantPerformanceScorecard";
import type { ConsultantHealthSnapshot } from "../../../types/consultantPerformanceScorecard";

type ConsultantScoreCardProps = {
  consultantName: string;
  health: ConsultantHealthSnapshot;
  memberSatisfaction: number | null;
  retentionRate: number | null;
};

const RESPONSE_QUALITY_LABELS: Record<ConsultantHealthSnapshot["responseQuality"], string> = {
  excellent: "Excellent",
  good: "Good",
  "needs-attention": "Needs attention",
  unknown: "Building data"
};

export function ConsultantScoreCard({
  consultantName,
  health,
  memberSatisfaction,
  retentionRate
}: ConsultantScoreCardProps) {
  return (
    <section className="consultant-score-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="consultant-score-card__head">
        <p className="consultant-score-card__eyebrow">{CONSULTANT_HEALTH_TITLE}</p>
        <h3>{consultantName}</h3>
        <p className="consultant-score-card__lede">
          Workload and care quality — relationship outcomes, not sales pressure.
        </p>
      </header>

      <dl className="consultant-score-card__grid">
        <div>
          <dt>{HEALTH_METRIC_LABELS.activeMembers}</dt>
          <dd>{health.activeMembers}</dd>
        </div>
        <div>
          <dt>{HEALTH_METRIC_LABELS.workload}</dt>
          <dd>{health.workload}</dd>
        </div>
        <div>
          <dt>{HEALTH_METRIC_LABELS.pendingFollowUps}</dt>
          <dd>{health.pendingFollowUps}</dd>
        </div>
        <div>
          <dt>{HEALTH_METRIC_LABELS.upcomingMeetings}</dt>
          <dd>{health.upcomingMeetings}</dd>
        </div>
        <div>
          <dt>{HEALTH_METRIC_LABELS.responseQuality}</dt>
          <dd className={`consultant-score-card__quality consultant-score-card__quality--${health.responseQuality}`}>
            {RESPONSE_QUALITY_LABELS[health.responseQuality]}
          </dd>
        </div>
        <div>
          <dt>Member satisfaction</dt>
          <dd>{memberSatisfaction !== null ? `${memberSatisfaction}%` : "—"}</dd>
        </div>
        <div>
          <dt>Retention</dt>
          <dd>{retentionRate !== null ? `${retentionRate}%` : "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
