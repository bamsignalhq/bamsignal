import { SUPPORT_TICKET_PRIORITY_LABELS, SUPPORT_TICKET_TYPE_LABELS } from "../../constants/supportCenter";
import type { SupportTicketRecord } from "../../types/supportCenter";
import { TicketStatusBadge } from "./TicketStatusBadge";

type SupportTicketCardProps = {
  ticket: SupportTicketRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function SupportTicketCard({ ticket, selected = false, onSelect }: SupportTicketCardProps) {
  const content = (
    <>
      <div className="support-ticket-card__head">
        <p className="support-ticket-card__number">{ticket.ticketNumber}</p>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <h3>{ticket.subject}</h3>
      <p>{ticket.description}</p>
      <dl className="support-ticket-card__meta">
        <div>
          <dt>Type</dt>
          <dd>{SUPPORT_TICKET_TYPE_LABELS[ticket.typeId ?? ticket.categoryId ?? "general-questions"]}</dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>{SUPPORT_TICKET_PRIORITY_LABELS[ticket.priority]}</dd>
        </div>
        <div>
          <dt>Member</dt>
          <dd>{ticket.memberUsername}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{new Date(ticket.updatedAt).toLocaleDateString()}</dd>
        </div>
      </dl>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`support-ticket-card support-ticket-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="support-ticket-card">{content}</article>;
}
