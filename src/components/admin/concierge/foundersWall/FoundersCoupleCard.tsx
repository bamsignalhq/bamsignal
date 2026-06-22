import {
  CELEBRATING_FIRST_STORIES_LABEL,
  LEGACY_COUPLES_LABEL
} from "../../../../constants/foundersWall";
import { buildFoundersWallDisplayRows, type FoundersCoupleViewModel } from "../../../../utils/foundersWallLogic";
import { LegacyStatusBadge } from "../../../signalConcierge/LegacyStatusBadge";
import { StoryCategoryBadge } from "../../../signalConcierge/StoryCategoryBadge";

type FoundersCoupleCardProps = {
  couple: FoundersCoupleViewModel;
};

export function FoundersCoupleCard({ couple }: FoundersCoupleCardProps) {
  const displayRows = buildFoundersWallDisplayRows(couple);

  return (
    <section className="founders-couple-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{LEGACY_COUPLES_LABEL}</h3>
        <p>{CELEBRATING_FIRST_STORIES_LABEL}</p>
      </header>

      <p className="founders-couple-card__order">Founder #{couple.founderOrder}</p>

      <dl className="founders-couple-card__display">
        {displayRows.map((row) => (
          <div key={row.id} className="founders-couple-card__row">
            <dt>{row.label}</dt>
            <dd>
              {row.id === "legacy-status" ? (
                <LegacyStatusBadge status={couple.legacyStatus} compact />
              ) : row.id === "story-categories" && couple.storyCategoryIds.length ? (
                <ul className="founders-couple-card__categories">
                  {couple.storyCategoryIds.map((categoryId) => (
                    <li key={categoryId}>
                      <StoryCategoryBadge categoryId={categoryId} />
                    </li>
                  ))}
                </ul>
              ) : (
                row.value ?? "—"
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
