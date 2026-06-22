import { CALENDAR_ENGINE_BRAND } from "../../constants/calendar";
import type { CalendarAvailability } from "../../types/calendar";

type CalendarCardProps = {
  availability: CalendarAvailability;
  selectedSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
};

export function CalendarCard({ availability, selectedSlotId, onSelectSlot }: CalendarCardProps) {
  const openSlots = availability.slots.filter((slot) => slot.available);

  return (
    <section className="calendar-card signal-concierge-glass sc-reveal">
      <header className="calendar-card__head">
        <h3>{CALENDAR_ENGINE_BRAND}</h3>
        <p>
          Private scheduling with {availability.consultantName} · {availability.timezone}
        </p>
      </header>

      {openSlots.length ? (
        <ul className="calendar-card__slots">
          {openSlots.map((slot) => {
            const selected = selectedSlotId === slot.id;
            const label = new Date(slot.startsAt).toLocaleString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
            if (!onSelectSlot) {
              return (
                <li key={slot.id} className="calendar-card__slot">
                  <strong>{label}</strong>
                  <span>{slot.durationMinutes} minutes</span>
                </li>
              );
            }
            return (
              <li key={slot.id}>
                <button
                  type="button"
                  className={`calendar-card__slot-button${selected ? " calendar-card__slot-button--selected" : ""}`}
                  onClick={() => onSelectSlot(slot.id)}
                >
                  <strong>{label}</strong>
                  <span>{slot.durationMinutes} minutes</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="calendar-card__empty">No open consultation slots right now. Your steward will reach out privately.</p>
      )}
    </section>
  );
}
