import type { ConfigurationApprovalRecord } from "../../../types/configurationPlatform";

type ApprovalQueueCardProps = {
  approvals: ConfigurationApprovalRecord[];
};

export function ApprovalQueueCard({ approvals }: ApprovalQueueCardProps) {
  const pending = approvals.filter((item) => item.status === "pending");

  return (
    <section className="config-card approval-queue-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Approval queue</h3>
        <p>Critical settings require approval. No user may approve their own change.</p>
      </header>
      {pending.length ? (
        <ul className="approval-queue-card__list">
          {pending.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <p className="approval-queue-card__key">{item.configKey}</p>
              <p>
                Proposed v{item.proposedVersion}: {JSON.stringify(item.proposedValue)}
              </p>
              <span className="approval-queue-card__meta">
                Requested by {item.requestedBy} · {new Date(item.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No pending configuration approvals.</p>
      )}
    </section>
  );
}
