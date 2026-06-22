import { OPERATIONS_CENTER_SECTIONS } from "../../../constants/operationsCenter";
import type { OperationsCenterBundle, OperationsCenterSectionId } from "../../../types/operationsCenter";

type OperationsOverviewCardProps = {
  bundle: OperationsCenterBundle;
  activeSection: OperationsCenterSectionId;
  onSelectSection: (section: OperationsCenterSectionId) => void;
};

function sectionCount(bundle: OperationsCenterBundle, section: OperationsCenterSectionId): number {
  switch (section) {
    case "consultations":
      return Object.values(bundle.consultations).reduce((sum, rows) => sum + rows.length, 0);
    case "payments":
      return Object.values(bundle.payments).reduce((sum, rows) => sum + rows.length, 0);
    case "scheduling":
      return (
        bundle.scheduling.todayCalendar.length +
        bundle.scheduling.upcomingBookings.length +
        bundle.scheduling.meetingLinks.length
      );
    case "assignment-queue":
      return (
        bundle.assignmentQueue.unassignedApplications.length +
        bundle.assignmentQueue.pendingReview.length
      );
    case "notifications":
      return bundle.notifications.queue.length + bundle.notifications.failed.length;
    case "introductions":
      return Object.values(bundle.introductions).reduce((sum, rows) => sum + rows.length, 0);
    case "follow-up":
      return Object.values(bundle.followUps).reduce((sum, rows) => sum + rows.length, 0);
    case "regional-teams":
      return bundle.regionalTeams.teams.reduce((sum, team) => sum + team.assignments.length, 0);
    default:
      return 0;
  }
}

export function OperationsOverviewCard({
  bundle,
  activeSection,
  onSelectSection
}: OperationsOverviewCardProps) {
  return (
    <section className="operations-center-overview concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Operational Sections</h3>
        <p>Aggregated from existing concierge engines — no duplicate local state.</p>
      </header>
      <div className="operations-center-overview__grid">
        {OPERATIONS_CENTER_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`operations-center-overview__item${
              activeSection === section.id ? " is-active" : ""
            }`}
            onClick={() => onSelectSection(section.id)}
          >
            <strong>{sectionCount(bundle, section.id)}</strong>
            <span>{section.label}</span>
            <p>{section.hint}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
