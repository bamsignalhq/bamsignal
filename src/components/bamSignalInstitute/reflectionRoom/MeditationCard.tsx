import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  MEDITATION_CARD_LABEL
} from "../../../constants/reflectionRoom";
import type { MeditationCardViewModel } from "../../../utils/reflectionRoomLogic";

type MeditationCardProps = {
  meditation: MeditationCardViewModel;
};

export function MeditationCard({ meditation }: MeditationCardProps) {
  return (
    <article className="rfrm-meditation-card institute-glass">
      <header className="rfrm-meditation-card__head">
        <h3>{meditation.title}</h3>
        <span className="rfrm-meditation-card__badge">{MEDITATION_CARD_LABEL}</span>
      </header>
      <p className="rfrm-meditation-card__description">{meditation.description}</p>
      <p className="rfrm-meditation-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="rfrm-meditation-card__status">{meditation.statusLabel}</p>
    </article>
  );
}
