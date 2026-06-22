import { INSTITUTION_MAP_LABEL } from "../../../constants/houseOperatingSystem";
import type { InstitutionMapNodeViewModel } from "../../../types/houseOperatingSystem";

type InstitutionMapCardProps = {
  nodes: InstitutionMapNodeViewModel[];
};

export function InstitutionMapCard({ nodes }: InstitutionMapCardProps) {
  return (
    <section className="hos-map-card institute-glass">
      <header className="hos-card__head">
        <h2>{INSTITUTION_MAP_LABEL}</h2>
        <p>How House systems connect — umbrella view, not operational workflows.</p>
      </header>
      <ul className="hos-map-card__list">
        {nodes.map((node) => (
          <li key={node.id}>
            <div>
              <strong>{node.label}</strong>
              <span className="hos-map-card__system">{node.systemTitle}</span>
              <span className="hos-map-card__layer">{node.layer}</span>
            </div>
            <p>{node.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
