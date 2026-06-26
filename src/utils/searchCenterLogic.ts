import {
  SEARCH_ENTITIES,
  SEARCH_ENTITY_LABELS,
  type SearchEntityId
} from "../constants/searchCenter";
import { CONCIERGE_ADMIN_DASHBOARD_PATH } from "../constants/operationsCenter";
import { DOCUMENT_CENTER_ADMIN_PATH } from "../constants/documentCenterAdmin";
import { NOTIFICATION_RELIABILITY_ADMIN_PATH } from "../constants/notificationReliabilityAdmin";
import { REPORTING_CENTER_ADMIN_PATH } from "../constants/reportingCenterAdmin";
import { SEARCH_SUPPLEMENTAL_INDEX_SEED } from "../data/searchCenterSeed";
import { REPORT_CATALOG_SEED } from "../data/reportingCenterSeed";
import { DOCUMENT_CENTER_SEED } from "../data/documentCenterSeed";
import { SIGNAL_EVENTS_ARCHITECTURE_SEED } from "../data/signalEventsSeed";
import type {
  EnterpriseSearchCenterBundle,
  SearchFilters,
  SearchHighlightPart,
  SearchIndexEntry,
  SearchResultGroup,
  SearchResultRecord
} from "../types/searchCenter";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { listConciergeConsultants } from "./conciergeConsultantDirectoryStore";
import { listConsultationPayments } from "./ConsultationPaymentEngine";
import { listInternalMessages } from "./internalMessagingLogic";
import { listSupportCenterTickets } from "./supportCenterEngine";
import { buildNotificationOperationsBundle } from "./notificationOperationsEngine";
import { listSavedSearches, listRecentSearches } from "./searchCenterStore";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";

const APPLICATION_STATUSES = new Set(["applied", "under-review", "pending-payment"]);

function pushEntry(entries: SearchIndexEntry[], entry: SearchIndexEntry) {
  entries.push(entry);
}

function memberUpdatedAt(member: { updatedAt?: string; createdAt?: string }): string {
  return member.updatedAt ?? member.createdAt ?? new Date().toISOString();
}

