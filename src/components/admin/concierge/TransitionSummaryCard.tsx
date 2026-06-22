import {
  CONTINUITY_SUMMARY_SUBCOPY,
  CONTINUITY_SUMMARY_TITLE
} from "../../../constants/conciergeJourneyContinuity";
import { CONCIERGE_PROFESSIONAL_CHANNEL_LABELS } from "../../../constants/conciergeConsultantCommunication";
import type { JourneyTransitionSummary } from "../../../utils/conciergeJourneyContinuity";

type TransitionSummaryCardProps = {
  summary: JourneyTransitionSummary;
};

export function TransitionSummaryCard({ summary }: TransitionSummaryCardProps) {
  return (
    <section className="transition-summary-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONTINUITY_SUMMARY_TITLE}</h3>
        <p>{CONTINUITY_SUMMARY_SUBCOPY}</p>
      </header>
      <div className="transition-summary-card__grid">
        <div>
          <span>Current steward</span>
          <strong>{summary.currentConsultant ?? "Unassigned"}</strong>
        </div>
        <div>
          <span>Previous steward</span>
          <strong>{summary.previousConsultant ?? "—"}</strong>
        </div>
        <div>
          <span>Transition date</span>
          <strong>
            {summary.transitionDate
              ? new Date(summary.transitionDate).toLocaleDateString()
              : "—"}
          </strong>
        </div>
        <div>
          <span>Relationship status</span>
          <strong>{summary.relationshipStatus}</strong>
        </div>
      </div>
      {summary.reason ? (
        <p className="transition-summary-card__reason">
          <span>Reason</span> {summary.reason}
        </p>
      ) : null}
      <div className="transition-summary-card__section">
        <h4>Open follow-ups</h4>
        {summary.openTasksCount ? (
          <ul>
            {summary.openTasks.slice(0, 4).map((task) => (
              <li key={task.id}>
                {task.title} · due {new Date(task.dueAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="concierge-consultant__empty">No open follow-ups.</p>
        )}
      </div>
      <div className="transition-summary-card__section">
        <h4>Upcoming meetings</h4>
        {summary.upcomingMeetings.length ? (
          <ul>
            {summary.upcomingMeetings.map((meeting) => (
              <li key={meeting.id}>
                {CONCIERGE_PROFESSIONAL_CHANNEL_LABELS[meeting.channel]} ·{" "}
                {new Date(meeting.scheduledAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="concierge-consultant__empty">No upcoming meetings scheduled.</p>
        )}
      </div>
      {summary.consultantSummaryLines.length ? (
        <div className="transition-summary-card__section">
          <h4>Consultant summary</h4>
          <ul className="transition-summary-card__summary-lines">
            {summary.consultantSummaryLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
