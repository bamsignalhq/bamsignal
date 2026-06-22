import type { NavigationMapEntry } from "../../../types/routeAudit";

type NavigationMapCardProps = {
  entries: NavigationMapEntry[];
};

export function NavigationMapCard({ entries }: NavigationMapCardProps) {
  return (
    <section className="navigation-map-card concierge-consultant-card--glass cc-reveal">
      <header className="navigation-map-card__head">
        <h3>Navigation map</h3>
        <p>Admin console sections and nested admin paths — linked vs unlinked entries.</p>
      </header>

      <div className="navigation-map-card__table" role="table" aria-label="Navigation map">
        <div className="navigation-map-card__row navigation-map-card__row--head" role="row">
          <span role="columnheader">Section</span>
          <span role="columnheader">Label</span>
          <span role="columnheader">Path</span>
          <span role="columnheader">Linked</span>
        </div>
        {entries.map((entry) => (
          <div key={entry.id} className="navigation-map-card__row" role="row">
            <span role="cell">{entry.section}</span>
            <span role="cell">{entry.label}</span>
            <span role="cell"><code>{entry.path}</code></span>
            <span role="cell">{entry.linked ? "Yes" : "Nested"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
