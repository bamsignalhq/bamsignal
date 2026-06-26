import { ABUSE_RATE_LIMIT_DIMENSION_LABELS } from "../../../constants/abuseProtection";
import type { AbuseRateLimitRule } from "../../../types/abuseProtection";

type AbuseRateLimitsCardProps = {
  rateLimits: AbuseRateLimitRule[];
  onAdjust: (ruleId: string, direction: "increase-limits" | "decrease-limits") => void;
};

export function AbuseRateLimitsCard({ rateLimits, onAdjust }: AbuseRateLimitsCardProps) {
  return (
    <section className="abuse-protection-rate-limits concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Rate limits</h3>
        <p>Per IP, device, account, phone, email, session, and endpoint.</p>
      </header>
      <table className="abuse-protection-table">
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Endpoint</th>
            <th>Limit</th>
            <th>Window</th>
            <th>Usage</th>
            <th>Blocked today</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rateLimits.map((rule) => (
            <tr key={rule.id}>
              <td>{ABUSE_RATE_LIMIT_DIMENSION_LABELS[rule.dimension]}</td>
              <td><code>{rule.endpoint}</code></td>
              <td>{rule.limitPerWindow}</td>
              <td>{rule.windowMinutes}m</td>
              <td>{rule.currentUsage}</td>
              <td>{rule.blockedToday}</td>
              <td className="abuse-protection-table__actions">
                <button type="button" className="concierge-consultant-btn" onClick={() => onAdjust(rule.id, "decrease-limits")}>
                  −
                </button>
                <button type="button" className="concierge-consultant-btn" onClick={() => onAdjust(rule.id, "increase-limits")}>
                  +
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
