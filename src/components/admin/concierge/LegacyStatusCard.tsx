import {
  CELEBRATING_YOUR_STORY_LABEL,
  FAMILY_LABEL,
  JOURNEY_LABEL,
  LEGACY_EXPERIENCE_STATUSES,
  LEGACY_LABEL,
  RELATIONSHIP_LEGACY_EXPERIENCE_SUBCOPY,
  RELATIONSHIP_LEGACY_EXPERIENCE_TITLE
} from "../../../constants/relationshipLegacyExperience";
import { LEGACY_STATUS_LABELS } from "../../../constants/relationshipLegacyIndex";
import type { LegacyStatusId } from "../../../constants/relationshipLegacyIndex";
import type { LegacyProfileViewModel } from "../../../utils/relationshipLegacyIndexLogic";
import { LegacyStatusBadge } from "../../signalConcierge/LegacyStatusBadge";

type LegacyStatusCardProps = {
  profile: LegacyProfileViewModel;
};

export function LegacyStatusCard({ profile }: LegacyStatusCardProps) {
  return (
    <section className="legacy-status-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{RELATIONSHIP_LEGACY_EXPERIENCE_TITLE}</h3>
        <p>{RELATIONSHIP_LEGACY_EXPERIENCE_SUBCOPY}</p>
      </header>

      <p className="legacy-status-card__labels">
        {LEGACY_LABEL} · {JOURNEY_LABEL} · {FAMILY_LABEL} · {CELEBRATING_YOUR_STORY_LABEL}
      </p>

      <div className="legacy-status-card__current">
        <span>Current legacy status</span>
        <LegacyStatusBadge status={profile.legacyStatus} />
      </div>

      <ul className="legacy-status-card__list">
        {LEGACY_EXPERIENCE_STATUSES.map((statusId) => (
          <li
            key={statusId}
            className={`legacy-status-card__item${
              profile.legacyStatus === statusId ? " is-active" : ""
            }`}
          >
            <LegacyStatusBadge status={statusId as LegacyStatusId} compact />
            <span>{LEGACY_STATUS_LABELS[statusId]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
