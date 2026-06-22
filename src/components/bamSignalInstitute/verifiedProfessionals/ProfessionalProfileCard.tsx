import {
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  VERIFIED_PROFILE_LABEL
} from "../../../constants/verifiedProfessionals";
import type { ProfessionalProfileViewModel } from "../../../utils/verifiedProfessionalsLogic";

type ProfessionalProfileCardProps = {
  profile: ProfessionalProfileViewModel;
};

export function ProfessionalProfileCard({ profile }: ProfessionalProfileCardProps) {
  return (
    <article className="vp-profile-card institute-glass">
      <header className="vp-profile-card__head">
        <h3>{profile.name}</h3>
        <span className="vp-profile-card__badge">{VERIFIED_PROFILE_LABEL}</span>
      </header>

      <p className="vp-profile-card__labels">
        {LEARNING_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="vp-profile-card__badge-title">{profile.badgeTitle}</p>
      <p className="vp-profile-card__title">{profile.title}</p>
      <p className="vp-profile-card__focus">{profile.focus}</p>
      <p className="vp-profile-card__status">{profile.statusLabel}</p>
    </article>
  );
}
