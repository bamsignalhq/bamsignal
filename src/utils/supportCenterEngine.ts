import { SUPPORT_CENTER_METRICS } from "../constants/supportCenter";
import { SUPPORT_TICKETS_SEED } from "../data/supportCenterSeed";
import type { SupportCenterBundle, SupportTicketRecord } from "../types/supportCenter";
import type { SupportTicketStatusId } from "../constants/supportCenter";
import {
  averageResolutionTimeHours,
  averageResponseTimeHours,
  buildQueueBuckets,
  filterEscalatedTickets,
  filterOpenTickets,
  filterResolvedTickets,
  findTicketById,
  formatDurationHours,
  moveTicketStatus,
  sortTicketsByUpdatedAt
} from "./supportCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.supportCenter.v1";

type SupportCenterState = {
  tickets: SupportTicketRecord[];
  updatedAt: string;
};

function defaultState(): SupportCenterState {
  return {
    tickets: [...SUPPORT_TICKETS_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): SupportCenterState {
  const stored = readJson<SupportCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.tickets?.length) return defaultState();
  return stored;
}

function saveState(state: SupportCenterState): void {
  writeJson(STORAGE_KEY, state);
}

export function listSupportCenterTickets(): SupportTicketRecord[] {
  return loadState().tickets;
}

export function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatusId
): SupportTicketRecord | null {
  const state = loadState();
  const index = state.tickets.findIndex((ticket) => ticket.id === ticketId);
  if (index < 0) return null;

  const next = moveTicketStatus(state.tickets[index], status);
  state.tickets[index] = next;
  state.updatedAt = new Date().toISOString();
  saveState(state);
  return next;
}

export function buildSupportCenterBundle(selectedTicketId?: string | null): SupportCenterBundle {
  const tickets = sortTicketsByUpdatedAt(listSupportCenterTickets());
  const openTickets = filterOpenTickets(tickets);
  const escalated = filterEscalatedTickets(tickets);
  const resolved = filterResolvedTickets(tickets);
  const avgResponse = averageResponseTimeHours(tickets);
  const avgResolution = averageResolutionTimeHours(tickets);

  const metricValues: Record<string, string> = {
    "open-tickets": String(openTickets.length),
    escalated: String(escalated.length),
    resolved: String(resolved.length),
    "average-response-time": avgResponse === null ? "—" : formatDurationHours(avgResponse * 60 * 60 * 1000),
    "average-resolution-time":
      avgResolution === null ? "—" : formatDurationHours(avgResolution * 60 * 60 * 1000)
  };

  const metrics = SUPPORT_CENTER_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: metricValues[metric.id] ?? "—",
    numericValue:
      metric.id === "open-tickets"
        ? openTickets.length
        : metric.id === "escalated"
          ? escalated.length
          : metric.id === "resolved"
            ? resolved.length
            : undefined
  }));

  return {
    generatedAt: new Date().toISOString(),
    metrics,
    queue: buildQueueBuckets(tickets),
    escalations: sortTicketsByUpdatedAt(escalated),
    selectedTicket: findTicketById(tickets, selectedTicketId ?? null)
  };
}
