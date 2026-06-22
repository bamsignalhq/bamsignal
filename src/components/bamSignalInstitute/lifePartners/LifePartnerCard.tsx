import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LIFE_PARTNER_LABEL
} from "../../../constants/lifePartners";
import type { LifePartnerViewModel } from "../../../utils/lifePartnersLogic";

type LifePartnerCardProps = {
  partner: LifePartnerViewModel;
};

export function LifePartnerCard({ partner }: LifePartnerCardProps) {
  return (
    <article className="lpr-partner-card institute-glass">
      <header className="lpr-partner-card__head">
        <h3>{partner.name}</h3>
        <span className="lpr-partner-card__badge">{LIFE_PARTNER_LABEL}</span>
      </header>

      <p className="lpr-partner-card__labels">
        {GROWING_TOGETHER_LABEL} · {LEARNING_LABEL}
      </p>
      <p className="lpr-partner-card__specialty">{partner.specialtyTitle}</p>
      <p className="lpr-partner-card__title">{partner.title}</p>
      <p className="lpr-partner-card__focus">{partner.focus}</p>
      <p className="lpr-partner-card__status">{partner.statusLabel}</p>
    </article>
  );
}
