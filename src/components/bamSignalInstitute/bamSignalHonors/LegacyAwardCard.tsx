import {
  BAMSIGNAL_HONORS_FORBIDDEN_COPY,
  CELEBRATING_LEGACY_LABEL,
  LEGACY_AWARD_LABEL
} from "../../../constants/bamSignalHonors";
import type { LegacyAwardViewModel } from "../../../utils/bamSignalHonorsLogic";

type LegacyAwardCardProps = {
  award: LegacyAwardViewModel;
};

export function LegacyAwardCard({ award }: LegacyAwardCardProps) {
  return (
    <article className="bshn-award-card institute-glass">
      <header className="bshn-award-card__head">
        <h3>{award.title}</h3>
        <span className="bshn-award-card__badge">{LEGACY_AWARD_LABEL}</span>
      </header>
      <p className="bshn-award-card__legacy">{CELEBRATING_LEGACY_LABEL}</p>
      <p className="bshn-award-card__category">{award.categoryTitle}</p>
      <p className="bshn-award-card__description">{award.description}</p>
      <p className="bshn-award-card__forbidden">
        Not {BAMSIGNAL_HONORS_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bshn-award-card__status">{award.statusLabel}</p>
    </article>
  );
}
