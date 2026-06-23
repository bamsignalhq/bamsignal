import { SUPPORT_TICKET_STATUSES } from "../constants/supportCenter";
import { KNOWLEDGE_BASE_SEED, SUPPORT_TICKETS_SEED } from "../data/supportCenterSeed";
import type { KnowledgeBaseArticle, SupportTicketRecord, TicketTimelineEvent } from "../types/supportCenter";
import type { SupportTicketStatusId, SupportTicketTypeId } from "../constants/supportCenter";

const OPEN_STATUSES = new Set<SupportTicketStatusId>([
  "open",
  "pending",
  "in-progress",
  "waiting-for-member"
]);

function ticketTypeId(ticket: SupportTicketRecord): SupportTicketTypeId {
  return ticket.typeId ?? ticket.categoryId ?? "general-questions";
}

export function listSupportTickets(): SupportTicketRecord[] {
  return [...SUPPORT_TICKETS_SEED];
}

export function listKnowledgeBaseArticles(): KnowledgeBaseArticle[] {
  return [...KNOWLEDGE_BASE_SEED];
}

export function filterKnowledgeBaseByType(typeId: SupportTicketTypeId): KnowledgeBaseArticle[] {
  return KNOWLEDGE_BASE_SEED.filter((article) => (article.typeId ?? article.categoryId) === typeId);
}

/** @deprecated Use filterKnowledgeBaseByType */
export function filterKnowledgeBaseByCategory(categoryId: SupportTicketTypeId): KnowledgeBaseArticle[] {
  return filterKnowledgeBaseByType(categoryId);
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
  return tickets.filter((ticket) => ticket.escalated);
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

export function averageMemberSatisfaction(tickets: SupportTicketRecord[]): number | null {
  const samples = tickets
    .map((ticket) => ticket.satisfactionScore)
    .filter((score): score is number => typeof score === "number");
  if (!samples.length) return null;
  return samples.reduce((sum, value) => sum + value, 0) / samples.length;
}

export function buildQueueBuckets(tickets: SupportTicketRecord[]) {
  return SUPPORT_TICKET_STATUSES.map((status) => ({
    status: status.id,
    label: status.label,
    tickets: sortTicketsByUpdatedAt(filterTicketsByStatus(tickets, status.id))
  }));
}

export function buildTicketTimeline(ticket: SupportTicketRecord): TicketTimelineEvent[] {
  return [...ticket.timeline].sort(
    (left, right) => new Date(left.at).getTime() - new Date(right.at).getTime()
  );
}

export function moveTicketStatus(
  ticket: SupportTicketRecord,
  status: SupportTicketStatusId
): SupportTicketRecord {
  const now = new Date().toISOString();
  const timelineEvent: TicketTimelineEvent = {
    id: `tl_${ticket.id}_${status}_${Date.now()}`,
    at: now,
    label: status.replace(/-/g, " "),
    detail: `Status updated to ${status}.`,
    actor: ticket.assignedTo
  };

  return {
    ...ticket,
    typeId: ticketTypeId(ticket),
    status,
    updatedAt: now,
    firstResponseAt: ticket.firstResponseAt ?? (status !== "open" && status !== "pending" ? now : null),
    resolvedAt:
      status === "resolved" || status === "closed" ? ticket.resolvedAt ?? now : ticket.resolvedAt,
    timeline: [...ticket.timeline, timelineEvent]
  };
}
