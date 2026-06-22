import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  FOUNDING_PRINCIPLES_LABEL
} from "../../../constants/centuryRoom";
import type { FoundingPrinciplesCardViewModel } from "../../../utils/centuryRoomLogic";

type FoundingPrinciplesCardProps = {
  principles: FoundingPrinciplesCardViewModel;
};

export function FoundingPrinciplesCard({ principles }: FoundingPrinciplesCardProps) {
  return (
    <article className="croom-principles-card institute-glass">
      <header className="croom-principles-card__head">
        <h3>{principles.title}</h3>
        <span className="croom-principles-card__badge">{FOUNDING_PRINCIPLES_LABEL}</span>
      </header>
      <p className="croom-principles-card__order">Display {principles.displayOrder}</p>
      <p className="croom-principles-card__description">{principles.description}</p>
      <p className="croom-principles-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="croom-principles-card__status">{principles.statusLabel}</p>
    </article>
  );
}
