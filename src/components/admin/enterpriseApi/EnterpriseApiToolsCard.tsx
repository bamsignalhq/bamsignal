import { ENTERPRISE_API_TOOLS, type EnterpriseApiToolId } from "../../../constants/enterpriseApiCenter";
import type { EnterpriseApiToolRun } from "../../../types/enterpriseApiCenter";

type EnterpriseApiToolsCardProps = {
  toolRuns: EnterpriseApiToolRun[];
  busyTool: string | null;
  selectedEndpointRef: string | null;
  onTool: (toolId: EnterpriseApiToolId) => void;
};

export function EnterpriseApiToolsCard({
  toolRuns,
  busyTool,
  selectedEndpointRef,
  onTool
}: EnterpriseApiToolsCardProps) {
  return (
    <section className="enterprise-api-card enterprise-api-tools-card concierge-consultant-card--glass cc-reveal">
      <header className="enterprise-api-card__head">
        <h3>API tools</h3>
        <p>
          Disable endpoints, maintenance mode, retry failed jobs, replay requests, documentation, and
          OpenAPI export.
          {selectedEndpointRef ? ` Selected: ${selectedEndpointRef}` : ""}
        </p>
      </header>
      <div className="enterprise-api-tools-card__grid">
        {ENTERPRISE_API_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="enterprise-api-tool-chip"
            disabled={busyTool === tool.id}
            onClick={() => onTool(tool.id)}
          >
            <strong>{tool.label}</strong>
            <span>{busyTool === tool.id ? "Working…" : tool.hint}</span>
          </button>
        ))}
      </div>
      {toolRuns.length ? (
        <div className="enterprise-api-tools-card__history">
          <h4>Recent runs</h4>
          <ul>
            {toolRuns.slice(0, 5).map((run) => (
              <li key={run.id}>
                <strong>{run.toolId.replace(/-/g, " ")}</strong> — {run.summary}
                <span>{new Date(run.ranAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
