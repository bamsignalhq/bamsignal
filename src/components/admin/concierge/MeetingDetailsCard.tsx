import { CONSULTATION_CHANNEL_LABELS } from "../../../constants/consultationScheduler";
import type { ConsultationMeeting } from "../../../types/consultationScheduler";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";

type MeetingDetailsCardProps = {
  meeting: ConsultationMeeting;
};

export function MeetingDetailsCard({ meeting }: MeetingDetailsCardProps) {
  const scheduled = new Date(meeting.scheduledAt);

  return (
    <section className="consultation-meeting-details concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Meeting Details</h3>
        <p>{meeting.meetingId}</p>
      </header>
      <dl className="consultation-meeting-details__grid">
        <div>
          <dt>Consultant</dt>
          <dd>{meeting.consultantName}</dd>
        </div>
        <div>
          <dt>Journey ID</dt>
          <dd>{meeting.journeyId || "—"}</dd>
        </div>
        <div>
          <dt>Member</dt>
          <dd>{meeting.memberName}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{scheduled.toLocaleDateString()}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{scheduled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{meeting.durationMinutes} minutes</dd>
        </div>
        <div>
          <dt>Channel</dt>
          <dd>{CONSULTATION_CHANNEL_LABELS[meeting.channel]}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <ConsultationStatusBadge status={meeting.status} />
          </dd>
        </div>
      </dl>
      {meeting.notes ? (
        <div className="consultation-meeting-details__notes">
          <strong>Notes</strong>
          <p>{meeting.notes}</p>
        </div>
      ) : null}
      {meeting.participants.length ? (
        <div className="consultation-meeting-details__participants">
          <strong>Participants</strong>
          <ul>
            {meeting.participants.map((participant) => (
              <li key={participant.id}>
                {participant.name} · {participant.role}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
