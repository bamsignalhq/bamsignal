import {
  LOVE_THROUGH_YEARS_FUTURE_CAPABILITIES,
  LOVE_THROUGH_YEARS_PHOTO_RESERVED_COPY,
  LOVE_THROUGH_YEARS_RESERVED_COPY
} from "../../../../constants/loveThroughYears";
import type { LoveThroughYearsPhotoSlot } from "../../../../constants/loveThroughYears";

type MilestonePhotoCardProps = {
  photoSlots: LoveThroughYearsPhotoSlot[];
};

export function MilestonePhotoCard({ photoSlots }: MilestonePhotoCardProps) {
  return (
    <section className="milestone-photo-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Milestone photos</h3>
        <p>{LOVE_THROUGH_YEARS_PHOTO_RESERVED_COPY}</p>
      </header>

      <ul className="milestone-photo-card__grid">
        {photoSlots.map((slot) => (
          <li key={slot.id} className="milestone-photo-card__slot">
            <span className="milestone-photo-card__placeholder" aria-hidden />
            <strong>{slot.label}</strong>
            <span className="milestone-photo-card__status">Reserved</span>
          </li>
        ))}
      </ul>

      <div className="milestone-photo-card__future">
        <h4>Future ready</h4>
        <ul>
          {LOVE_THROUGH_YEARS_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="milestone-photo-card__reserved">{LOVE_THROUGH_YEARS_RESERVED_COPY}</p>
    </section>
  );
}
