import { BALLROOM_SUMMIT_LABEL, BAMSIGNAL_HOUSE_FORBIDDEN_COPY } from "../../../constants/ballroom";
import type { SummitCardViewModel } from "../../../utils/ballroomLogic";

type SummitCardProps = {
  summit: SummitCardViewModel;
};

export function SummitCard({ summit }: SummitCardProps) {
  return (
    <article className="blrm-summit-card institute-glass">
      <header className="blrm-summit-card__head">
        <h3>{summit.title}</h3>
        <span className="blrm-summit-card__badge">{BALLROOM_SUMMIT_LABEL}</span>
      </header>
      <p className="blrm-summit-card__description">{summit.description}</p>
      <p className="blrm-summit-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="blrm-summit-card__status">{summit.statusLabel}</p>
    </article>
  );
}
