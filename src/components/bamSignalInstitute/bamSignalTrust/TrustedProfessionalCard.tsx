import {
  BAMSIGNAL_TRUST_GUIDANCE_COPY,
  BAMSIGNAL_TRUST_SUPPORT_COPY,
  TRUSTED_PROFESSIONAL_LABEL
} from "../../../constants/bamSignalTrust";
import type { TrustedProfessionalViewModel } from "../../../utils/bamSignalTrustLogic";

type TrustedProfessionalCardProps = {
  professional: TrustedProfessionalViewModel;
};

export function TrustedProfessionalCard({ professional }: TrustedProfessionalCardProps) {
  return (
    <article className="bst-professional-card institute-glass">
      <header className="bst-professional-card__head">
        <h3>{professional.name}</h3>
        <span className="bst-professional-card__badge">{TRUSTED_PROFESSIONAL_LABEL}</span>
      </header>

      <p className="bst-professional-card__labels">
        {BAMSIGNAL_TRUST_GUIDANCE_COPY} · {BAMSIGNAL_TRUST_SUPPORT_COPY}
      </p>
      <p className="bst-professional-card__category">{professional.categoryTitle}</p>
      <p className="bst-professional-card__title">{professional.title}</p>
      <p className="bst-professional-card__focus">{professional.focus}</p>
      <p className="bst-professional-card__status">{professional.statusLabel}</p>
    </article>
  );
}
