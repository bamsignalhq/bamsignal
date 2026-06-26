import { PERFORMANCE_ENGINEERING_TOOLS, type PerformanceEngineeringToolId } from "../../../constants/performanceCenter";
import type { PerformanceToolRun } from "../../../types/performanceCenter";

type PerformanceEngineeringToolsCardProps = {
  toolRuns: PerformanceToolRun[];
  busyTool: string | null;
  onTool: (toolId: PerformanceEngineeringToolId) => void;
};

export function PerformanceEngineeringToolsCard({
  toolRuns,
  busyTool,
  onTool
}: PerformanceEngineeringToolsCardProps) {
  return (
    <section className="performance-center-card performance-tools-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Tools</h3>
        <p>Bundle analysis, image audit, unused code, code splitting, and caching diagnostics.</p>
      </header>
      <div className="performance-tools-card__grid">
        {PERFORMANCE_ENGINEERING_TOOLS.map((tool) => (
          <article key={tool.id} className="performance-tools-card__item">
            <h4>{tool.label}</h4>
            <p>{tool.description}</p>
            <button
              type="button"
              className="concierge-consultant-btn"
              disabled={busyTool === tool.id}
              onClick={() => onTool(tool.id)}
            >
              {busyTool === tool.id ? "Running…" : "Run"}
            </button>
          </article>
        ))}
      </div>
      {toolRuns.length ? (
        <div className="performance-tools-card__history">
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
