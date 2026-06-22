import {
  LEGACY_STATUS_LABEL,
  LEGACY_TRUST_LABEL,
  TRUST_JOURNEY_LABEL
} from "../../../constants/trustScoreInstitute";
import type { LegacyTrustViewModel } from "../../../utils/trustScoreInstituteLogic";

type LegacyTrustCardProps = {
  profile: LegacyTrustViewModel;
};

export function LegacyTrustCard({ profile }: LegacyTrustCardProps) {
  return (
    <article className="tscr-legacy-card institute-glass">
      <header className="tscr-legacy-card__head">
        <h3>{profile.title}</h3>
        <span className="tscr-legacy-card__badge">{LEGACY_TRUST_LABEL}</span>
      </header>

      <dl className="tscr-legacy-card__display">
        <div>
          <dt>{TRUST_JOURNEY_LABEL}</dt>
          <dd>{profile.journeyNote}</dd>
        </div>
        <div>
          <dt>{LEGACY_STATUS_LABEL}</dt>
          <dd>{profile.statusSummary}</dd>
        </div>
      </dl>
      <p className="tscr-legacy-card__level">{profile.levelTitle}</p>
      <p className="tscr-legacy-card__status">{profile.statusLabel}</p>
    </article>
  );
}
