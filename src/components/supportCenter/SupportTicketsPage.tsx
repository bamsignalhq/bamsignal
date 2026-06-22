import { listSupportTickets, sortTicketsByUpdatedAt } from "../../utils/supportCenterLogic";
import { SupportTicketCard } from "./SupportTicketCard";

export function SupportTicketsPage() {
  const tickets = sortTicketsByUpdatedAt(listSupportTickets()).slice(0, 6);

  return (
    <div className="support-center-page">
      <header className="support-center-page__head cc-reveal">
        <h1>Support tickets</h1>
        <p>
          Example ticket lifecycle — Open, In Progress, Awaiting Response, Escalated, Resolved, and
          Closed. Members receive updates by email.
        </p>
      </header>

      <div className="support-ticket-grid">
        {tickets.map((ticket) => (
          <SupportTicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      <p className="support-center-note cc-reveal">
        To open a new ticket, contact support with your username and issue category.
      </p>
    </div>
  );
}
