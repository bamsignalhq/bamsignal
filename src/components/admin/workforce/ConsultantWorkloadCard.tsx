import {
  WORKFORCE_CAPACITY_STATE_LABELS,
  WORKFORCE_ROLE_LABELS
} from "../../../constants/workforceManagement";
import type { ConsultantCapacityRecord, WorkforceProfileRecord } from "../../../types/workforceManagement";

type ConsultantWorkloadCardProps = {
  profiles: WorkforceProfileRecord[];
  capacity: ConsultantCapacityRecord[];
};

export function ConsultantWorkloadCard({ profiles, capacity }: ConsultantWorkloadCardProps) {
  const capacityByProfile = Object.fromEntries(capacity.map((item) => [item.profileId, item]));

  return (
    <section className="workforce-card consultant-workload-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultant workload</h3>
        <p>Applications, consultations, journeys, follow-ups, and introductions pending.</p>
      </header>
      <ul className="consultant-workload-card__list">
        {profiles
          .filter((profile) => profile.roleId !== "operations-coordinator")
          .map((profile) => {
            const metrics = capacityByProfile[profile.id];
            if (!metrics) return null;
            return (
              <li key={profile.id}>
                <div>
                  <strong>{profile.displayName}</strong>
                  <span>{WORKFORCE_ROLE_LABELS[profile.roleId]}</span>
                </div>
                <span className={`workforce-pill workforce-pill--${metrics.capacityState}`}>
                  {WORKFORCE_CAPACITY_STATE_LABELS[metrics.capacityState]}
                </span>
                <div className="consultant-workload-card__metrics">
                  <span>Apps {metrics.applicationsAssigned}</span>
                  <span>Today {metrics.consultationsToday}</span>
                  <span>Week {metrics.consultationsThisWeek}</span>
                  <span>Journeys {metrics.activeJourneys}</span>
                  <span>Follow-ups {metrics.followUpsPending}</span>
                  <span>Intros {metrics.introductionsPending}</span>
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
