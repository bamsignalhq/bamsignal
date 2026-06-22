import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  PRAYER_CARD_LABEL
} from "../../../constants/reflectionRoom";
import type { PrayerCardViewModel } from "../../../utils/reflectionRoomLogic";

type PrayerCardProps = {
  prayer: PrayerCardViewModel;
};

export function PrayerCard({ prayer }: PrayerCardProps) {
  return (
    <article className="rfrm-prayer-card institute-glass">
      <header className="rfrm-prayer-card__head">
        <h3>{prayer.title}</h3>
        <span className="rfrm-prayer-card__badge">{PRAYER_CARD_LABEL}</span>
      </header>
      <p className="rfrm-prayer-card__description">{prayer.description}</p>
      <p className="rfrm-prayer-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="rfrm-prayer-card__status">{prayer.statusLabel}</p>
    </article>
  );
}
