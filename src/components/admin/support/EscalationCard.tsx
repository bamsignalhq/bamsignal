import { SUPPORT_TICKET_CATEGORY_LABELS, SUPPORT_TICKET_PRIORITY_LABELS } from "../../../constants/supportCenter";
import type { SupportTicketRecord } from "../../../types/supportCenter";
import { TicketStatusBadge } from "../../supportCenter/TicketStatusBadge";

type EscalationCardProps = {
  tickets: SupportTicketRecord[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
};

export function EscalationCard({ tickets, selectedTicketId, onSelectTicket }: EscalationCardProps) {
  return (
    <section className="support-escalation-card concierge-consultant-card--glass cc-reveal">
      <header className="support-escalation-card__head">
        <h3>Escalations</h3>
        <p>Critical and escalated tickets requiring senior review.</p>
      </header>

      {tickets.length ? (
        <div className="support-escalation-card__list">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              className={`support-escalation-row${selectedTicketId === ticket.id ? " is-selected" : ""}`}
              onClick={() => onSelectTicket(ticket.id)}
            >
              <div className="support-escalation-row__head">
                <strong>{ticket.ticketNumber}</strong>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <span>{ticket.subject}</span>
              <span>
                {SUPPORT_TICKET_CATEGORY_LABELS[ticket.categoryId]} ·{" "}
                {SUPPORT_TICKET_PRIORITY_LABELS[ticket.priority]}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="support-escalation-card__empty">No escalated tickets.</p>
      )}
    </section>
  );
}
