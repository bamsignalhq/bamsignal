import {
  COMMUNITY_AMBASSADOR_LABEL,
  COMMUNITY_BUILDER_LABEL,
  LEGACY_ADVOCATE_LABEL,
  STEWARD_LABEL
} from "../../../constants/cityAmbassadors";
import type { CityAmbassadorViewModel } from "../../../utils/cityAmbassadorsLogic";
import { AmbassadorBadge } from "./AmbassadorBadge";

type CityAmbassadorCardProps = {
  ambassador: CityAmbassadorViewModel;
};

export function CityAmbassadorCard({ ambassador }: CityAmbassadorCardProps) {
  return (
    <article className="ca-ambassador-card signal-events-glass">
      <header className="ca-ambassador-card__head">
        <h3>{ambassador.title}</h3>
        <AmbassadorBadge role={ambassador.primaryRole} primary />
      </header>

      <p className="ca-ambassador-card__labels">
        {COMMUNITY_AMBASSADOR_LABEL} · {STEWARD_LABEL} · {LEGACY_ADVOCATE_LABEL} ·{" "}
        {COMMUNITY_BUILDER_LABEL}
      </p>

      <p className="ca-ambassador-card__description">{ambassador.description}</p>

      <dl className="ca-ambassador-card__display">
        {ambassador.displayRows.map((row) => (
          <div key={row.id} className="ca-ambassador-card__row">
            <dt>{row.label}</dt>
            <dd>{row.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
