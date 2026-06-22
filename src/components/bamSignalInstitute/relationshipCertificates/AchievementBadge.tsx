import {
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_CERTIFICATES_LABEL
} from "../../../constants/relationshipCertificates";
import type { AchievementBadgeViewModel } from "../../../utils/relationshipCertificatesLogic";

type AchievementBadgeProps = {
  badge: AchievementBadgeViewModel;
};

export function AchievementBadge({ badge }: AchievementBadgeProps) {
  return (
    <article className="rcert-achievement-badge institute-glass">
      <header className="rcert-achievement-badge__head">
        <h3>{badge.label}</h3>
        <span className="rcert-achievement-badge__badge">{RELATIONSHIP_CERTIFICATES_LABEL}</span>
      </header>

      <p className="rcert-achievement-badge__labels">{GROWING_TOGETHER_LABEL}</p>
      <p className="rcert-achievement-badge__tier">{badge.tier}</p>
      <p className="rcert-achievement-badge__certificate">{badge.certificateTitle}</p>
      <p className="rcert-achievement-badge__focus">{badge.focus}</p>
      <p className="rcert-achievement-badge__status">{badge.statusLabel}</p>
    </article>
  );
}
