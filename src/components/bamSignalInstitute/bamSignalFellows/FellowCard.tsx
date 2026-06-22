import {
  FELLOW_LABEL,
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/bamSignalFellows";
import type { FellowViewModel } from "../../../utils/bamSignalFellowsLogic";

type FellowCardProps = {
  fellow: FellowViewModel;
};

export function FellowCard({ fellow }: FellowCardProps) {
  return (
    <article className="bsf-fellow-card institute-glass">
      <header className="bsf-fellow-card__head">
        <h3>{fellow.name}</h3>
        <span className="bsf-fellow-card__badge">{FELLOW_LABEL}</span>
      </header>

      <p className="bsf-fellow-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="bsf-fellow-card__specialty">{fellow.specialtyTitle}</p>
      <p className="bsf-fellow-card__title">{fellow.title}</p>
      <p className="bsf-fellow-card__focus">{fellow.focus}</p>
      <p className="bsf-fellow-card__status">{fellow.statusLabel}</p>
    </article>
  );
}
