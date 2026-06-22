import type { ConsultationMeeting } from "../../../types/consultationScheduler";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";

type UpcomingConsultationsCardProps = {
  meetings: ConsultationMeeting[];
  selectedId?: string | null;
  onSelect?: (meetingId: string) => void;
  title?: string;
  emptyLabel?: string;
};

export function UpcomingConsultationsCard({
  meetings,
  selectedId,
  onSelect,
  title = "Upcoming Consultations",
  emptyLabel = "No upcoming consultations scheduled."
}: UpcomingConsultationsCardProps) {
  return (
    <section className="consultation-upcoming concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{title}</h3>
        <p>Structured consultation management — no external APIs yet.</p>
      </header>
      {meetings.length === 0 ? (
        <p className="concierge-consultant__empty">{emptyLabel}</p>
      ) : (
        <ul className="consultation-upcoming__list">
          {meetings.map((meeting) => {
            const scheduled = new Date(meeting.scheduledAt);
            const content = (
              <>
                <strong>{meeting.memberName}</strong>
                <span>
                  {scheduled.toLocaleDateString()} ·{" "}
                  {scheduled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>
                  {meeting.consultantName} · {meeting.meetingId}
                </span>
                <ConsultationStatusBadge status={meeting.status} />
              </>
            );

            if (!onSelect) {
              return (
                <li key={meeting.id} className="consultation-upcoming__item">
                  {content}
                </li>
              );
            }

            return (
              <li key={meeting.id}>
                <button
                  type="button"
                  className={`consultation-upcoming__button${
                    selectedId === meeting.id ? " consultation-upcoming__button--active" : ""
                  }`}
                  onClick={() => onSelect(meeting.id)}
                >
                  {content}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
