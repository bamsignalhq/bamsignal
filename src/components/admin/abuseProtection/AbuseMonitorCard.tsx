import { ABUSE_MONITOR_LABELS, ABUSE_RISK_LEVEL_LABELS } from "../../../constants/abuseProtection";
import type { AbuseMonitorRecord } from "../../../types/abuseProtection";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type AbuseMonitorCardProps = {
  monitors: AbuseMonitorRecord[];
};

const BADGE_STATUS = {
  low: "healthy" as const,
  medium: "warning" as const,
  high: "warning" as const,
  critical: "critical" as const
};

export function AbuseMonitorCard({ monitors }: AbuseMonitorCardProps) {
  return (
    <section className="abuse-protection-monitors concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Abuse monitors</h3>
        <p>OTP, login, spam, fraud, bots, referrals, consultations, and payments.</p>
      </header>
      <div className="abuse-protection-monitors__grid">
        {monitors.map((monitor) => (
          <article key={monitor.id} className={`abuse-protection-monitor abuse-protection-monitor--${monitor.riskLevel}`}>
            <div className="abuse-protection-monitor__head">
              <strong>{ABUSE_MONITOR_LABELS[monitor.id]}</strong>
              {monitor.critical ? <span className="abuse-protection-monitor__tag">Critical</span> : null}
            </div>
            <InstitutionalStatusBadge
              status={BADGE_STATUS[monitor.riskLevel]}
              label={ABUSE_RISK_LEVEL_LABELS[monitor.riskLevel]}
            />
            <dl className="abuse-protection-monitor__stats">
              <div>
                <dt>Events (24h)</dt>
                <dd>{monitor.eventCount24h}</dd>
              </div>
              <div>
                <dt>Blocked</dt>
                <dd>{monitor.blockedCount24h}</dd>
              </div>
              <div>
                <dt>Trend</dt>
                <dd>{monitor.trend}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
