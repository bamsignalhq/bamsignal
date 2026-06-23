import { REMEDIATION_CATEGORY_LABELS } from "../../../constants/remediationBoard";
import type { RemediationCategorySummary } from "../../../types/remediationBoard";
import { countBySeverity } from "../../../utils/remediationBoardLogic";
import type { RemediationFinding } from "../../../types/remediationBoard";

type RiskOverviewCardProps = {
  categorySummaries: RemediationCategorySummary[];
  findings: RemediationFinding[];
};

export function RiskOverviewCard({ categorySummaries, findings }: RiskOverviewCardProps) {
  const openP0 = countBySeverity(findings, "P0", true);
  const openP1 = countBySeverity(findings, "P1", true);
  const openP2 = countBySeverity(findings, "P2", true);

  return (
    <section className="risk-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="risk-overview-card__head">
        <h3>Risk overview</h3>
        <p>Open severity mix — P0: {openP0}, P1: {openP1}, P2: {openP2}</p>
      </header>

      <div className="risk-overview-card__table-wrap">
        <table className="risk-overview-card__table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Open</th>
              <th>P0</th>
              <th>P1</th>
              <th>P2</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {categorySummaries.map((summary) => (
              <tr key={summary.category}>
                <td>{REMEDIATION_CATEGORY_LABELS[summary.category]}</td>
                <td>{summary.open}</td>
                <td>{summary.p0}</td>
                <td>{summary.p1}</td>
                <td>{summary.p2}</td>
                <td>{summary.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
