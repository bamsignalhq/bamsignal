import type { ConciergeMemberConsultantSummary } from "../../../types/conciergeConsultantDirectory";

const EXAMPLE_LINES = [
  "Looking for marriage within 2 years.",
  "Strong family values.",
  "Open to relocation.",
  "Prefers Christian partner.",
  "High compatibility with diaspora professionals."
];

type ConsultantSummaryCardProps = {
  summary?: ConciergeMemberConsultantSummary;
  editable?: boolean;
  onChange?: (lines: string[]) => void;
};

export function ConsultantSummaryCard({ summary, editable = false, onChange }: ConsultantSummaryCardProps) {
  const lines = summary?.lines ?? [];

  return (
    <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal consultant-summary-card">
      <header className="concierge-consultant-card__head">
        <h3>Consultant Summary</h3>
        <p>
          {summary?.source === "ai" ? "AI-assisted" : "Manual summary"}
          {summary ? " · Future AI-ready" : " · Add a warm, human read for your team"}
        </p>
      </header>
      {editable ? (
        <div className="consultant-summary-card__examples" aria-label="Summary examples">
          {EXAMPLE_LINES.map((example) => (
            <button
              key={example}
              type="button"
              className="consultant-summary-card__chip"
              onClick={() => onChange?.(lines.includes(example) ? lines : [...lines, example])}
            >
              {example}
            </button>
          ))}
        </div>
      ) : null}
      {lines.length ? (
        <ul className="consultant-summary-card__lines">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No consultant summary yet.</p>
      )}
      {summary?.updatedAt ? (
        <time className="consultant-summary-card__updated" dateTime={summary.updatedAt}>
          Updated {new Date(summary.updatedAt).toLocaleDateString()}
        </time>
      ) : null}
    </section>
  );
}
