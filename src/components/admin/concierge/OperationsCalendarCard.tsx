import {
  OPERATIONS_CONSULTATION_BUCKET_LABELS,
  OPERATIONS_CONSULTATION_BUCKETS
} from "../../../constants/operationsCenter";
import { CONSULTATION_EVENT_STATUS_LABELS } from "../../../constants/consultationScheduling";
import type { OperationsCenterBundle } from "../../../types/operationsCenter";

type OperationsCalendarCardProps = {
  bundle: OperationsCenterBundle;
};

function SchedulingList({
  title,
  rows,
  emptyLabel
}: {
  title: string;
  rows: OperationsCenterBundle["scheduling"]["todayCalendar"];
  emptyLabel: string;
}) {
  return (
    <div className="operations-center-panel__block">
      <h4>{title}</h4>
      {rows.length === 0 ? <p className="concierge-consultant__empty">{emptyLabel}</p> : null}
      <ul className="concierge-consultant-list">
        {rows.map((row) => (
          <li key={row.id} className="concierge-consultant-list__item">
            <div>
              <strong>{row.label}</strong>
              <span>{row.detail}</span>
            </div>
            {row.at ? (
              <time dateTime={row.at}>{new Date(row.at).toLocaleString()}</time>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OperationsCalendarCard({ bundle }: OperationsCalendarCardProps) {
  const { scheduling } = bundle;

  return (
    <section className="operations-center-scheduling concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Scheduling</h3>
        <p>Consultation Scheduling Engine™ and Meeting Infrastructure™</p>
      </header>

      <SchedulingList
        title="Today's Calendar"
        rows={scheduling.todayCalendar}
        emptyLabel="No consultations scheduled for today."
      />
      <SchedulingList
        title="Upcoming Bookings"
        rows={scheduling.upcomingBookings}
        emptyLabel="No upcoming bookings."
      />
      <SchedulingList
        title="Available Slots"
        rows={scheduling.availableSlots}
        emptyLabel="No open slots across consultant calendars."
      />
      <SchedulingList
        title="Consultant Calendars"
        rows={scheduling.consultantCalendars}
        emptyLabel="No consultant availability loaded."
      />

      <div className="operations-center-panel__block">
        <h4>Meeting Links</h4>
        {scheduling.meetingLinks.length === 0 ? (
          <p className="concierge-consultant__empty">No meeting links generated yet.</p>
        ) : null}
        <ul className="concierge-consultant-list">
          {scheduling.meetingLinks.map((row) => (
            <li key={row.id} className="concierge-consultant-list__item">
              <div>
                <strong>{row.memberName}</strong>
                <span>
                  {row.channel} · {row.status}
                </span>
                <span>{row.accessPreview}</span>
              </div>
              {row.scheduledAt ? (
                <time dateTime={row.scheduledAt}>{new Date(row.scheduledAt).toLocaleString()}</time>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OperationsConsultationCard({ bundle }: { bundle: OperationsCenterBundle }) {
  return (
    <section className="operations-center-consultations concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultations</h3>
        <p>Grouped by scheduling status from Consultation Scheduling Engine™</p>
      </header>
      {OPERATIONS_CONSULTATION_BUCKETS.map((bucket) => {
        const rows = bundle.consultations[bucket];
        return (
          <div key={bucket} className="operations-center-panel__block">
            <h4>
              {OPERATIONS_CONSULTATION_BUCKET_LABELS[bucket]} <strong>{rows.length}</strong>
            </h4>
            {rows.length === 0 ? (
              <p className="concierge-consultant__empty">No {OPERATIONS_CONSULTATION_BUCKET_LABELS[bucket].toLowerCase()} consultations.</p>
            ) : null}
            <ul className="concierge-consultant-list">
              {rows.slice(0, 8).map((row) => (
                <li key={row.id} className="concierge-consultant-list__item">
                  <div>
                    <strong>{row.memberName}</strong>
                    <span>
                      {row.consultantName} · {row.channel}
                    </span>
                    <span>{CONSULTATION_EVENT_STATUS_LABELS[row.status]}</span>
                    {row.outcomeLabel ? <span>Review: {row.outcomeLabel}</span> : null}
                    {row.recommendationLabel ? <span>{row.recommendationLabel}</span> : null}
                  </div>
                  <time dateTime={row.scheduledAt}>{new Date(row.scheduledAt).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
