import type { ConsultantCrmActivityItem } from "../../types/consultantCrm";

type ConsultantActivityCardProps = {
  activity: ConsultantCrmActivityItem[];
};

export function ConsultantActivityCard({ activity }: ConsultantActivityCardProps) {
  return (
    <section className="consultant-crm-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Activity</h3>
        <p>Recent consultant actions and updates</p>
      </header>
      {activity.length === 0 ? (
        <p className="concierge-consultant__empty">No recent activity.</p>
      ) : (
        <ul className="consultant-crm-activity">
          {activity.map((entry) => (
            <li key={entry.id}>
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              <strong>{entry.label}</strong>
              {entry.detail ? <p>{entry.detail}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
