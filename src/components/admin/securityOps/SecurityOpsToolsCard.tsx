import { SECURITY_OPS_TOOLS } from "../../../constants/securityOperationsCenter";
import type { SecurityOpsToolId } from "../../../constants/securityOperationsCenter";

type SecurityOpsToolsCardProps = {
  onTool: (toolId: SecurityOpsToolId) => void;
  busyTool: string | null;
};

export function SecurityOpsToolsCard({ onTool, busyTool }: SecurityOpsToolsCardProps) {
  return (
    <section className="security-ops-card security-ops-tools-card concierge-consultant-card--glass cc-reveal">
      <header className="security-ops-card__head">
        <h3>Security tools</h3>
        <p>Invalidate sessions, force logout, rotate secrets, lock account, temporary and permanent blocks.</p>
      </header>
      <div className="security-ops-tools-card__grid">
        {SECURITY_OPS_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="security-ops-tool-chip"
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
