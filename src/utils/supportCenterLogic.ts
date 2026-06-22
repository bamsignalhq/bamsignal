import { SUPPORT_TICKET_STATUSES } from "../constants/supportCenter";
import { KNOWLEDGE_BASE_SEED, SUPPORT_TICKETS_SEED } from "../data/supportCenterSeed";
import type { KnowledgeBaseArticle, SupportTicketRecord } from "../types/supportCenter";
import type { SupportTicketCategoryId, SupportTicketStatusId } from "../constants/supportCenter";

const OPEN_STATUSES = new Set<SupportTicketStatusId>([
  "open",
  "in-progress",
  "awaiting-response",
  "escalated"
]);

export function listSupportTickets(): SupportTicketRecord[] {
  return [...SUPPORT_TICKETS_SEED];
}

export function listKnowledgeBaseArticles(): KnowledgeBaseArticle[] {
  return [...KNOWLEDGE_BASE_SEED];
}

export function filterKnowledgeBaseByCategory(categoryId: SupportTicketCategoryId): KnowledgeBaseArticle[] {
  return KNOWLEDGE_BASE_SEED.filter((article) => article.categoryId === categoryId);
}

export function filterTicketsByStatus(
  tickets: SupportTicketRecord[],
  status: SupportTicketStatusId
): SupportTicketRecord[] {
  return tickets.filter((ticket) => ticket.status === status);
}

export function filterOpenTickets(tickets: SupportTicketRecord[]): SupportTicketRecord[] {
  return tickets.filter((ticket) => OPEN_STATUSES.has(ticket.status));
}

export function filterEscalatedTickets(tickets: SupportTicketRecord[]): SupportTicketRecord[] {
  return tickets.filter((ticket) => ticket.status === "escalated");
}

export function filterResolvedTickets(tickets: SupportTicketRecord[]): SupportTicketRecord[] {
  return tickets.filter((ticket) => ticket.status === "resolved" || ticket.status === "closed");
}

export function findTicketById(tickets: SupportTicketRecord[], ticketId: string | null): SupportTicketRecord | null {
  if (!ticketId) return null;
  return tickets.find((ticket) => ticket.id === ticketId) ?? null;
}

export function sortTicketsByUpdatedAt(tickets: SupportTicketRecord[]): SupportTicketRecord[] {
  return [...tickets].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export function formatDurationHours(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "—";
  const hours = milliseconds / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function averageResponseTimeHours(tickets: SupportTicketRecord[]): number | null {
  const samples = tickets
    .filter((ticket) => ticket.firstResponseAt)
    .map(
      (ticket) =>
        new Date(ticket.firstResponseAt as string).getTime() - new Date(ticket.createdAt).getTime()
    );
  if (!samples.length) return null;
  return samples.reduce((sum, value) => sum + value, 0) / samples.length / (1000 * 60 * 60);
}

export function averageResolutionTimeHours(tickets: SupportTicketRecord[]): number | null {
  const samples = tickets
    .filter((ticket) => ticket.resolvedAt)
    .map(
      (ticket) => new Date(ticket.resolvedAt as string).getTime() - new Date(ticket.createdAt).getTime()
    );
  if (!samples.length) return null;
  return samples.reduce((sum, value) => sum + value, 0) / samples.length / (1000 * 60 * 60);
}

export function buildQueueBuckets(tickets: SupportTicketRecord[]) {
  return SUPPORT_TICKET_STATUSES.map((status) => ({
    status: status.id,
    label: status.label,
    tickets: sortTicketsByUpdatedAt(filterTicketsByStatus(tickets, status.id))
  }));
}

export function moveTicketStatus(
  ticket: SupportTicketRecord,
  status: SupportTicketStatusId
): SupportTicketRecord {
  const now = new Date().toISOString();
  return {
    ...ticket,
    status,
    updatedAt: now,
    firstResponseAt: ticket.firstResponseAt ?? (status !== "open" ? now : null),
    resolvedAt:
      status === "resolved" || status === "closed" ? ticket.resolvedAt ?? now : ticket.resolvedAt
  };
}
