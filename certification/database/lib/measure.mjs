import { DATABASE_PERF_THRESHOLDS } from "../../../shared/databasePerformanceCertificationDomains.mjs";

async function extensionEnabled(pool, name) {
  const result = await pool.query(`select 1 from pg_extension where extname = $1 limit 1`, [name]);
  return result.rowCount > 0;
}

async function tableExists(pool, tableName) {
  const result = await pool.query(
    `select 1 from information_schema.tables
     where table_schema = 'public' and table_name = $1 limit 1`,
    [tableName]
  );
  return result.rowCount > 0;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Math.round(sorted[Math.max(0, index)]);
}

export async function measureDatabasePerformance(pool) {
  const metrics = {
    avgQueryMs: 0,
    p95Ms: 0,
    p99Ms: 0,
    slowQueryCount: 0,
    cacheHitPercent: 0,
    connectionPoolUsedPercent: 0,
    connectionPoolWaiting: 0,
    databaseSizeBytes: 0,
    largestTables: [],
    largestIndexes: [],
    expensiveEndpoints: [],
    queryPlanSamples: []
  };

  const dbStats = await pool.query(
    `select
       coalesce(blks_hit, 0)::float as blks_hit,
       coalesce(blks_read, 0)::float as blks_read
     from pg_stat_database
     where datname = current_database()
     limit 1`
  );
  const hit = dbStats.rows[0]?.blks_hit ?? 0;
  const read = dbStats.rows[0]?.blks_read ?? 0;
  const total = hit + read;
  metrics.cacheHitPercent = total > 0 ? Math.round((hit / total) * 100) : 100;

  const sizeResult = await pool.query(`select pg_database_size(current_database())::bigint as bytes`);
  metrics.databaseSizeBytes = Number(sizeResult.rows[0]?.bytes ?? 0);

  const tableSizes = await pool.query(
    `select
       relname as name,
       pg_total_relation_size(relid)::bigint as total_bytes,
       n_live_tup::bigint as live_rows,
       seq_scan::bigint as seq_scan,
       idx_scan::bigint as idx_scan
     from pg_stat_user_tables
     where schemaname = 'public'
     order by pg_total_relation_size(relid) desc
     limit 12`
  );
  metrics.largestTables = tableSizes.rows.map((row) => ({
    name: row.name,
    totalBytes: Number(row.total_bytes ?? 0),
    liveRows: Number(row.live_rows ?? 0),
    seqScan: Number(row.seq_scan ?? 0),
    idxScan: Number(row.idx_scan ?? 0)
  }));

  const indexSizes = await pool.query(
    `select
       ui.relname as index_name,
       ut.relname as table_name,
       pg_relation_size(ui.oid)::bigint as index_bytes,
       coalesce(ps.idx_scan, 0)::bigint as idx_scan
     from pg_class ui
     join pg_index i on i.indexrelid = ui.oid
     join pg_class ut on ut.oid = i.indrelid
     join pg_namespace n on n.oid = ui.relnamespace
     left join pg_stat_user_indexes ps on ps.indexrelid = ui.oid
     where n.nspname = 'public' and ui.relkind = 'i'
     order by pg_relation_size(ui.oid) desc
     limit 12`
  );
  metrics.largestIndexes = indexSizes.rows.map((row) => ({
    name: row.index_name,
    tableName: row.table_name,
    indexBytes: Number(row.index_bytes ?? 0),
    idxScan: Number(row.idx_scan ?? 0)
  }));

  if (await extensionEnabled(pool, "pg_stat_statements")) {
    const slowQueries = await pool.query(
      `select
         query,
         calls::int as calls,
         round(mean_exec_time::numeric, 2) as avg_ms,
         round(max_exec_time::numeric, 2) as max_ms
       from pg_stat_statements
       where dbid = (select oid from pg_database where datname = current_database())
       order by mean_exec_time desc
       limit 40`
    );
    const latencies = slowQueries.rows.map((row) => Number(row.avg_ms ?? 0));
    metrics.avgQueryMs = latencies.length
      ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
      : 0;
    metrics.p95Ms = percentile(latencies, 95);
    metrics.p99Ms = percentile(latencies, 99);
    metrics.slowQueryCount = slowQueries.rows.filter(
      (row) => Number(row.avg_ms ?? 0) >= DATABASE_PERF_THRESHOLDS.slowQueryMs
    ).length;
    metrics.queryPlanSamples = slowQueries.rows.slice(0, 8).map((row) => ({
      query: String(row.query ?? "").slice(0, 180),
      calls: Number(row.calls ?? 0),
      avgMs: Number(row.avg_ms ?? 0),
      maxMs: Number(row.max_ms ?? 0)
    }));
  }

  if (await tableExists(pool, "performance_api_profiles")) {
    const endpoints = await pool.query(
      `select path, method, avg_response_ms, p95_ms, p99_ms, throughput_per_min, error_rate
       from performance_api_profiles
       order by p95_ms desc nulls last
       limit 10`
    );
    metrics.expensiveEndpoints = endpoints.rows.map((row) => ({
      path: row.path,
      method: row.method,
      avgResponseMs: Number(row.avg_response_ms ?? 0),
      p95Ms: Number(row.p95_ms ?? 0),
      p99Ms: Number(row.p99_ms ?? 0),
      throughputPerMin: Number(row.throughput_per_min ?? 0),
      errorRate: Number(row.error_rate ?? 0)
    }));
    if (!metrics.p95Ms && metrics.expensiveEndpoints.length) {
      const endpointP95 = metrics.expensiveEndpoints.map((item) => item.p95Ms);
      metrics.p95Ms = percentile(endpointP95, 95);
      metrics.p99Ms = percentile(
        metrics.expensiveEndpoints.map((item) => item.p99Ms),
        99
      );
      metrics.avgQueryMs = Math.round(
        metrics.expensiveEndpoints.reduce((sum, item) => sum + item.avgResponseMs, 0) /
          metrics.expensiveEndpoints.length
      );
    }
  }

  const poolTotal = pool.totalCount ?? 0;
  const poolMax = pool.options?.max ?? 10;
  const poolWaiting = pool.waitingCount ?? 0;
  metrics.connectionPoolUsedPercent =
    poolMax > 0 ? Math.round((poolTotal / poolMax) * 100) : 0;
  metrics.connectionPoolWaiting = poolWaiting;

  return metrics;
}

export async function runStaticPerformanceChecks() {
  const { readFileSync, existsSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");

  const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");
  const migrationPath = join(rootPath, "migrations/0017_performance_center.sql");
  const checks = [];

  checks.push({
    id: "performance-center-migration",
    pass: existsSync(migrationPath),
    critical: true,
    title: "Performance center schema",
    detail: "migrations/0017_performance_center.sql must exist for endpoint profiling."
  });

  if (existsSync(migrationPath)) {
    const source = readFileSync(migrationPath, "utf8");
    checks.push({
      id: "performance-api-profiles-table",
      pass: source.includes("performance_api_profiles"),
      critical: false,
      title: "API profile table",
      detail: "performance_api_profiles supports expensive endpoint measurement."
    });
    checks.push({
      id: "performance-database-profiles-table",
      pass: source.includes("performance_database_profiles"),
      critical: false,
      title: "Database profile table",
      detail: "performance_database_profiles supports database telemetry."
    });
  }

  const passed = checks.filter((item) => item.pass).length;
  return {
    checks,
    objectsScanned: checks.length,
    passed,
    failed: checks.length - passed
  };
}
