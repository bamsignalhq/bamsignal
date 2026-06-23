import { SUPPORT_TICKET_STATUS_LABELS } from "../../../constants/supportCenter";
import type { SupportTicketStatusId } from "../../../constants/supportCenter";
import type { SupportQueueBucket } from "../../../types/supportCenter";

type TicketQueuePageProps = {
  queue: SupportQueueBucket[];
  activeStatus: SupportTicketStatusId;
  onSelectStatus: (status: SupportTicketStatusId) => void;
  onSelectTicket: (ticketId: string) => void;
  selectedTicketId: string | null;
};

export function TicketQueuePage({
  queue,
  activeStatus,
  onSelectStatus,
  onSelectTicket,
  selectedTicketId
}: TicketQueuePageProps) {
  const activeBucket = queue.find((bucket) => bucket.status === activeStatus);

  return (
    <section className="ticket-queue-page concierge-consultant-card--glass cc-reveal" aria-label="Ticket queue">
      <header className="ticket-queue-page__head">
        <h3>Ticket queue</h3>
        <p>Open, pending, in progress, and waiting tickets across all types.</p>
      </header>

      <div className="ticket-queue-page__statuses">
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

      <div className="ticket-queue-page__list">
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
          <p className="ticket-queue-page__empty">No tickets in this status.</p>
        )}
      </div>
    </section>
  );
}
