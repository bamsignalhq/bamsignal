import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  REFLECTION_CARD_LABEL
} from "../../../constants/reflectionRoom";
import type { ReflectionCardViewModel } from "../../../utils/reflectionRoomLogic";

type ReflectionCardProps = {
  reflection: ReflectionCardViewModel;
};

export function ReflectionCard({ reflection }: ReflectionCardProps) {
  return (
    <article className="rfrm-reflection-card institute-glass">
      <header className="rfrm-reflection-card__head">
        <h3>{reflection.title}</h3>
        <span className="rfrm-reflection-card__badge">{REFLECTION_CARD_LABEL}</span>
      </header>
      <p className="rfrm-reflection-card__description">{reflection.description}</p>
      <p className="rfrm-reflection-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="rfrm-reflection-card__status">{reflection.statusLabel}</p>
    </article>
  );
}
