import { DATA_CLASS_LABELS } from "../../../constants/dataGovernanceCenter";
import type { DataGovernanceSummary, DataInventoryItem } from "../../../types/dataGovernanceCenter";
import { formatDataGovernanceSummaryLine } from "../../../utils/dataGovernanceCenterLogic";

type DataInventoryCardProps = {
  summary: DataGovernanceSummary;
  inventory: DataInventoryItem[];
};

export function DataInventoryCard({ summary, inventory }: DataInventoryCardProps) {
  return (
    <section className="data-governance-card data-inventory-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Data inventory</h3>
        <p>Classified data assets across systems — public through restricted.</p>
      </header>
      <p className="data-governance-card__line">{formatDataGovernanceSummaryLine(summary)}</p>
      <div className="data-governance-card__grid">
        <article>
          <span>Inventory items</span>
          <strong>{summary.inventoryCount}</strong>
        </article>
        <article>
          <span>Highly confidential</span>
          <strong>{summary.highlyConfidentialCount}</strong>
        </article>
      </div>
      {inventory.length ? (
        <ul className="data-governance-card__list">
          {inventory.map((item) => (
            <li key={item.id}>
              <div className="data-governance-card__row">
                <strong>{item.name}</strong>
                <span className={`data-class data-class--${item.dataClass}`}>
                  {DATA_CLASS_LABELS[item.dataClass]}
                </span>
              </div>
              <p>{item.inventoryRef} · {item.system}</p>
              <div className="data-governance-card__meta">
                <span>{item.recordCount.toLocaleString()} records</span>
                {item.containsPii ? <span>PII</span> : null}
                {item.containsSensitive ? <span>Sensitive</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No inventory items in this area.</p>
      )}
    </section>
  );
}
