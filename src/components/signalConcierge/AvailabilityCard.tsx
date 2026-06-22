import type { CalendarAvailability } from "../../types/calendar";

type AvailabilityCardProps = {
  availability: CalendarAvailability;
};

export function AvailabilityCard({ availability }: AvailabilityCardProps) {
  const open = availability.slots.filter((slot) => slot.available).length;
  const total = availability.slots.length;

  return (
    <section className="availability-card signal-concierge-glass sc-reveal">
      <header className="availability-card__head">
        <h3>Consultant availability</h3>
        <p>Choose a time that works for your private consultation.</p>
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
      </dl>
    </section>
  );
}
