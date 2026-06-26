import {
  DATABASE_PERF_CERT_AREAS,
  DATABASE_PERF_THRESHOLDS
} from "../../../shared/databasePerformanceCertificationDomains.mjs";

function areaResult(id, label, partial = {}) {
  return {
    id,
    label,
    objectsScanned: 0,
    criticalIssues: [],
    warnings: [],
    passed: true,
    ...partial
  };
}

function critical(areaId, id, title, detail, count = 1) {
  return { id, areaId, title, detail, severity: "critical", count };
}

function warning(areaId, id, title, detail, count = 1) {
  return { id, areaId, title, detail, severity: "warning", count };
}

async function extensionEnabled(pool, name) {
  const result = await pool.query(`select 1 from pg_extension where extname = $1 limit 1`, [name]);
  return result.rowCount > 0;
}

export async function runDatabasePerformanceChecks(pool, metrics) {
  const areas = [];
  const threshold = DATABASE_PERF_THRESHOLDS;

  const slowQueries = areaResult("slow-queries", "Slow queries", {
    objectsScanned: metrics.queryPlanSamples.length + metrics.slowQueryCount
  });
  if (metrics.p99Ms >= threshold.p99CriticalMs) {
    slowQueries.criticalIssues.push(
      critical(
        "slow-queries",
        "p99-critical",
        "P99 query latency critical",
        `P99 ${metrics.p99Ms}ms exceeds ${threshold.p99CriticalMs}ms threshold.`,
        metrics.slowQueryCount || 1
      )
    );
  } else if (metrics.p95Ms >= threshold.p95CriticalMs) {
    slowQueries.criticalIssues.push(
      critical(
        "slow-queries",
        "p95-critical",
        "P95 query latency critical",
        `P95 ${metrics.p95Ms}ms exceeds ${threshold.p95CriticalMs}ms threshold.`
      )
    );
  }
  if (metrics.slowQueryCount > 0 && !slowQueries.criticalIssues.length) {
    slowQueries.warnings.push(
      warning(
        "slow-queries",
        "slow-query-count",
        "Slow queries detected",
        `${metrics.slowQueryCount} statement(s) average above ${threshold.slowQueryMs}ms.`
      )
    );
  }
  if (!metrics.queryPlanSamples.length && !(await extensionEnabled(pool, "pg_stat_statements"))) {
    slowQueries.warnings.push(
      warning(
        "slow-queries",
        "pg-stat-statements-missing",
        "pg_stat_statements unavailable",
        "Enable pg_stat_statements for precise slow-query telemetry."
      )
    );
  }
  slowQueries.passed = slowQueries.criticalIssues.length === 0;
  areas.push(slowQueries);

  const missingIndexes = areaResult("missing-indexes", "Missing indexes");
  const seqHeavy = metrics.largestTables.filter(
    (table) =>
      table.liveRows >= threshold.seqScanRowThreshold &&
      table.seqScan > table.idxScan &&
      table.seqScan > 0
  );
  missingIndexes.objectsScanned = metrics.largestTables.length;
  if (seqHeavy.length) {
    missingIndexes.warnings.push(
      warning(
        "missing-indexes",
        "seq-heavy-tables",
        "Tables likely missing indexes",
        `${seqHeavy.length} table(s) rely on sequential scans: ${seqHeavy
          .slice(0, 4)
          .map((item) => item.name)
          .join(", ")}.`,
        seqHeavy.length
      )
    );
  }
  missingIndexes.passed = missingIndexes.criticalIssues.length === 0;
  areas.push(missingIndexes);

  const unusedIndexes = areaResult("unused-indexes", "Unused indexes");
  const unused = metrics.largestIndexes.filter((item) => item.idxScan === 0);
  unusedIndexes.objectsScanned = metrics.largestIndexes.length;
  if (unused.length) {
    unusedIndexes.warnings.push(
      warning(
        "unused-indexes",
        "zero-scan-indexes",
        "Unused indexes detected",
        `${unused.length} index(es) have zero scans: ${unused
          .slice(0, 4)
          .map((item) => item.name)
          .join(", ")}.`,
        unused.length
      )
    );
  }
  unusedIndexes.passed = unusedIndexes.criticalIssues.length === 0;
  areas.push(unusedIndexes);

  const duplicateIndexes = areaResult("duplicate-indexes", "Duplicate indexes");
  const dupResult = await pool.query(
    `select
       t.relname as table_name,
       array_agg(i.relname order by i.relname) as index_names,
       count(*)::int as duplicate_count
     from pg_index x
     join pg_class i on i.oid = x.indexrelid
     join pg_class t on t.oid = x.indrelid
     join pg_namespace n on n.oid = t.relnamespace
     where n.nspname = 'public'
     group by t.relname, x.indkey, x.indclass, x.indoption, x.indexprs, x.indpred
     having count(*) > 1
     limit 20`
  );
  duplicateIndexes.objectsScanned = dupResult.rowCount;
  if (dupResult.rowCount > 0) {
    duplicateIndexes.warnings.push(
      warning(
        "duplicate-indexes",
        "duplicate-index-definitions",
        "Duplicate index definitions",
        `${dupResult.rowCount} duplicate index group(s) detected on public tables.`,
        dupResult.rowCount
      )
    );
  }
  duplicateIndexes.passed = duplicateIndexes.criticalIssues.length === 0;
  areas.push(duplicateIndexes);

  const sequentialScans = areaResult("sequential-scans", "Sequential scans");
  const heavySeq = metrics.largestTables.filter(
    (table) => table.seqScan >= 100 && table.liveRows >= threshold.seqScanRowThreshold
  );
  sequentialScans.objectsScanned = metrics.largestTables.length;
  if (heavySeq.length) {
    sequentialScans.criticalIssues.push(
      critical(
        "sequential-scans",
        "heavy-seq-scan",
        "Heavy sequential scans on large tables",
        `${heavySeq.length} large table(s) show sustained sequential scans.`,
        heavySeq.length
      )
    );
  }
  sequentialScans.passed = sequentialScans.criticalIssues.length === 0;
  areas.push(sequentialScans);

  const connectionPool = areaResult("connection-pool", "Connection pool", {
    objectsScanned: 1
  });
  if (metrics.connectionPoolUsedPercent >= threshold.poolUsageCriticalPercent) {
    connectionPool.criticalIssues.push(
      critical(
        "connection-pool",
        "pool-saturated",
        "Connection pool saturated",
        `Pool utilization ${metrics.connectionPoolUsedPercent}% with ${metrics.connectionPoolWaiting} waiting client(s).`
      )
    );
  } else if (metrics.connectionPoolWaiting > 0) {
    connectionPool.warnings.push(
      warning(
        "connection-pool",
        "pool-waiting",
        "Clients waiting on pool",
        `${metrics.connectionPoolWaiting} client(s) waiting for a database connection.`
      )
    );
  }
  connectionPool.passed = connectionPool.criticalIssues.length === 0;
  areas.push(connectionPool);

  const queryPlans = areaResult("query-plans", "Query plans", {
    objectsScanned: metrics.queryPlanSamples.length
  });
  const badPlans = metrics.queryPlanSamples.filter(
    (item) => item.avgMs >= threshold.p95CriticalMs
  );
  if (badPlans.length) {
    queryPlans.criticalIssues.push(
      critical(
        "query-plans",
        "expensive-plans",
        "Expensive query plans",
        `${badPlans.length} tracked statement(s) exceed ${threshold.p95CriticalMs}ms average.`,
        badPlans.length
      )
    );
  }
  queryPlans.passed = queryPlans.criticalIssues.length === 0;
  areas.push(queryPlans);

  const tableGrowth = areaResult("table-growth", "Table growth", {
    objectsScanned: metrics.largestTables.length
  });
  const largeTables = metrics.largestTables.filter(
    (table) => table.totalBytes >= threshold.tableSizeWarningMb * 1024 * 1024
  );
  if (largeTables.length) {
    tableGrowth.warnings.push(
      warning(
        "table-growth",
        "large-tables",
        "Large tables detected",
        `${largeTables.length} table(s) exceed ${threshold.tableSizeWarningMb}MB: ${largeTables
          .slice(0, 3)
          .map((item) => item.name)
          .join(", ")}.`,
        largeTables.length
      )
    );
  }
  tableGrowth.passed = tableGrowth.criticalIssues.length === 0;
  areas.push(tableGrowth);

  const storageGrowth = areaResult("storage-growth", "Storage growth", { objectsScanned: 1 });
  const storageGb = metrics.databaseSizeBytes / (1024 * 1024 * 1024);
  if (storageGb >= threshold.storageWarningGb) {
    storageGrowth.warnings.push(
      warning(
        "storage-growth",
        "database-size",
        "Database storage elevated",
        `Database size ${storageGb.toFixed(2)}GB exceeds ${threshold.storageWarningGb}GB watch threshold.`
      )
    );
  }
  if (metrics.cacheHitPercent < threshold.cacheHitWarningPercent) {
    storageGrowth.criticalIssues.push(
      critical(
        "storage-growth",
        "cache-hit-low",
        "Buffer cache hit rate low",
        `Cache hit ${metrics.cacheHitPercent}% below ${threshold.cacheHitWarningPercent}% threshold.`
      )
    );
  }
  storageGrowth.passed = storageGrowth.criticalIssues.length === 0;
  areas.push(storageGrowth);

  void DATABASE_PERF_CERT_AREAS;
  return areas;
}

