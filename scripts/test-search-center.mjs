#!/usr/bin/env node
/**
 * Enterprise Search Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEARCH_CENTER_DB_TABLES,
  buildSearchCenterSummaryLine,
  countSearchIndexByEntity,
  getSearchCenterDatabaseTableManifest,
  highlightSearchText,
  scoreSearchEntry,
  searchCenterRouteRegistered
} from "../server/services/searchCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const adminSource = read("src/constants/searchCenterAdmin.ts");
assert(adminSource.includes('SEARCH_CENTER_ADMIN_PATH = "/hard/search"'), "search admin route");
assert(adminSource.includes("Enterprise Search Center™"), "search center brand");

const constantsSource = read("src/constants/searchCenter.ts");
assert(constantsSource.includes("members"), "members entity");
assert(constantsSource.includes("consultants"), "consultants entity");
assert(constantsSource.includes("documents"), "documents entity");
assert(constantsSource.includes("SEARCH_CENTER_KEYBOARD_SHORTCUT"), "keyboard shortcut");
assert(constantsSource.includes("command-palette"), "command palette feature");
assert(constantsSource.includes("saved-searches"), "saved searches feature");
assert(constantsSource.includes("search_index_snapshots"), "index snapshots table");

const typesSource = read("src/types/searchCenter.ts");
assert(typesSource.includes("EnterpriseSearchCenterBundle"), "bundle type");
assert(typesSource.includes("SearchResultGroup"), "result group type");
assert(typesSource.includes("SearchHighlightPart"), "highlight type");

const logicSource = read("src/utils/searchCenterLogic.ts");
assert(logicSource.includes("collectSearchIndex"), "index collector");
assert(logicSource.includes("highlightSearchText"), "highlight helper");
assert(logicSource.includes("groupSearchResults"), "grouped results");
assert(logicSource.includes("buildEnterpriseSearchCenterBundle"), "bundle builder");

const engineSource = read("src/utils/searchCenterEngine.ts");
assert(engineSource.includes("buildLiveSearchCenterBundle"), "live bundle builder");

const storeSource = read("src/utils/searchCenterStore.ts");
assert(storeSource.includes("bamsignal.searchCenter.v1"), "localStorage key");
assert(storeSource.includes("saveSearchQuery"), "save search");
assert(storeSource.includes("recordRecentSearch"), "recent search");

const seedSource = read("src/data/searchCenterSeed.ts");
assert(seedSource.includes("SEARCH_SAVED_SEARCHES_SEED"), "saved search seed");
assert(seedSource.includes("SEARCH_SUPPLEMENTAL_INDEX_SEED"), "supplemental index seed");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes("SEARCH_CENTER_ADMIN_PATH"), "hard routes include search path");
assert(hardRoutesSource.includes('search: "search"'), "search tab slug");

const permissionsSource = read("src/constants/permissions.ts");
assert(searchCenterRouteRegistered(permissionsSource), "search route permission mapped");
assert(permissionsSource.includes("search:"), "search tab permission");

const adminComponents = [
  "SearchCenterPage.tsx",
  "SearchCommandPalette.tsx",
  "SearchSummaryCard.tsx",
  "SearchResultsCard.tsx",
  "SearchSavedRecentCard.tsx",
  "SearchQuickActionsCard.tsx",
  "HighlightedText.tsx"
];

for (const file of adminComponents) {
  const source = read(`src/components/admin/searchCenter/${file}`);
  assert(source.length > 0, `${file} exists`);
}

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazySearchCenterPage"), "lazy search page");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "search"'), "admin hub tab wired");

const mainSource = read("src/main.tsx");
assert(mainSource.includes("search-center.css"), "styles imported");

const migrationSource = read("supabase/migrations/202606261200_search_center.sql");
assert(migrationSource.includes("search_saved_queries"), "saved queries migration");

const packageSource = read("package.json");
assert(packageSource.includes("test:search-center"), "package.json defines test:search-center");

const highlighted = highlightSearchText("Ada Lagos member", "lagos");
assert(highlighted.some((part) => part.highlight), "highlight matches query");

const score = scoreSearchEntry(
  { title: "Lagos application", searchText: "lagos application member" },
  "lagos"
);
assert(score > 0, "search scoring");

const counts = countSearchIndexByEntity([
  { entity: "members" },
  { entity: "members" },
  { entity: "payments" }
]);
assert(counts.members === 2 && counts.payments === 1, "entity counts");

assert(SEARCH_CENTER_DB_TABLES.length === 3, "three search tables");
assert(getSearchCenterDatabaseTableManifest().length === 3, "table manifest");

const summaryLine = buildSearchCenterSummaryLine({
  indexSize: 120,
  entityCounts: { members: 10, payments: 5 }
});
assert(summaryLine.includes("index=120"), "summary line format");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Enterprise Search Center checks passed.");
