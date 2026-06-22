import {
  GROWING_TOGETHER_LABEL,
  IMMIGRATION_PARTNER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/diasporaServices";
import type { ImmigrationPartnerViewModel } from "../../../utils/diasporaServicesLogic";

type ImmigrationPartnerCardProps = {
  partner: ImmigrationPartnerViewModel;
};

export function ImmigrationPartnerCard({ partner }: ImmigrationPartnerCardProps) {
  return (
    <article className="dias-partner-card institute-glass">
      <header className="dias-partner-card__head">
        <h3>{partner.name}</h3>
        <span className="dias-partner-card__badge">{IMMIGRATION_PARTNER_LABEL}</span>
      </header>

      <p className="dias-partner-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="dias-partner-card__service">{partner.serviceTitle}</p>
      <p className="dias-partner-card__title">{partner.title}</p>
      <p className="dias-partner-card__focus">{partner.focus}</p>
      <p className="dias-partner-card__status">{partner.statusLabel}</p>
    </article>
  );
}
