import type { WorkforceAvailabilitySlot } from "../../../types/workforceManagement";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AvailabilityCalendarCardProps = {
  availability: WorkforceAvailabilitySlot[];
  profileNames: Record<string, string>;
};

export function AvailabilityCalendarCard({
  availability,
  profileNames
}: AvailabilityCalendarCardProps) {
  return (
    <section className="workforce-card availability-calendar-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Availability calendar</h3>
        <p>Scheduled work hours and institutional availability windows.</p>
      </header>
      {availability.length === 0 ? (
        <p className="concierge-consultant__empty">No availability slots configured.</p>
      ) : (
        <ul className="availability-calendar-card__list">
          {availability.map((slot) => (
            <li key={slot.id}>
              <strong>{profileNames[slot.profileId] ?? slot.profileId}</strong>
              <span>
                {DAY_LABELS[slot.dayOfWeek]} · {slot.startTime}–{slot.endTime} ({slot.timezone})
              </span>
              <span className={slot.isAvailable ? "workforce-pill workforce-pill--ok" : "workforce-pill"}>
                {slot.isAvailable ? "Available" : "Blocked"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