export function collectSearchIndex(): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [...SEARCH_SUPPLEMENTAL_INDEX_SEED];

  for (const member of listConciergeMembers()) {
    const name = member.aboutYou.name;
    const city = member.aboutYou.city;
    const statusLabel = SIGNAL_CONCIERGE_STATUS_LABELS[member.status] ?? member.status;
    const baseText = [name, city, member.aboutYou.occupation, member.journeyId, member.assignedConsultantName, statusLabel]
      .filter(Boolean)
      .join(" ");

    pushEntry(entries, {
      id: `member-${member.id}`,
      entity: "members",
      title: name,
      subtitle: city,
      preview: `${statusLabel}${member.journeyId ? ` · ${member.journeyId}` : ""}`,
      searchText: baseText.toLowerCase(),
      jumpPath: CONCIERGE_ADMIN_DASHBOARD_PATH,
      updatedAt: memberUpdatedAt(member),
      quickActionId: "open-member"
    });

    if (APPLICATION_STATUSES.has(member.status)) {
      pushEntry(entries, {
        id: `application-${member.id}`,
        entity: "applications",
        title: `${name} — application`,
        subtitle: city,
        preview: `Application status: ${statusLabel}`,
        searchText: `${baseText} application intake`.toLowerCase(),
        jumpPath: CONCIERGE_ADMIN_DASHBOARD_PATH,
        updatedAt: memberUpdatedAt(member),
        quickActionId: "assign-consultant"
      });
    }

    if (member.journeyId) {
      pushEntry(entries, {
        id: `journey-${member.id}`,
        entity: "journeys",
        title: member.journeyId,
        subtitle: name,
        preview: `${statusLabel} · ${city}`,
        searchText: `${member.journeyId} ${baseText} journey milestone`.toLowerCase(),
        jumpPath: "/hard/journey-intelligence",
        updatedAt: memberUpdatedAt(member),
        quickActionId: "view-journey"
      });
    }

    if (member.journeyArchive?.relationshipStatus) {
      pushEntry(entries, {
        id: `relationship-${member.id}`,
        entity: "relationships",
        title: `${name} — relationship`,
        subtitle: member.journeyArchive.relationshipStatus,
        preview: member.journeyArchive.isLegacyArchive
          ? "Legacy archive record"
          : "Active relationship archive",
        searchText: `${baseText} relationship archive ${member.journeyArchive.relationshipStatus}`.toLowerCase(),
        jumpPath: "/hard/journey-intelligence",
        updatedAt: memberUpdatedAt(member)
      });
    }
  }

  for (const consultant of listConciergeConsultants()) {
    const text = [consultant.name, consultant.email, consultant.primaryRole, consultant.status]
      .filter(Boolean)
      .join(" ");
    pushEntry(entries, {
      id: `consultant-${consultant.id}`,
      entity: "consultants",
      title: consultant.name,
      subtitle: consultant.email,
      preview: `${consultant.primaryRole} · ${consultant.status}`,
      searchText: text.toLowerCase(),
      jumpPath: "/hard/talent",
      updatedAt: consultant.updatedAt,
      quickActionId: "assign-consultant"
    });
  }

  for (const payment of listConsultationPayments()) {
    const reference = payment.paystackReference ?? payment.paymentId;
    pushEntry(entries, {
      id: `payment-${payment.id}`,
      entity: "payments",
      title: reference,
      subtitle: payment.memberName,
      preview: `${payment.amountLabel} · ${payment.status}`,
      searchText: `${reference} ${payment.memberName} ${payment.status} paystack`.toLowerCase(),
      jumpPath: "/hard/finance",
      updatedAt: payment.updatedAt ?? payment.createdAt,
      quickActionId: payment.status === "failed" ? "refund-payment" : undefined
    });
  }

  for (const report of REPORT_CATALOG_SEED) {
    pushEntry(entries, {
      id: `report-${report.id}`,
      entity: "reports",
      title: report.title,
      subtitle: report.reportRef,
      preview: report.description ?? report.title,
      searchText: `${report.title} ${report.description} ${report.reportRef}`.toLowerCase(),
      jumpPath: REPORTING_CENTER_ADMIN_PATH,
      updatedAt: report.lastGeneratedAt ?? new Date().toISOString(),
      quickActionId: "export-report"
    });
  }

  for (const message of listInternalMessages()) {
    pushEntry(entries, {
      id: `message-${message.id}`,
      entity: "messages",
      title: message.subject,
      subtitle: message.author,
      preview: message.body.slice(0, 120),
      searchText: `${message.subject} ${message.body} ${message.author} ${message.messageRef}`.toLowerCase(),
      jumpPath: "/hard/messages",
      updatedAt: message.createdAt
    });
  }

  for (const ticket of listSupportCenterTickets()) {
    pushEntry(entries, {
      id: `support-${ticket.id}`,
      entity: "support",
      title: ticket.subject,
      subtitle: ticket.memberUsername,
      preview: `${ticket.ticketNumber} · ${ticket.status}${ticket.escalated ? " · escalated" : ""}`,
      searchText: `${ticket.subject} ${ticket.memberUsername} ${ticket.ticketNumber} ${ticket.status}`.toLowerCase(),
      jumpPath: "/hard/support",
      updatedAt: ticket.updatedAt
    });
  }

  const notifications = buildNotificationOperationsBundle().history;
  for (const notification of notifications) {
    pushEntry(entries, {
      id: `notification-${notification.id}`,
      entity: "notifications",
      title: `${notification.memberName} — ${notification.templateLabel}`,
      subtitle: notification.channel,
      preview: notification.preview,
      searchText: `${notification.memberName} ${notification.templateLabel} ${notification.preview} ${notification.channel}`.toLowerCase(),
      jumpPath: NOTIFICATION_RELIABILITY_ADMIN_PATH,
      updatedAt: notification.updatedAt,
      quickActionId: notification.status === "failed" ? "retry-notification" : undefined
    });
  }

  for (const document of DOCUMENT_CENTER_SEED) {
    pushEntry(entries, {
      id: `document-${document.id}`,
      entity: "documents",
      title: document.title,
      subtitle: document.owner,
      preview: document.summary,
      searchText: `${document.title} ${document.summary} ${document.body} ${document.author}`.toLowerCase(),
      jumpPath: DOCUMENT_CENTER_ADMIN_PATH,
      updatedAt: document.updatedAt
    });
  }

  for (const event of SIGNAL_EVENTS_ARCHITECTURE_SEED) {
    pushEntry(entries, {
      id: `event-${event.id}`,
      entity: "events",
      title: event.title,
      subtitle: event.citySlug,
      preview: event.note ?? `${event.eventTypeId} · ${event.citySlug}`,
      searchText: `${event.title} ${event.note ?? ""} ${event.citySlug} ${event.eventTypeId}`.toLowerCase(),
      jumpPath: "/hard/cities",
      updatedAt: event.scheduledAt
    });
  }

  return entries;
}

