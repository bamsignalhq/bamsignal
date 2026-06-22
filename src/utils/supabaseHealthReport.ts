import {
  DATABASE_HEALTH_STATUSES,
  DATABASE_DOMAIN_LABELS,
  type DatabaseDomainId,
  type DatabaseHealthStatusId
} from "../constants/databaseAudit";
import type {
  DatabaseHealthMetric,
  DatabaseRecommendation,
  DatabaseTableRecord
} from "../types/databaseAudit";
import {
  buildDatabaseTableInventory,
  getDuplicateTableGroups,
  getUnmappedBaselineTables
} from "./databaseAudit";

function markDuplicateTables(tables: DatabaseTableRecord[]): DatabaseTableRecord[] {
  const duplicateGroups = getDuplicateTableGroups();
  const duplicateNames = new Set(duplicateGroups.flat());

  return tables.map((table) => {
    if (!duplicateNames.has(table.tableName)) return table;
    return {
      ...table,
      health: table.health === "healthy" ? "partial" : table.health,
      note: table.note ?? "Potential duplicate audit/introduction/legacy table family"
    };
  });
}

function detectMissingTables(tables: DatabaseTableRecord[]): DatabaseTableRecord[] {
  const present = new Set(tables.map((table) => table.tableName));

  const expectedMissing = [
    {
      tableName: "concierge_documents",
      domainIds: ["documents"] as DatabaseDomainId[],
      note: "Document Center™ has no migration table"
    },
    {
      tableName: "concierge_safety_incidents",
      domainIds: ["safety"] as DatabaseDomainId[],
      note: "Safety Center™ incidents not in migrations"
    },
    {
      tableName: "concierge_careers_candidates",
      domainIds: ["careers"] as DatabaseDomainId[],
      note: "Talent admin layer has no Postgres table"
    },
    {
      tableName: "concierge_academy_progress",
      domainIds: ["academy"] as DatabaseDomainId[],
      note: "Consultant Academy™ not persisted to Postgres"
    },
    {
      tableName: "concierge_quality_reviews",
      domainIds: ["qa"] as DatabaseDomainId[],
      note: "Quality Assurance™ reviews not in migrations"
    },
    {
      tableName: "concierge_finance_records",
      domainIds: ["finance"] as DatabaseDomainId[],
      note: "Finance Operations Center™ uses localStorage mirror"
    }
  ];

  return expectedMissing
    .filter((item) => !present.has(item.tableName))
    .map((item) => ({
      id: `missing-${item.tableName}`,
      tableName: item.tableName,
      migrationRef: "not defined",
      domainIds: item.domainIds,
      inRequiredSchema: false,
      health: "missing" as DatabaseHealthStatusId,
      indexes: [],
      constraints: [],
      note: item.note
    }));
}

function detectUnusedTables(tables: DatabaseTableRecord[]): DatabaseTableRecord[] {
  const mapped = new Set(tables.map((table) => table.tableName));
  return getUnmappedBaselineTables(mapped).map((tableName) => ({
    id: `unused-${tableName}`,
    tableName,
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: [],
    inRequiredSchema: true,
    health: "healthy" as DatabaseHealthStatusId,
    indexes: [],
    constraints: [],
    note: "Required at startup but not mapped to a Database Audit domain"
  }));
}

function buildRecommendations(
  duplicates: DatabaseTableRecord[],
  missing: DatabaseTableRecord[],
  tables: DatabaseTableRecord[]
): DatabaseRecommendation[] {
  const recommendations: DatabaseRecommendation[] = [];

  if (tables.some((table) => table.tableName.startsWith("concierge_") && !table.inRequiredSchema)) {
    recommendations.push({
      id: "rec-concierge-schema-verify",
      title: "Add concierge tables to schema verification",
      summary:
        "concierge_* tables exist in migration 0004 but are absent from REQUIRED_SCHEMA_TABLES — startup verify will not catch missing concierge schema.",
      priority: "high",
      domainId: "members"
    });
  }

  if (duplicates.length) {
    recommendations.push({
      id: "rec-audit-table-consolidation",
      title: "Consolidate audit table families",
      summary:
        "audit_logs, platform_audit_log, and moderation_audit_log overlap — define canonical audit storage before migration completes.",
      priority: "medium",
      domainId: "qa"
    });
  }

  if (missing.some((table) => table.domainIds.includes("documents"))) {
    recommendations.push({
      id: "rec-documents-migration",
      title: "Migrate Document Center to Postgres",
      summary: "documentCenterEngine.ts is localStorage-only — add concierge_documents or institutional documents table.",
      priority: "high",
      domainId: "documents"
    });
  }

  if (missing.some((table) => table.domainIds.includes("finance"))) {
    recommendations.push({
      id: "rec-finance-migration",
      title: "Align Finance Operations with payment_fulfillments",
      summary:
        "Finance Operations Center™ should read from payment_events and payment_fulfillments instead of duplicating in localStorage.",
      priority: "high",
      domainId: "finance"
    });
  }

  recommendations.push({
    id: "rec-dual-write-cutover",
    title: "Complete concierge dual-write cutover",
    summary:
      "Members, introductions, archives, legacy, notifications, and payments still maintain parallel localStorage stores — cut over reads to Postgres first.",
    priority: "high",
    domainId: "members"
  });

  return recommendations;
}

function buildMetrics(tables: DatabaseTableRecord[]): DatabaseHealthMetric[] {
  return DATABASE_HEALTH_STATUSES.map((status) => ({
    status: status.id,
    count: tables.filter((table) => table.health === status.id).length
  }));
}

export type SupabaseHealthReport = {
  generatedAt: string;
  tables: DatabaseTableRecord[];
  duplicateTables: DatabaseTableRecord[];
  unusedTables: DatabaseTableRecord[];
  missingTables: DatabaseTableRecord[];
  metrics: DatabaseHealthMetric[];
  recommendations: DatabaseRecommendation[];
  totalTables: number;
};

export function buildSupabaseHealthReport(): SupabaseHealthReport {
  const inventory = markDuplicateTables(buildDatabaseTableInventory());
  const duplicateNames = new Set(getDuplicateTableGroups().flat());
  const duplicateTables = inventory.filter((table) => duplicateNames.has(table.tableName));
  const missingTables = detectMissingTables(inventory);
  const unusedTables = detectUnusedTables(inventory);
  const allTables = [...inventory, ...missingTables];
  const recommendations = buildRecommendations(duplicateTables, missingTables, inventory);

  return {
    generatedAt: new Date().toISOString(),
    tables: allTables,
    duplicateTables,
    unusedTables,
    missingTables,
    metrics: buildMetrics(allTables),
    recommendations,
    totalTables: allTables.length
  };
}

export function summarizeDomainHealth(
  domainId: DatabaseDomainId,
  tables: DatabaseTableRecord[]
): DatabaseHealthStatusId {
  const domainTables = tables.filter((table) => table.domainIds.includes(domainId));
  if (!domainTables.length) return "missing";

  const statuses = new Set(domainTables.map((table) => table.health));
  if (statuses.has("missing")) return "missing";
  if (statuses.has("needs-migration")) return "needs-migration";
  if (statuses.has("legacy-dependency")) return "legacy-dependency";
  if (statuses.has("partial")) return "partial";
  return "healthy";
}

export function domainHealthLabel(domainId: DatabaseDomainId, status: DatabaseHealthStatusId): string {
  return `${DATABASE_DOMAIN_LABELS[domainId]} — ${status}`;
}
