import { ASSIGNMENT_CONFIDENCE_LABELS, WORKLOAD_HEALTH_LABELS } from "../../../constants/consultantAssignment";
import type { OperationsCenterBundle } from "../../../types/operationsCenter";

type AssignmentQueueCardProps = {
  bundle: OperationsCenterBundle;
};

function AssignmentList({
  title,
  rows,
  emptyLabel
}: {
  title: string;
  rows: OperationsCenterBundle["assignmentQueue"]["unassignedApplications"];
  emptyLabel: string;
}) {
  return (
    <div className="operations-center-panel__block">
      <h4>{title}</h4>
      {rows.length === 0 ? <p className="concierge-consultant__empty">{emptyLabel}</p> : null}
      <ul className="concierge-consultant-list">
        {rows.slice(0, 10).map((row) => (
          <li key={row.id} className="concierge-consultant-list__item">
            <div>
              <strong>{row.memberName}</strong>
              <span>
                {row.journeyStage} · {row.city}
              </span>
              {row.recommendedConsultantName ? (
                <span>
                  Recommend {row.recommendedConsultantName}
                  {row.confidence ? ` · ${ASSIGNMENT_CONFIDENCE_LABELS[row.confidence]}` : ""}
                </span>
              ) : null}
              {row.reason ? <span>{row.reason}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AssignmentQueueCard({ bundle }: AssignmentQueueCardProps) {
  const { assignmentQueue } = bundle;

  return (
    <section className="operations-center-assignments concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Assignment Queue</h3>
        <p>Consultant Assignment Engine™ workload and recommendations</p>
      </header>

      <AssignmentList
        title="Unassigned Applications"
        rows={assignmentQueue.unassignedApplications}
        emptyLabel="All applications have stewards."
      />
      <AssignmentList
        title="Pending Review"
        rows={assignmentQueue.pendingReview}
        emptyLabel="No applications awaiting review."
      />

      <div className="operations-center-panel__block">
        <h4>Consultant Workload Overview</h4>
        {assignmentQueue.workloadOverview.length === 0 ? (
          <p className="concierge-consultant__empty">No consultants loaded.</p>
        ) : null}
        <ul className="concierge-consultant-list">
          {assignmentQueue.workloadOverview.map((row) => (
            <li key={row.consultantId} className="concierge-consultant-list__item">
              <div>
                <strong>{row.consultantName}</strong>
                <span>{WORKLOAD_HEALTH_LABELS[row.health]}</span>
                <span>
                  {row.activeMembers} active · {row.pendingFollowUps} follow-ups · {row.upcomingMeetings}{" "}
                  meetings
                </span>
                <span>{row.summary}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AssignmentList
        title="Assignment Recommendations"
        rows={assignmentQueue.recommendations}
        emptyLabel="No assignment recommendations right now."
      />
    </section>
  );
}
