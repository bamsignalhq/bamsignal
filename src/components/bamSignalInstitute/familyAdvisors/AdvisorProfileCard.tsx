import {
  ADVISOR_PROFILE_LABEL,
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/familyAdvisors";
import type { AdvisorProfileViewModel } from "../../../utils/familyAdvisorsLogic";

type AdvisorProfileCardProps = {
  advisor: AdvisorProfileViewModel;
};

export function AdvisorProfileCard({ advisor }: AdvisorProfileCardProps) {
  return (
    <article className="fadv-profile-card institute-glass">
      <header className="fadv-profile-card__head">
        <h3>{advisor.name}</h3>
        <span className="fadv-profile-card__badge">{ADVISOR_PROFILE_LABEL}</span>
      </header>

      <p className="fadv-profile-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="fadv-profile-card__specialty">{advisor.specialtyTitle}</p>
      <p className="fadv-profile-card__title">{advisor.title}</p>
      <p className="fadv-profile-card__focus">{advisor.focus}</p>
      <p className="fadv-profile-card__status">{advisor.statusLabel}</p>
    </article>
  );
}
