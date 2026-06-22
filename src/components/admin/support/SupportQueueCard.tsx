import { SUPPORT_TICKET_STATUS_LABELS } from "../../../constants/supportCenter";
import type { SupportTicketStatusId } from "../../../constants/supportCenter";
import type { SupportQueueBucket } from "../../../types/supportCenter";

type SupportQueueCardProps = {
  queue: SupportQueueBucket[];
  activeStatus: SupportTicketStatusId;
  onSelectStatus: (status: SupportTicketStatusId) => void;
  onSelectTicket: (ticketId: string) => void;
  selectedTicketId: string | null;
};

export function SupportQueueCard({
  queue,
  activeStatus,
  onSelectStatus,
  onSelectTicket,
  selectedTicketId
}: SupportQueueCardProps) {
  const activeBucket = queue.find((bucket) => bucket.status === activeStatus);

  return (
    <section className="support-queue-card concierge-consultant-card--glass cc-reveal">
      <header className="support-queue-card__head">
        <h3>Support queue</h3>
        <p>Tickets by status across all categories.</p>
      </header>

      <div className="support-queue-card__statuses">
        {queue.map((bucket) => (
          <button
            key={bucket.status}
            type="button"
            className={`support-queue-chip${activeStatus === bucket.status ? " is-active" : ""}`}
            onClick={() => onSelectStatus(bucket.status)}
          >
            {SUPPORT_TICKET_STATUS_LABELS[bucket.status]}
            <span>{bucket.tickets.length}</span>
          </button>
        ))}
      </div>

      <div className="support-queue-card__list">
        {activeBucket?.tickets.length ? (
          activeBucket.tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              className={`support-queue-row${selectedTicketId === ticket.id ? " is-selected" : ""}`}
              onClick={() => onSelectTicket(ticket.id)}
            >
              <strong>{ticket.ticketNumber}</strong>
              <span>{ticket.subject}</span>
              <span>{ticket.memberUsername}</span>
            </button>
          ))
        ) : (
          <p className="support-queue-card__empty">No tickets in this status.</p>
        )}
      </div>
    </section>
  );
}
