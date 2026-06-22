import type { CalendarAvailability } from "../../types/calendar";
import { CONSULTATION_SCHEDULING_ENGINE_BRAND } from "../../constants/consultationScheduling";

type AvailabilityCardProps = {
  availability: CalendarAvailability;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AvailabilityCard({ availability }: AvailabilityCardProps) {
  const open = availability.slots.filter((slot) => slot.available).length;
  const total = availability.slots.length;
  const days =
    "availableDays" in availability && Array.isArray(availability.availableDays)
      ? availability.availableDays.map((day) => DAY_LABELS[day] ?? String(day)).join(", ")
      : "Mon–Fri";
  const hours =
    "availableHours" in availability && Array.isArray(availability.availableHours)
      ? availability.availableHours.map((hour) => `${hour}:00`).join(", ")
      : "10:00, 14:00, 16:00";
  const blackouts =
    "blackoutPeriods" in availability && Array.isArray(availability.blackoutPeriods)
      ? availability.blackoutPeriods.length
      : 0;

  return (
    <section className="availability-card signal-concierge-glass sc-reveal">
      <header className="availability-card__head">
        <h3>Consultant availability</h3>
        <p>{CONSULTATION_SCHEDULING_ENGINE_BRAND} — choose a time for your private consultation.</p>
      </header>
      <dl className="availability-card__grid">
        <div>
          <dt>Steward</dt>
          <dd>{availability.consultantName}</dd>
        </div>
        <div>
          <dt>Open slots</dt>
          <dd>
            {open} of {total}
          </dd>
        </div>
        <div>
          <dt>Timezone</dt>
          <dd>{availability.timezone}</dd>
        </div>
        <div>
          <dt>Days</dt>
          <dd>{days}</dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>{hours}</dd>
        </div>
        {blackouts ? (
          <div>
            <dt>Blackout periods</dt>
            <dd>{blackouts}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
