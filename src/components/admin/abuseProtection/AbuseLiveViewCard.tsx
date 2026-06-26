import { ABUSE_MONITOR_LABELS, ABUSE_RISK_LEVEL_LABELS } from "../../../constants/abuseProtection";
import type {
  AbuseBlockRecord,
  AbuseCountryStat,
  AbuseOffendingIp,
  AbuseSuspiciousActivity
} from "../../../types/abuseProtection";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type AbuseLiveViewCardProps = {
  blocks: AbuseBlockRecord[];
  suspicious: AbuseSuspiciousActivity[];
  countryStats: AbuseCountryStat[];
  topIps: AbuseOffendingIp[];
  onTool: (tool: "unblock" | "blacklist" | "whitelist" | "manual-review", blockId: string) => void;
};

const BADGE_STATUS = {
  low: "healthy" as const,
  medium: "warning" as const,
  high: "warning" as const,
  critical: "critical" as const
};

export function AbuseLiveViewCard({
  blocks,
  suspicious,
  countryStats,
  topIps,
  onTool
}: AbuseLiveViewCardProps) {
  const tempBans = blocks.filter((item) => item.blockType === "temporary");
  const permBans = blocks.filter((item) => item.blockType === "permanent");

  return (
    <section className="abuse-protection-live concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Live view</h3>
        <p>Blocked requests, bans, suspicious activity, country distribution, and top offending IPs.</p>
      </header>

      <div className="abuse-protection-live__columns">
        <div>
          <h4>Temporary bans ({tempBans.length})</h4>
          {tempBans.map((block) => (
            <BlockRow key={block.id} block={block} onTool={onTool} />
          ))}
          <h4>Permanent bans ({permBans.length})</h4>
          {permBans.map((block) => (
            <BlockRow key={block.id} block={block} onTool={onTool} />
          ))}
        </div>

        <div>
          <h4>Suspicious activity</h4>
          {suspicious.map((item) => (
            <article key={item.id} className="abuse-protection-suspicious">
              <InstitutionalStatusBadge status={BADGE_STATUS[item.riskLevel]} label={ABUSE_RISK_LEVEL_LABELS[item.riskLevel]} />
              <p>{item.summary}</p>
              <span className="abuse-protection-suspicious__meta">
                {item.ip} · {item.country} · {ABUSE_MONITOR_LABELS[item.monitorId]}
              </span>
            </article>
          ))}

          <h4>Country distribution</h4>
          <ul className="abuse-protection-country-list">
            {countryStats.map((stat) => (
              <li key={stat.countryCode}>
                <strong>{stat.country}</strong>
                <span>{stat.blockedCount} blocked · {stat.suspiciousCount} suspicious</span>
              </li>
            ))}
          </ul>

          <h4>Top offending IPs</h4>
          <ul className="abuse-protection-ip-list">
            {topIps.map((item) => (
              <li key={item.ip}>
                <code>{item.ip}</code>
                <span>{item.country} · {item.blockedRequests} blocked · risk {item.riskScore}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function BlockRow({
  block,
  onTool
}: {
  block: AbuseBlockRecord;
  onTool: (tool: "unblock" | "blacklist" | "whitelist" | "manual-review", blockId: string) => void;
}) {
  return (
    <article className="abuse-protection-block">
      <div>
        <code>{block.target}</code>
        <span>{block.reason} · {block.country ?? "—"}</span>
      </div>
      <div className="abuse-protection-block__tools">
        <button type="button" className="concierge-consultant-btn" onClick={() => onTool("unblock", block.id)}>
          Unblock
        </button>
        <button type="button" className="concierge-consultant-btn" onClick={() => onTool("blacklist", block.id)}>
          Blacklist
        </button>
        <button type="button" className="concierge-consultant-btn" onClick={() => onTool("whitelist", block.id)}>
          Whitelist
        </button>
        <button type="button" className="concierge-consultant-btn" onClick={() => onTool("manual-review", block.id)}>
          Review
        </button>
      </div>
    </article>
  );
}
