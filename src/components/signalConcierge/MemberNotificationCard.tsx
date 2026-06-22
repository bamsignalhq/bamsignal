import type { MemberNotificationSummary } from "../../types/memberDashboard";

type MemberNotificationCardProps = {
  notifications: MemberNotificationSummary[];
};

export function MemberNotificationCard({ notifications }: MemberNotificationCardProps) {
  return (
    <section className="member-dashboard-card member-notification-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Notifications</h3>
        <p>Gentle journey updates — never public.</p>
      </header>
      {notifications.length === 0 ? (
        <p className="member-notification-card__empty">No notifications yet.</p>
      ) : (
        <ul className="member-notification-card__list">
          {notifications.map((item) => (
            <li key={item.id}>
              <strong>{item.subject}</strong>
              <span>{item.preview}</span>
              <time dateTime={item.at}>{new Date(item.at).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
