import type { MeetingActionItem } from "../../../types/meetingNotes";

type MeetingActionCardProps = {
  actionItems: MeetingActionItem[];
};

export function MeetingActionCard({ actionItems }: MeetingActionCardProps) {
  return (
    <section className="meeting-actions concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Action items</h3>
        <p>Follow-through from private meetings — never deleted.</p>
      </header>
      {actionItems.length === 0 ? (
        <p className="meeting-actions__empty">No action items recorded yet.</p>
      ) : (
        <ul className="meeting-actions__list">
          {actionItems.map((item) => (
            <li
              key={item.id}
              className={`meeting-actions__item${item.completed ? " is-complete" : ""}`}
            >
              <strong>{item.title}</strong>
              <div className="meeting-actions__footer">
                <span>{item.completed ? "Complete" : "Open"}</span>
                {item.dueAt ? (
                  <time dateTime={item.dueAt}>Due {new Date(item.dueAt).toLocaleDateString()}</time>
                ) : (
                  <time dateTime={item.recordedAt}>
                    Recorded {new Date(item.recordedAt).toLocaleDateString()}
                  </time>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
