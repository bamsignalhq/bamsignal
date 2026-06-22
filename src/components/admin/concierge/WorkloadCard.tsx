import type { WorkloadProfile } from "../../../types/consultantAssignment";
import { AssignmentHealthBadge } from "./AssignmentHealthBadge";

type WorkloadCardProps = {
  workload: WorkloadProfile;
  title?: string;
};

export function WorkloadCard({ workload, title = "Workload status" }: WorkloadCardProps) {
  return (
    <section className="assignment-workload concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{title}</h3>
        <p>Human language only — never percentages.</p>
      </header>
      <div className="assignment-workload__header">
        <strong>{workload.consultantName}</strong>
        <AssignmentHealthBadge health={workload.health} />
      </div>
      <p className="assignment-workload__summary">{workload.summary}</p>
      <dl className="assignment-workload__metrics">
        <div>
          <dt>Active members</dt>
          <dd>{workload.activeMembers}</dd>
        </div>
        <div>
          <dt>Pending follow-ups</dt>
          <dd>{workload.pendingFollowUps}</dd>
        </div>
        <div>
          <dt>Upcoming meetings</dt>
          <dd>{workload.upcomingMeetings}</dd>
        </div>
      </dl>
    </section>
  );
}
