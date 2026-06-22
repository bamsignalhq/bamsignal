import { APPLICATION_APPROVAL_TIMELINE_STEPS } from "../../../constants/applicationApproval";
import type { ReviewTimelineEntry } from "../../../types/applicationApproval";

type ApprovalTimelineCardProps = {
  timeline: ReviewTimelineEntry[];
};

export function ApprovalTimelineCard({ timeline }: ApprovalTimelineCardProps) {
  const reachedKinds = new Set(timeline.map((entry) => entry.kind));

  return (
    <section className="approval-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Approval timeline</h3>
        <p>Append-only — review history never shrinks.</p>
      </header>
      <ol className="approval-timeline__list">
        {APPLICATION_APPROVAL_TIMELINE_STEPS.map((step) => {
          const reached = reachedKinds.has(step.kind);
          const entry = timeline.find((item) => item.kind === step.kind);
          return (
            <li
              key={step.kind}
              className={`approval-timeline__step${reached ? " approval-timeline__step--reached" : ""}${
                entry && step.kind === timeline[timeline.length - 1]?.kind
                  ? " approval-timeline__step--active"
                  : ""
              }`}
            >
              <span className="approval-timeline__dot" aria-hidden />
              <div>
                <strong>{step.label}</strong>
                <span>{entry?.detail ?? step.detail}</span>
                {entry ? (
                  <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
