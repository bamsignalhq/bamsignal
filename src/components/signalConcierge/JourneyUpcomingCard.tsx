import { MEMBER_JOURNEY_ID_LABEL } from "../../constants/memberDashboard";
import type { MemberUpcomingItem } from "../../types/memberDashboard";

const KIND_LABELS: Record<MemberUpcomingItem["kind"], string> = {
  consultation: "Consultation",
  meeting: "Meeting",
  "scheduled-call": "Scheduled call",
  "introduction-response": "Introduction"
};

type JourneyUpcomingCardProps = {
  items: MemberUpcomingItem[];
  journeyId?: string;
};

export function JourneyUpcomingCard({ items, journeyId }: JourneyUpcomingCardProps) {
  return (
    <section className="member-dashboard-card journey-upcoming-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Upcoming</h3>
        <p>
          Consultations, meetings, calls, and introductions awaiting your response.
          {journeyId ? ` ${MEMBER_JOURNEY_ID_LABEL}: ${journeyId}` : ""}
        </p>
      </header>
      {items.length === 0 ? (
        <p className="journey-upcoming-card__empty">No upcoming concierge items right now.</p>
      ) : (
        <ul className="journey-upcoming-card__list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="journey-upcoming-card__row">
                <strong>{item.label}</strong>
                <span>{KIND_LABELS[item.kind]}</span>
              </div>
              <p>{item.detail}</p>
              <time dateTime={item.scheduledAt}>{new Date(item.scheduledAt).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
