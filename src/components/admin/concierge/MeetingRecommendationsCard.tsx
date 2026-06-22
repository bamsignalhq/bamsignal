import type { MeetingRecommendation } from "../../../types/meetingNotes";

type MeetingRecommendationsCardProps = {
  recommendations: MeetingRecommendation[];
};

export function MeetingRecommendationsCard({ recommendations }: MeetingRecommendationsCardProps) {
  return (
    <section className="meeting-recommendations concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Recommendations</h3>
        <p>Steward guidance from private meetings — append-only.</p>
      </header>
      {recommendations.length === 0 ? (
        <p className="meeting-recommendations__empty">No recommendations recorded yet.</p>
      ) : (
        <ul className="meeting-recommendations__list">
          {recommendations.map((item) => (
            <li key={item.id} className="meeting-recommendations__item">
              <div className="meeting-recommendations__row">
                <strong>{item.label}</strong>
                <span
                  className={`meeting-recommendations__priority meeting-recommendations__priority--${item.priority}`}
                >
                  {item.priority === "elevated" ? "Elevated" : "Standard"}
                </span>
              </div>
              <p>{item.detail}</p>
              <time dateTime={item.recordedAt}>{new Date(item.recordedAt).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
