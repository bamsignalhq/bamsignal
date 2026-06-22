import { MEMBER_JOURNEY_ID_LABEL } from "../../constants/memberDashboard";
import type { MemberRelationshipJourney } from "../../types/memberDashboard";

type JourneyMilestoneCardProps = {
  journey: MemberRelationshipJourney;
  journeyId?: string;
};

function JourneyListSection({
  title,
  items
}: {
  title: string;
  items: Array<{ id: string; label: string; at: string; detail?: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="journey-milestone-card__section">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.label}</strong>
            {item.detail ? <span>{item.detail}</span> : null}
            <time dateTime={item.at}>{new Date(item.at).toLocaleDateString()}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JourneyMilestoneCard({ journey, journeyId }: JourneyMilestoneCardProps) {
  return (
    <section className="member-dashboard-card journey-milestone-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Relationship journey</h3>
        <p>
          Current stage, milestones, check-ins, celebrations, and anniversaries.
          {journeyId ? ` ${MEMBER_JOURNEY_ID_LABEL}: ${journeyId}` : ""}
        </p>
      </header>
      <p className="journey-milestone-card__stage">
        Current stage: <strong>{journey.currentStage}</strong>
      </p>
      <div className="journey-milestone-card__sections">
        <JourneyListSection title="Milestones" items={journey.milestones} />
        <JourneyListSection title="Check-ins" items={journey.checkIns} />
        <JourneyListSection title="Celebrations" items={journey.celebrations} />
        <JourneyListSection title="Anniversaries" items={journey.anniversaries} />
      </div>
    </section>
  );
}