export function detectQueryRegressions(currentMetrics, previousReport) {
  if (!previousReport?.metrics) return [];
  const regressions = [];
  const threshold = DATABASE_PERF_THRESHOLDS.regressionP95IncreasePercent;

  if (previousReport.metrics.p95Ms > 0 && currentMetrics.p95Ms > 0) {
    const increase =
      ((currentMetrics.p95Ms - previousReport.metrics.p95Ms) / previousReport.metrics.p95Ms) * 100;
    if (increase >= threshold) {
      regressions.push(
        critical(
          "slow-queries",
          "p95-regression",
          "Critical P95 query regression",
          `P95 increased ${Math.round(increase)}% (${previousReport.metrics.p95Ms}ms → ${currentMetrics.p95Ms}ms).`,
          1
        )
      );
    }
  }

  if (
    previousReport.metrics.slowQueryCount >= 0 &&
    currentMetrics.slowQueryCount > previousReport.metrics.slowQueryCount + 5
  ) {
    regressions.push(
      critical(
        "slow-queries",
        "slow-query-regression",
        "Critical slow-query regression",
        `Slow query count rose from ${previousReport.metrics.slowQueryCount} to ${currentMetrics.slowQueryCount}.`,
        currentMetrics.slowQueryCount - previousReport.metrics.slowQueryCount
      )
    );
  }

  if (
    previousReport.metrics.cacheHitPercent > 0 &&
    currentMetrics.cacheHitPercent < previousReport.metrics.cacheHitPercent - 10
  ) {
    regressions.push(
      critical(
        "storage-growth",
        "cache-hit-regression",
        "Critical cache-hit regression",
        `Cache hit dropped ${previousReport.metrics.cacheHitPercent}% → ${currentMetrics.cacheHitPercent}%.`
      )
    );
  }

  return regressions;
}
