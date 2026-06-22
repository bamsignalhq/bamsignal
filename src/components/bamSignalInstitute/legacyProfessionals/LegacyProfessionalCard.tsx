import {
  LEGACY_PROFESSIONAL_LABEL,
  LEGACY_PROFESSIONALS_FORBIDDEN_COPY,
  TRUSTED_ADVISOR_LABEL
} from "../../../constants/legacyProfessionals";
import type { LegacyProfessionalViewModel } from "../../../utils/legacyProfessionalsLogic";

type LegacyProfessionalCardProps = {
  professional: LegacyProfessionalViewModel;
};

export function LegacyProfessionalCard({ professional }: LegacyProfessionalCardProps) {
  return (
    <article className="lgpr-professional-card institute-glass">
      <header className="lgpr-professional-card__head">
        <h3>{professional.name}</h3>
        <span className="lgpr-professional-card__badge">{LEGACY_PROFESSIONAL_LABEL}</span>
      </header>

      <p className="lgpr-professional-card__labels">
        {TRUSTED_ADVISOR_LABEL} — not {LEGACY_PROFESSIONALS_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="lgpr-professional-card__role">{professional.roleTitle}</p>
      <p className="lgpr-professional-card__title">{professional.title}</p>
      <p className="lgpr-professional-card__steward">{professional.stewardLabel}</p>
      <p className="lgpr-professional-card__focus">{professional.focus}</p>
      <p className="lgpr-professional-card__status">{professional.statusLabel}</p>
    </article>
  );
}
