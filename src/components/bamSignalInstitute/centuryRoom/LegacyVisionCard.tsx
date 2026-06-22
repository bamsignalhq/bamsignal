import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, LEGACY_VISION_LABEL } from "../../../constants/centuryRoom";
import type { LegacyVisionCardViewModel } from "../../../utils/centuryRoomLogic";

type LegacyVisionCardProps = {
  vision: LegacyVisionCardViewModel;
};

export function LegacyVisionCard({ vision }: LegacyVisionCardProps) {
  return (
    <article className="croom-vision-card institute-glass">
      <header className="croom-vision-card__head">
        <h3>{vision.title}</h3>
        <span className="croom-vision-card__badge">{LEGACY_VISION_LABEL}</span>
      </header>
      <p className="croom-vision-card__order">Display {vision.displayOrder}</p>
      <p className="croom-vision-card__description">{vision.description}</p>
      <p className="croom-vision-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="croom-vision-card__status">{vision.statusLabel}</p>
    </article>
  );
}
