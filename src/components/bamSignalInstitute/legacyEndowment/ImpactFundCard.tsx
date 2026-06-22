import {
  GIVING_BACK_LABEL,
  IMPACT_FUND_LABEL,
  LEGACY_ENDOWMENT_FORBIDDEN_COPY
} from "../../../constants/legacyEndowment";
import type { ImpactFundViewModel } from "../../../utils/legacyEndowmentLogic";

type ImpactFundCardProps = {
  fund: ImpactFundViewModel;
};

export function ImpactFundCard({ fund }: ImpactFundCardProps) {
  return (
    <article className="lgnd-fund-card institute-glass">
      <header className="lgnd-fund-card__head">
        <h3>{fund.title}</h3>
        <span className="lgnd-fund-card__badge">{IMPACT_FUND_LABEL}</span>
      </header>
      <p className="lgnd-fund-card__giving">{GIVING_BACK_LABEL}</p>
      <p className="lgnd-fund-card__program">{fund.programTitle}</p>
      <p className="lgnd-fund-card__description">{fund.description}</p>
      <p className="lgnd-fund-card__forbidden">
        Not {LEGACY_ENDOWMENT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lgnd-fund-card__status">{fund.statusLabel}</p>
    </article>
  );
}
