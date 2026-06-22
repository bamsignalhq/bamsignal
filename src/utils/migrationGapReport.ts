import { DATABASE_DOMAINS, DATABASE_HEALTH_STATUSES, type DatabaseDomainId } from "../constants/databaseAudit";
import type { DatabaseAuditReport, MigrationGap } from "../types/databaseAudit";
import {
  buildLocalStorageDependencies,
  buildDatabaseTableInventory
} from "./databaseAudit";
import { buildSupabaseHealthReport, summarizeDomainHealth } from "./supabaseHealthReport";

function buildMigrationGaps(): MigrationGap[] {
  return DATABASE_DOMAINS.map((domain) => {
    const dependencies = buildLocalStorageDependencies().filter((dep) => dep.domainId === domain.id);
    const tables = buildDatabaseTableInventory().filter((table) => table.domainIds.includes(domain.id));
    const localStorageKeys = dependencies.map((dep) => dep.storageKey);
    const expectedTables = tables.map((table) => table.tableName);
    const status = summarizeDomainHealth(domain.id, tables);

    let summary = "";
    if (status === "healthy") {
      summary = "Postgres tables verified in baseline schema with no blocking localStorage dependency.";
    } else if (status === "partial") {
      summary = "Postgres migration exists and server persistence is active, but localStorage engines still hold parallel state.";
    } else if (status === "legacy-dependency") {
      summary = "Domain relies on localStorage admin engines without a dedicated Postgres table.";
    } else if (status === "needs-migration") {
      summary = "Migration SQL exists but schema verification and client cutover are incomplete.";
    } else {
      summary = "Expected Postgres tables are not defined in migrations for this domain.";
    }

    return {
      id: `gap-${domain.id}`,
      domainId: domain.id,
      title: domain.label,
      summary,
      status,
      localStorageKeys,
      expectedTables
    };
  });
}

function buildDependencyMetrics(dependencies: ReturnType<typeof buildLocalStorageDependencies>) {
  return DATABASE_HEALTH_STATUSES.map((status) => ({
    status: status.id,
    count: dependencies.filter((dep) => dep.health === status.id).length
  }));
}

export function buildMigrationGapReport(): DatabaseAuditReport {
  const supabaseReport = buildSupabaseHealthReport();
  const dependencies = buildLocalStorageDependencies();
  const migrationGaps = buildMigrationGaps();

  const dependencyMetrics = buildDependencyMetrics(dependencies);

  const combinedMetrics = DATABASE_HEALTH_STATUSES.map((status) => ({
    status: status.id,
    count:
      (supabaseReport.metrics.find((metric) => metric.status === status.id)?.count ?? 0) +
      (dependencyMetrics.find((metric) => metric.status === status.id)?.count ?? 0)
  }));

  return {
    generatedAt: new Date().toISOString(),
    tables: supabaseReport.tables,
    dependencies,
    migrationGaps,
    recommendations: supabaseReport.recommendations,
    duplicateTables: supabaseReport.duplicateTables,
    unusedTables: supabaseReport.unusedTables,
    missingTables: supabaseReport.missingTables,
    metrics: combinedMetrics,
    totalTables: supabaseReport.totalTables
  };
}

export function filterGapsByDomain(
  gaps: MigrationGap[],
  domainId: DatabaseDomainId | "all"
): MigrationGap[] {
  if (domainId === "all") return gaps;
  return gaps.filter((gap) => gap.domainId === domainId);
}
