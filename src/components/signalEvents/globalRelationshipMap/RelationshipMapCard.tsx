import type { RelationshipMapLayerId } from "../../../constants/globalRelationshipMap";
import { relationshipMapLayerLabel } from "../../../constants/globalRelationshipMap";

type RelationshipMapCardProps = {
  layer: RelationshipMapLayerId;
  title: string;
  subtitle: string;
  displayRows: { label: string; value: string }[];
};

export function RelationshipMapCard({ layer, title, subtitle, displayRows }: RelationshipMapCardProps) {
  return (
    <article className="grm-map-card signal-events-glass">
      <header className="grm-map-card__head">
        <h3>{title}</h3>
        <span className={`grm-map-card__badge grm-map-card__badge--${layer}`}>
          {relationshipMapLayerLabel(layer)}
        </span>
      </header>

      <p className="grm-map-card__subtitle">{subtitle}</p>

      <dl className="grm-map-card__display">
        {displayRows.map((row) => (
          <div key={`${layer}-${row.label}`} className="grm-map-card__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
