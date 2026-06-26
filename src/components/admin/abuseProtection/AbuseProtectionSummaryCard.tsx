import { ABUSE_RISK_LEVEL_LABELS } from "../../../constants/abuseProtection";
import type { AbuseProtectionSummary } from "../../../types/abuseProtection";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type AbuseProtectionSummaryCardProps = {
  summary: AbuseProtectionSummary;
};

const BADGE_STATUS = {
  low: "healthy" as const,
  medium: "warning" as const,
  high: "warning" as const,
  critical: "critical" as const
};

export function AbuseProtectionSummaryCard({ summary }: AbuseProtectionSummaryCardProps) {
  return (
    <section className="abuse-protection-summary concierge-consultant-card--glass cc-reveal">
      <header className="abuse-protection-summary__head">
        <div>
          <h3>Live protection status</h3>
          <InstitutionalStatusBadge
            status={BADGE_STATUS[summary.overallRisk]}
            label={`${ABUSE_RISK_LEVEL_LABELS[summary.overallRisk]} risk`}
          />
        </div>
        <p>Last checked {new Date(summary.lastCheckedAt).toLocaleString()}</p>
      </header>
      <div className="abuse-protection-summary__grid">
        <div className="abuse-protection-summary__stat">
          <strong>{summary.blockedRequests24h}</strong>
          <span>Blocked requests (24h)</span>
        </div>
        <div className="abuse-protection-summary__stat">
          <strong>{summary.temporaryBans}</strong>
          <span>Temporary bans</span>
        </div>
        <div className="abuse-protection-summary__stat">
          <strong>{summary.permanentBans}</strong>
          <span>Permanent bans</span>
        </div>
        <div className="abuse-protection-summary__stat abuse-protection-summary__stat--alert">
          <strong>{summary.suspiciousOpen}</strong>
          <span>Suspicious activity</span>
        </div>
      </div>
    </section>
  );
}
