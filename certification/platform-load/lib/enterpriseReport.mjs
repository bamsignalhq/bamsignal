import { PLATFORM_LOAD_BASELINE } from "../../../shared/platformLoadCertification.mjs";

function row({ rootCause, evidence, impact, fix, before, after }) {
  return { rootCause, evidence, impact, fix, before, after };
}

export function buildEnterpriseLoadReport(simulation) {
  const m = simulation.measurement;
  const entries = [];

  const pageFailures = m.endpoints
    .filter((item) => item.failures > 0 && item.method === "GET")
    .reduce((sum, item) => sum + item.failures, 0);

  if (pageFailures > 0 || PLATFORM_LOAD_BASELINE.requestFailures > 0) {
    entries.push(
      row({
        rootCause: "SPA fallback used per-request sendFile under concurrent page load",
        evidence: `${PLATFORM_LOAD_BASELINE.requestFailures} GET page failures in baseline; hotspots /chats (${m.endpoints.find((e) => e.path === "/chats")?.failures ?? "n/a"}), /signals, /home`,
        impact: "Member journey aborts when index.html delivery fails or stalls under burst concurrency",
        fix: "Serve cached in-memory index.html for SPA routes; load-cert HTTP keep-alive + idempotent GET retries",
        before: `${PLATFORM_LOAD_BASELINE.journeysPassed}/1000 journeys · ${PLATFORM_LOAD_BASELINE.requestFailures} request failures`,
        after: `${simulation.journeysPassed}/${simulation.virtualMembers} journeys · ${m.failures} request failures`
      })
    );
  }

  const connectionIssues = (m.failureClassification || []).find((item) => item.category === "connection_exhaustion");
  if (connectionIssues?.count || PLATFORM_LOAD_BASELINE.maxQueueDepth >= 60) {
    entries.push(
      row({
        rootCause: "Load runner opened fresh fetch sockets without connection reuse",
        evidence: `Queue depth peaked at ${PLATFORM_LOAD_BASELINE.maxQueueDepth} baseline; instrumentation connectionReuseHint=${m.instrumentation?.connectionReuseHint ?? 0}`,
        impact: "Transient socket exhaustion and ECONNRESET under 100-way concurrency",
        fix: "Undici Agent with keep-alive (128 connections) shared across virtual members",
        before: `Queue depth ${PLATFORM_LOAD_BASELINE.maxQueueDepth} · no connection pooling`,
        after: `Queue depth ${m.queueDepth.max} · keep-alive agent active`
      })
    );
  }

  const retriesUsed = m.instrumentation?.retryAttempts ?? 0;
  const retriesRecovered = m.instrumentation?.retryRecoveries ?? 0;
  if (retriesUsed > 0 || retriesRecovered > 0 || PLATFORM_LOAD_BASELINE.requestFailures > 0) {
    entries.push(
      row({
        rootCause: "No retry policy for transient idempotent GET failures",
        evidence: `Baseline ${PLATFORM_LOAD_BASELINE.failureRatePercent}% failure rate with max page latency 1585ms`,
        impact: "Single timeout or 503 permanently marks journey failed despite recoverable blip",
        fix: "Exponential backoff retries (max 4) for GET/HEAD/probes on retriable statuses",
        before: "0 retries · failures counted immediately",
        after: `${retriesUsed} retry attempts · ${retriesRecovered} recoveries`
      })
    );
  }

  if (simulation.journeysFailed > 0) {
    for (const item of m.failureClassification || []) {
      entries.push(
        row({
          rootCause: `Residual ${item.category} failures after hardening`,
          evidence: item.samples?.map((sample) => `${sample.method} ${sample.path} status=${sample.status}`).join("; ") || `${item.count} events`,
          impact: "Prevents 1000/1000 certification until eliminated",
          fix: "Review endpoint capacity and extend instrumentation sampling",
          before: `${PLATFORM_LOAD_BASELINE.journeysFailed} journey failures`,
          after: `${simulation.journeysFailed} journey failures (${item.count} ${item.category})`
        })
      );
    }
  }

  if (!entries.length) {
    entries.push(
      row({
        rootCause: "Baseline bottlenecks eliminated",
        evidence: `Score ${simulation.measurement.failureRatePercent}% failure rate · ${simulation.journeysPassed}/${simulation.virtualMembers} journeys`,
        impact: "Enterprise load gate ready for release candidate",
        fix: "Continue weekly 1000-member certification before major releases",
        before: `${PLATFORM_LOAD_BASELINE.loadScore}% · ${PLATFORM_LOAD_BASELINE.journeysPassed}/1000 · ${PLATFORM_LOAD_BASELINE.bottlenecks} bottleneck`,
        after: `100% · ${simulation.journeysPassed}/${simulation.virtualMembers} · 0 bottlenecks`
      })
    );
  }

  return {
    baselineRunId: PLATFORM_LOAD_BASELINE.runId,
    entries,
    summary: {
      before: {
        loadScore: PLATFORM_LOAD_BASELINE.loadScore,
        journeysPassed: PLATFORM_LOAD_BASELINE.journeysPassed,
        journeysFailed: PLATFORM_LOAD_BASELINE.journeysFailed,
        requestFailures: PLATFORM_LOAD_BASELINE.requestFailures,
        maxQueueDepth: PLATFORM_LOAD_BASELINE.maxQueueDepth,
        bottlenecks: PLATFORM_LOAD_BASELINE.bottlenecks
      },
      after: {
        loadScore: simulation.journeysFailed === 0 && (m.failures || 0) === 0 ? 100 : null,
        journeysPassed: simulation.journeysPassed,
        journeysFailed: simulation.journeysFailed,
        requestFailures: m.failures,
        maxQueueDepth: m.queueDepth.max,
        bottlenecks: simulation.journeysFailed > 0 ? 1 : 0
      }
    }
  };
}

export function enterpriseReportMarkdown(report) {
  const lines = [
    "## Enterprise Load Report",
    "",
    `Baseline run: \`${report.baselineRunId}\``,
    "",
    "| Root Cause | Evidence | Impact | Fix | Before | After |",
    "|------------|----------|--------|-----|--------|-------|"
  ];

  for (const entry of report.entries) {
    lines.push(
      `| ${entry.rootCause.replace(/\|/g, "\\|")} | ${entry.evidence.replace(/\|/g, "\\|")} | ${entry.impact.replace(/\|/g, "\\|")} | ${entry.fix.replace(/\|/g, "\\|")} | ${entry.before.replace(/\|/g, "\\|")} | ${entry.after.replace(/\|/g, "\\|")} |`
    );
  }

  lines.push("");
  return lines.join("\n");
}
