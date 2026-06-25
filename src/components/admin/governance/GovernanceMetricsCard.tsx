import type { ApprovalHistoryRecord } from "../../../types/institutionalGovernance";

type GovernanceMetricsCardProps = {
  roleCount: number;
  permissionCount: number;
  approvalHistory: ApprovalHistoryRecord[];
};

export function GovernanceMetricsCard({
  roleCount,
  permissionCount,
  approvalHistory
}: GovernanceMetricsCardProps) {
  return (
    <section className="governance-card governance-metrics-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Governance metrics</h3>
        <p>Audit-linked governance activity across roles, permissions, and approvals.</p>
      </header>
      <div className="governance-metrics-card__grid">
        <span>{roleCount} roles</span>
        <span>{permissionCount} permissions</span>
        <span>{approvalHistory.length} approval events</span>
      </div>
    </section>
  );
}
