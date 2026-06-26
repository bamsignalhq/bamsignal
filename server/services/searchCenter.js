/**
 * Enterprise Search Center™ — search helpers (server-side tests).
 */

export function highlightSearchText(text, query) {
  const trimmed = (query ?? "").trim();
  if (!trimmed) return [{ text, highlight: false }];

  const parts = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  let start = 0;
  let index = lowerText.indexOf(lowerQuery);

  while (index !== -1) {
    if (index > start) parts.push({ text: text.slice(start, index), highlight: false });
    parts.push({ text: text.slice(index, index + trimmed.length), highlight: true });
    start = index + trimmed.length;
    index = lowerText.indexOf(lowerQuery, start);
  }

  if (start < text.length) parts.push({ text: text.slice(start), highlight: false });
  return parts.length ? parts : [{ text, highlight: false }];
}

export function scoreSearchEntry(entry, query) {
  const normalized = (query ?? "").trim().toLowerCase();
  if (!normalized) return 1;
  const title = entry.title.toLowerCase();
  const text = entry.searchText ?? "";
  if (title.includes(normalized)) return 60;
  if (text.includes(normalized)) return 20;
  return 0;
}

export function searchCenterRouteRegistered(permissionsSource) {
  return permissionsSource.includes("/hard/search") && permissionsSource.includes("search:");
}

export function buildSearchCenterSummaryLine(summary) {
  return `index=${summary.indexSize} entities=${Object.keys(summary.entityCounts ?? {}).length}`;
}

export const SEARCH_CENTER_DB_TABLES = [
  "search_index_snapshots",
  "search_saved_queries",
  "search_recent_queries"
];

export function getSearchCenterDatabaseTableManifest() {
  return SEARCH_CENTER_DB_TABLES.map((tableName) => ({ tableName, domain: "search" }));
}

export function countSearchIndexByEntity(index) {
  return index.reduce((counts, entry) => {
    counts[entry.entity] = (counts[entry.entity] ?? 0) + 1;
    return counts;
  }, {});
}
