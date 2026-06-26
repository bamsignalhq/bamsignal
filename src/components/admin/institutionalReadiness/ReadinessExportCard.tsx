import { READINESS_EXPORT_TYPES, type ReadinessExportTypeId } from "../../../constants/institutionalReadiness";
import type { ReadinessExportRecord } from "../../../types/institutionalReadiness";

type ReadinessExportCardProps = {
  exports: ReadinessExportRecord[];
  busyExport: string | null;
  onExport: (exportType: ReadinessExportTypeId) => void;
};

export function ReadinessExportCard({ exports, busyExport, onExport }: ReadinessExportCardProps) {
  return (
    <section className="readiness-verification-card readiness-export-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Export</h3>
        <p>Founder report, board report, and launch report for institutional stakeholders.</p>
      </header>
      <div className="readiness-export-card__grid">
        {READINESS_EXPORT_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="readiness-export-chip"
            disabled={busyExport === item.id}
            onClick={() => onExport(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{busyExport === item.id ? "Generating…" : "Download summary"}</span>
          </button>
        ))}
      </div>
      {exports.length ? (
        <div className="readiness-export-card__history">
          <h4>Recent exports</h4>
          <ul>
            {exports.slice(0, 5).map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong> — {item.summary}
                <span>{new Date(item.exportedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
