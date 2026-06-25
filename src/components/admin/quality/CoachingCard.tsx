import type { CoachingSessionRecord } from "../../../types/consultantQuality";

type CoachingCardProps = {
  sessions: CoachingSessionRecord[];
  upcoming: CoachingSessionRecord[];
};

export function CoachingCard({ sessions, upcoming }: CoachingCardProps) {
  const completed = sessions.filter((item) => item.status === "completed");

  return (
    <section className="quality-card coaching-card concierge-consultant-card--glass cc-reveal">
      <header className="coaching-card__head">
        <h3>Coaching</h3>
        <p>Scheduled and completed coaching sessions tied to quality improvement workflows.</p>
      </header>

      {upcoming.length ? (
        <>
          <h4 className="coaching-card__section-title">Upcoming</h4>
          <ul className="coaching-card__list">
            {upcoming.map((session) => (
              <li key={session.id}>
                <div className="coaching-card__row">
                  <strong>{session.consultantName}</strong>
                  <span>{new Date(session.scheduledAt).toLocaleString()}</span>
                </div>
                <p>{session.topic}</p>
                <span className="coaching-card__coach">Coach: {session.coachEmail}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="coaching-card__empty">No upcoming coaching sessions.</p>
      )}

      {completed.length ? (
        <footer className="coaching-card__completed">
          <h4>Recently completed ({completed.length})</h4>
          <ul>
            {completed.slice(0, 3).map((session) => (
              <li key={session.id}>
                <strong>{session.consultantName}</strong> — {session.topic}
                {session.notes ? <p>{session.notes}</p> : null}
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
