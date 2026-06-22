import type { WorkloadProfile } from "../../../types/consultantAssignment";
import { specializationLabels } from "../../../utils/consultantWorkloadEngine";
import { AssignmentHealthBadge } from "./AssignmentHealthBadge";
import { ConsultantCapacityBadge } from "./ConsultantCapacityBadge";

type ConsultantWorkloadCardProps = {
  workload: WorkloadProfile;
  title?: string;
  compact?: boolean;
};

export function ConsultantWorkloadCard({
  workload,
  title = "Consultant workload",
  compact = false
}: ConsultantWorkloadCardProps) {
  return (
    <section
      className={`consultant-workload-card concierge-consultant-card--glass cc-reveal${compact ? " consultant-workload-card--compact" : ""}`}
    >
      {!compact ? (
        <header className="concierge-consultant-card__head">
          <h3>{title}</h3>
          <p>Workload factors — active members, consultations, introductions, follow-ups, and meetings.</p>
        </header>
      ) : null}
      <div className="consultant-workload-card__header">
        <strong>{workload.consultantName}</strong>
        <div className="consultant-workload-card__badges">
          <AssignmentHealthBadge health={workload.health} />
          <ConsultantCapacityBadge level={workload.capacityLevel} workload={workload.health} />
        </div>
      </div>
      <p className="consultant-workload-card__summary">{workload.summary}</p>
      <dl className="consultant-workload-card__metrics">
        <div>
          <dt>Active members</dt>
          <dd>{workload.activeMembers}</dd>
        </div>
        <div>
          <dt>Pending consultations</dt>
          <dd>{workload.pendingConsultations}</dd>
        </div>
        <div>
          <dt>Introductions</dt>
          <dd>{workload.introductionsInProgress}</dd>
        </div>
        <div>
          <dt>Follow-ups</dt>
          <dd>{workload.pendingFollowUps}</dd>
        </div>
        <div>
          <dt>Meetings</dt>
          <dd>{workload.upcomingMeetings}</dd>
        </div>
        <div>
          <dt>Response time</dt>
          <dd>{workload.responseTimeHours !== null ? `${workload.responseTimeHours}h` : "—"}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{workload.regionLabel}</dd>
        </div>
        <div>
          <dt>Specializations</dt>
          <dd>{specializationLabels(workload.specializations)}</dd>
        </div>
      </dl>
    </section>
  );
}
