import { useCallback, useMemo, useState } from "react";
import { SUPPORT_CENTER_FUTURE_KINDS } from "../../../constants/supportCenter";
import {
  SUPPORT_CENTER_ADMIN_BRAND,
  SUPPORT_CENTER_ADMIN_PATH
} from "../../../constants/supportCenterAdmin";
import { SUPPORT_TICKET_STATUSES } from "../../../constants/supportCenter";
import type { SupportTicketStatusId } from "../../../constants/supportCenter";
import { navigateToPath } from "../../../constants/routes";
import {
  buildSupportCenterBundle,
  updateSupportTicketStatus
} from "../../../utils/supportCenterEngine";
import { SupportTicketCard } from "../../supportCenter/SupportTicketCard";
import { EscalationCard } from "./EscalationCard";
import { SupportQueueCard } from "./SupportQueueCard";

export function SupportCenterAdminPage() {
  const [activeStatus, setActiveStatus] = useState<SupportTicketStatusId>("open");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildSupportCenterBundle(selectedTicketId);
  }, [refreshKey, selectedTicketId]);

  const selectedTicket =
    bundle.queue.flatMap((bucket) => bucket.tickets).find((ticket) => ticket.id === selectedTicketId) ??
    bundle.selectedTicket;

  const handleMoveStatus = useCallback(
    (status: SupportTicketStatusId) => {
      if (!selectedTicketId) return;
      updateSupportTicketStatus(selectedTicketId, status);
      setActiveStatus(status);
      setRefreshKey((value) => value + 1);
    },
    [selectedTicketId]
  );

  return (
    <div className="support-center-admin-page">
      <header className="support-center-admin-page__head">
        <div>
          <h2>{SUPPORT_CENTER_ADMIN_BRAND}</h2>
          <p>
            Internal support CRM for member and concierge operational issues — tickets, escalations,
            and response metrics.
          </p>
        </div>
        <div className="support-center-admin-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath("/help")}
          >
            Public help
          </button>
        </div>
      </header>

      <section className="support-center-admin-page__metrics" aria-label="Support metrics">
        {bundle.metrics.map((metric) => (
          <article
            key={metric.id}
            className="support-metric-card concierge-consultant-card--glass cc-reveal"
          >
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <div className="support-center-admin-page__body">
        <SupportQueueCard
          queue={bundle.queue}
          activeStatus={activeStatus}
          onSelectStatus={setActiveStatus}
          onSelectTicket={setSelectedTicketId}
          selectedTicketId={selectedTicketId}
        />

        <div className="support-center-admin-page__detail">
          {selectedTicket ? (
            <>
              <SupportTicketCard ticket={selectedTicket} />
              <div className="support-center-admin-page__status-actions">
                {SUPPORT_TICKET_STATUSES.map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    className={`concierge-consultant-btn${selectedTicket.status === status.id ? " is-active" : ""}`}
                    disabled={selectedTicket.status === status.id}
                    onClick={() => handleMoveStatus(status.id)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
              {selectedTicket.note ? <p className="support-center-admin-page__note">{selectedTicket.note}</p> : null}
            </>
          ) : (
            <p className="support-center-admin-page__empty">Select a ticket to review.</p>
          )}
        </div>

        <EscalationCard
          tickets={bundle.escalations}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
        />
      </div>

      <footer className="support-center-admin-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {SUPPORT_CENTER_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p className="support-center-admin-page__path">Admin path: {SUPPORT_CENTER_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
