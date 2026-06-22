import { DOCUMENT_STATUS_LABELS } from "../../../constants/documentCenter";
import type { DocumentStatusId } from "../../../constants/documentCenter";
import type { DocumentApproval } from "../../../types/documentCenter";

type DocumentApprovalCardProps = {
  status: DocumentStatusId;
  approval: DocumentApproval | null;
  owner: string;
};

export function DocumentApprovalCard({ status, approval, owner }: DocumentApprovalCardProps) {
  return (
    <section className="document-approval-card concierge-consultant-card--glass cc-reveal">
      <header className="document-approval-card__head">
        <h3>Approval & ownership</h3>
      </header>

      <dl className="document-approval-card__grid">
        <div>
          <dt>Status</dt>
          <dd>{DOCUMENT_STATUS_LABELS[status]}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{owner}</dd>
        </div>
        {approval ? (
          <>
            <div>
              <dt>Approved by</dt>
              <dd>{approval.approvedBy}</dd>
            </div>
            <div>
              <dt>Approved at</dt>
              <dd>{new Date(approval.approvedAt).toLocaleDateString()}</dd>
            </div>
          </>
        ) : null}
      </dl>

      {approval?.note ? <p className="document-approval-card__note">{approval.note}</p> : null}
      {!approval && status !== "archived" ? (
        <p className="document-approval-card__pending">Pending approval — document in {DOCUMENT_STATUS_LABELS[status]}.</p>
      ) : null}
    </section>
  );
}
