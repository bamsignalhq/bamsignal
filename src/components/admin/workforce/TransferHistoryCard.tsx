import { WORKFORCE_TRANSFER_DOMAIN_LABELS } from "../../../constants/workforceManagement";
import type { WorkforceTransferRecord } from "../../../types/workforceManagement";

type TransferHistoryCardProps = {
  transfers: WorkforceTransferRecord[];
  profileNames: Record<string, string>;
};

export function TransferHistoryCard({ transfers, profileNames }: TransferHistoryCardProps) {
  return (
    <section className="workforce-card transfer-history-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Transfer history</h3>
        <p>Workload transfers preserve journeys, consultations, notes, communications, and audit history.</p>
      </header>
      {transfers.length === 0 ? (
        <p className="concierge-consultant__empty">No transfers recorded.</p>
      ) : (
        <ul className="transfer-history-card__list">
          {transfers.map((transfer) => (
            <li key={transfer.id}>
              <div>
                <strong>
                  {profileNames[transfer.fromProfileId] ?? transfer.fromProfileId} →{" "}
                  {profileNames[transfer.toProfileId] ?? transfer.toProfileId}
                </strong>
                <span className={`workforce-pill workforce-pill--${transfer.status}`}>
                  {transfer.status}
                </span>
              </div>
              <ul className="transfer-history-card__domains">
                {Object.entries(transfer.transferredPayload).map(([domain, items]) => (
                  <li key={domain}>
                    {WORKFORCE_TRANSFER_DOMAIN_LABELS[domain as keyof typeof WORKFORCE_TRANSFER_DOMAIN_LABELS]}:{" "}
                    {items?.length ?? 0}
                  </li>
                ))}
              </ul>
              {transfer.auditRef ? <span className="transfer-history-card__audit">Audit: {transfer.auditRef}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
