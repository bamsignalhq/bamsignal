import type { AIAssistedMeetingPrep } from "../../types/aiAssistedConsultant";

type MeetingPreparationCardProps = {
  preparation: AIAssistedMeetingPrep;
};

export function MeetingPreparationCard({ preparation }: MeetingPreparationCardProps) {
  return (
    <section className="ai-assist-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Meeting Preparation</h3>
        <p>Draft brief for {preparation.memberName} — consultant leads the session.</p>
      </header>
      {preparation.scheduledHint ? (
        <p className="ai-assist-meeting__schedule">{preparation.scheduledHint}</p>
      ) : null}
      <div className="ai-assist-meeting__section">
        <h4>Focus areas</h4>
        <ul>
          {preparation.focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
      {preparation.priorThemes.length > 0 ? (
        <div className="ai-assist-meeting__section">
          <h4>Prior themes</h4>
          <ul>
            {preparation.priorThemes.map((theme) => (
              <li key={theme}>{theme}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="ai-assist-meeting__section">
        <h4>Consultant reminders</h4>
        <ul>
          {preparation.consultantReminders.map((reminder) => (
            <li key={reminder}>{reminder}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