export function highlightSearchText(text: string, query: string): SearchHighlightPart[] {
  const trimmed = query.trim();
  if (!trimmed) return [{ text, highlight: false }];

  const parts: SearchHighlightPart[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  let start = 0;
  let index = lowerText.indexOf(lowerQuery);

  while (index !== -1) {
    if (index > start) {
      parts.push({ text: text.slice(start, index), highlight: false });
    }
    parts.push({ text: text.slice(index, index + trimmed.length), highlight: true });
    start = index + trimmed.length;
    index = lowerText.indexOf(lowerQuery, start);
  }

  if (start < text.length) {
    parts.push({ text: text.slice(start), highlight: false });
  }

  return parts.length ? parts : [{ text, highlight: false }];
}

function scoreEntry(entry: SearchIndexEntry, query: string): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 1;
  const title = entry.title.toLowerCase();
  const preview = entry.preview.toLowerCase();
  const text = entry.searchText;

  if (title === normalized || entry.id === normalized) return 100;
  if (title.startsWith(normalized)) return 80;
  if (title.includes(normalized)) return 60;
  if (preview.includes(normalized)) return 40;
  if (text.includes(normalized)) return 20;

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const matchedTokens = tokens.filter((token) => text.includes(token)).length;
  return matchedTokens > 0 ? matchedTokens * 10 : 0;
}

export function searchIndex(
  index: SearchIndexEntry[],
  filters: SearchFilters
): SearchResultRecord[] {
  const query = filters.query.trim();

  return index
    .filter((entry) => filters.entity === "all" || entry.entity === filters.entity)
    .map((entry) => ({
      ...entry,
      score: scoreEntry(entry, query),
      highlightedTitle: highlightSearchText(entry.title, query),
      highlightedPreview: highlightSearchText(entry.preview, query)
    }))
    .filter((entry) => !query || entry.score > 0)
    .sort((left, right) => right.score - left.score || right.updatedAt.localeCompare(left.updatedAt));
}

export function groupSearchResults(results: SearchResultRecord[]): SearchResultGroup[] {
  const grouped = new Map<SearchEntityId, SearchResultRecord[]>();

  for (const result of results) {
    const list = grouped.get(result.entity) ?? [];
    list.push(result);
    grouped.set(result.entity, list);
  }

  return SEARCH_ENTITIES.map((entity) => ({
    entity: entity.id,
    label: SEARCH_ENTITY_LABELS[entity.id],
    results: grouped.get(entity.id) ?? []
  })).filter((group) => group.results.length > 0);
}

export function buildSearchCenterSummary(index: SearchIndexEntry[]) {
  const entityCounts = Object.fromEntries(
    SEARCH_ENTITIES.map((entity) => [entity.id, 0])
  ) as Record<SearchEntityId, number>;

  for (const entry of index) {
    entityCounts[entry.entity] = (entityCounts[entry.entity] ?? 0) + 1;
  }

  return {
    indexSize: index.length,
    entityCounts,
    lastIndexedAt: new Date().toISOString()
  };
}

export function buildEnterpriseSearchCenterBundle(filters: SearchFilters): EnterpriseSearchCenterBundle {
  const index = collectSearchIndex();
  const results = searchIndex(index, filters);
  const groups = groupSearchResults(results);

  return {
    generatedAt: new Date().toISOString(),
    summary: buildSearchCenterSummary(index),
    filters,
    groups,
    totalResults: results.length,
    savedSearches: listSavedSearches(),
    recentSearches: listRecentSearches(),
    index
  };
}

export function countSearchIndexByEntity(index: SearchIndexEntry[]) {
  return index.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.entity] = (counts[entry.entity] ?? 0) + 1;
    return counts;
  }, {});
}
