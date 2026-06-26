import { QA_RELEASE_GATE_STATUS_LABELS } from "../../../constants/qualityAssuranceCenter";
import type {
  QACertificationApproval,
  QACertificationHistoryEntry,
  QASubsystemScore
} from "../../../types/qualityAssuranceCenter";

type QACertificationPanelCardProps = {
  subsystemScores: QASubsystemScore[];
  approvals: QACertificationApproval[];
  history: QACertificationHistoryEntry[];
  overallScore: number;
};

const APPROVAL_LABELS: Record<QACertificationApproval["role"], string> = {
  engineer: "Engineer",
  qa: "QA",
  founder: "Founder approval"
};

export function QACertificationPanelCard({
  subsystemScores,
  approvals,
  history,
  overallScore
}: QACertificationPanelCardProps) {
  return (
    <section className="qa-certification-card qa-certification-panel-card concierge-consultant-card--glass cc-reveal">
      <header className="qa-certification-card__head">
        <h3>Certification</h3>
        <p>Overall score, subsystem scores, history, and sign-off approvals.</p>
      </header>

      <div className="qa-certification-panel-card__overall">
        <span>Overall score</span>
        <strong>{overallScore}%</strong>
      </div>

      <h4>Subsystem scores</h4>
      <div className="qa-certification-panel-card__grid">
        {subsystemScores.map((score) => (
          <article key={score.id} className={`qa-subsystem-score qa-subsystem-score--${score.status}`}>
            <span>{score.label}</span>
            <strong>{score.score}%</strong>
            <em>{QA_RELEASE_GATE_STATUS_LABELS[score.status]}</em>
          </article>
        ))}
      </div>

      <h4>Approvals</h4>
      <ul className="qa-certification-card__list">
        {approvals.map((approval) => (
          <li key={approval.role}>
            <div className="qa-certification-card__row">
              <strong>{APPROVAL_LABELS[approval.role]}</strong>
              <span>{approval.status}</span>
            </div>
            {approval.signedBy ? (
              <div className="qa-certification-card__meta">
                <span>{approval.signedBy}</span>
                {approval.signedAt ? (
                  <span>{new Date(approval.signedAt).toLocaleString()}</span>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <h4>History</h4>
      <ul className="qa-certification-card__list">
        {history.map((entry) => (
          <li key={entry.id}>
            <div className="qa-certification-card__row">
              <strong>{entry.certificationRef}</strong>
              <span>{entry.overallScore}%</span>
            </div>
            <div className="qa-certification-card__meta">
              <span>{entry.version}</span>
              <span>{entry.releaseBlocked ? "Blocked" : "Certified"}</span>
              <span>{entry.certifiedBy}</span>
              <span>{new Date(entry.certifiedAt).toLocaleDateString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
