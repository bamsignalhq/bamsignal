import { ABUSE_RISK_LEVEL_LABELS } from "../../../constants/abuseProtection";
import type { AbuseForensicsRecord } from "../../../types/abuseProtection";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type AbuseForensicsCardProps = {
  forensics: AbuseForensicsRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const BADGE_STATUS = {
  low: "healthy" as const,
  medium: "warning" as const,
  high: "warning" as const,
  critical: "critical" as const
};

export function AbuseForensicsCard({ forensics, selectedId, onSelect }: AbuseForensicsCardProps) {
  const selected = forensics.find((item) => item.id === selectedId) ?? forensics[0] ?? null;

  return (
    <section className="abuse-protection-forensics concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Forensics</h3>
        <p>Request timeline, linked accounts, devices, sessions, and risk score.</p>
      </header>

      <div className="abuse-protection-forensics__layout">
        <ul className="abuse-protection-forensics__list">
          {forensics.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                className={`abuse-protection-forensics__pick${selected?.id === record.id ? " is-selected" : ""}`}
                onClick={() => onSelect(record.id)}
              >
                <code>{record.target}</code>
                <span>Risk {record.riskScore}</span>
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <div className="abuse-protection-forensics__detail">
            <header>
              <h4>{selected.target}</h4>
              <InstitutionalStatusBadge
                status={BADGE_STATUS[selected.riskLevel]}
                label={`${ABUSE_RISK_LEVEL_LABELS[selected.riskLevel]} · ${selected.riskScore}`}
              />
            </header>
            <dl className="abuse-protection-forensics__links">
              <div>
                <dt>Linked accounts</dt>
                <dd>{selected.linkedAccounts.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt>Devices</dt>
                <dd>{selected.devices.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt>Sessions</dt>
                <dd>{selected.sessions.join(", ") || "—"}</dd>
              </div>
            </dl>
            <ol className="abuse-protection-forensics__timeline">
              {selected.timeline.map((entry, index) => (
                <li key={`${selected.id}-${index}`}>
                  <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
                  <strong>{entry.action}</strong>
                  <span>{entry.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}
