import { DATA_GOVERNANCE_TOOLS } from "../../../constants/dataGovernanceCenter";
import type { DataGovernanceToolId } from "../../../constants/dataGovernanceCenter";

type GovernanceToolsCardProps = {
  onTool: (toolId: DataGovernanceToolId) => void;
  busyTool: string | null;
};

export function GovernanceToolsCard({ onTool, busyTool }: GovernanceToolsCardProps) {
  return (
    <section className="data-governance-card governance-tools-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Governance tools</h3>
        <p>Export member, delete member, anonymize, retention rules, and policy versions.</p>
      </header>
      <div className="governance-tools-card__grid">
        {DATA_GOVERNANCE_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="governance-tool-chip"
            disabled={busyTool === tool.id}
            onClick={() => onTool(tool.id)}
          >
            <strong>{tool.label}</strong>
            <span>{busyTool === tool.id ? "Working…" : tool.hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
