import { CONSULTATION_CHANNEL_LABELS } from "../../../constants/consultationScheduler";
import { CONSULTATION_SCHEDULING_ENGINE_BRAND } from "../../../constants/consultationScheduling";
import type { ConsultationAvailability, ConsultationMeeting } from "../../../types/consultationScheduler";

type ConsultationCalendarCardProps = {
  availability: ConsultationAvailability[];
  meetings: ConsultationMeeting[];
};

function meetingsOnDay(meetings: ConsultationMeeting[], dayKey: string): ConsultationMeeting[] {
  return meetings.filter((meeting) => meeting.scheduledAt.slice(0, 10) === dayKey);
}

export function ConsultationCalendarCard({ availability, meetings }: ConsultationCalendarCardProps) {
  const upcoming = meetings.filter(
    (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now()
  );
  const dayKeys = [...new Set(upcoming.map((meeting) => meeting.scheduledAt.slice(0, 10)))].sort();

  return (
    <section className="consultation-calendar concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultation Calendar</h3>
        <p>{CONSULTATION_SCHEDULING_ENGINE_BRAND} — Google Calendar sync for consultant availability and invitations.</p>
      </header>

      {dayKeys.length ? (
        <div className="consultation-calendar__days">
          {dayKeys.map((dayKey) => (
            <div key={dayKey} className="consultation-calendar__day">
              <h4>{new Date(`${dayKey}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</h4>
              <ul>
                {meetingsOnDay(upcoming, dayKey).map((meeting) => (
                  <li key={meeting.id}>
                    <strong>
                      {new Date(meeting.scheduledAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </strong>
                    <span>
                      {meeting.memberName} · {CONSULTATION_CHANNEL_LABELS[meeting.channel]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="concierge-consultant__empty">No calendar entries for upcoming consultations.</p>
      )}

      {availability.length ? (
        <div className="consultation-calendar__availability">
          <h4>Consultant availability (preview)</h4>
          <ul>
            {availability.slice(0, 3).map((item) => {
              const openSlots = item.slots.filter((slot) => slot.available).length;
              return (
                <li key={item.consultantId}>
                  <strong>{item.consultantName}</strong>
                  <span>
                    {openSlots} open slot{openSlots === 1 ? "" : "s"} · {item.timezone}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
