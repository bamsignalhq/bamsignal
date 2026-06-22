import {
  COACH_PROFILE_LABEL,
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/relationshipCoachNetwork";
import type { CoachProfileViewModel } from "../../../utils/relationshipCoachNetworkLogic";

type CoachProfileCardProps = {
  profile: CoachProfileViewModel;
};

export function CoachProfileCard({ profile }: CoachProfileCardProps) {
  return (
    <article className="rcn-profile-card institute-glass">
      <header className="rcn-profile-card__head">
        <h3>{profile.name}</h3>
        <span className="rcn-profile-card__badge">{COACH_PROFILE_LABEL}</span>
      </header>

      <p className="rcn-profile-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="rcn-profile-card__specialty">{profile.specialtyTitle}</p>
      <p className="rcn-profile-card__title">{profile.title}</p>
      <p className="rcn-profile-card__focus">{profile.focus}</p>
      <p className="rcn-profile-card__status">{profile.statusLabel}</p>
    </article>
  );
}
