import {
  JOURNEY_HEALTH_STATUSES,
  type JourneyHealthStatusId
} from "../constants/journeyIntegrityAudit";
import { CONCIERGE_CONSULTANT_SEED } from "../data/conciergeConsultantSeed";
import { isValidJourneyId } from "../constants/journeyId";
import type {
  JourneyIntegrityIssue,
  JourneyIntegrityReport,
  JourneyRepairRecommendation
} from "../types/journeyIntegrityAudit";
import {
  buildCanonicalJourneyRecords,
  buildJourneyDependencies,
  collectReferencedJourneyIds,
  findDuplicateJourneyIds,
  findFinanceRecordsMissingJourneyRef,
  findMissingJourneyIdMembers
} from "./journeyIntegrityAudit";

function buildMetrics(issues: JourneyIntegrityIssue[]) {
  const metrics = JOURNEY_HEALTH_STATUSES.map((item) => ({
    status: item.id,
    count: issues.filter((issue) => issue.status === item.id).length
  }));

  const journeys = buildCanonicalJourneyRecords();
  for (const journey of journeys) {
    const metric = metrics.find((item) => item.status === journey.status);
    if (metric) metric.count += 1;
  }

  return metrics;
}

function detectTimelineIssues(): JourneyIntegrityIssue[] {
  const issues: JourneyIntegrityIssue[] = [];

  for (const member of CONCIERGE_CONSULTANT_SEED) {
    if (!member.journeyId || !member.timeline?.length) continue;
    const journeyId = member.journeyId;

    for (const event of member.timeline) {
      if (event.journeyId && event.journeyId !== journeyId) {
        issues.push({
          id: `timeline-journey-mismatch-${event.id}`,
          kind: "timeline-inconsistency",
          title: "Timeline journey mismatch",
          summary: `Timeline event ${event.id} references ${event.journeyId} but member journey is ${journeyId}.`,
          status: "broken",
          journeyIds: [journeyId, event.journeyId]
        });
      }
    }

    const sorted = [...member.timeline].sort((left, right) => Date.parse(left.at) - Date.parse(right.at));
    for (let index = 1; index < sorted.length; index += 1) {
      if (Date.parse(sorted[index].at) < Date.parse(sorted[index - 1].at)) {
        issues.push({
          id: `timeline-order-${member.id}`,
          kind: "timeline-inconsistency",
          title: "Timeline order inconsistency",
          summary: `Journey ${journeyId} timeline events are not chronologically ordered.`,
          status: "partial",
          journeyIds: [journeyId]
        });
        break;
      }
    }

    const createdAt = Date.parse(member.createdAt);
    const firstConsultation = member.timeline.find((event) => event.type === "consultation-completed");
    if (firstConsultation && Date.parse(firstConsultation.at) < createdAt) {
      issues.push({
        id: `timeline-before-application-${member.id}`,
        kind: "timeline-inconsistency",
        title: "Consultation before application",
        summary: `Journey ${journeyId} has consultation completed before application received date.`,
        status: "broken",
        journeyIds: [journeyId]
      });
    }
  }

  return issues;
}

function detectArchiveIssues(): JourneyIntegrityIssue[] {
  const issues: JourneyIntegrityIssue[] = [];

  for (const member of CONCIERGE_CONSULTANT_SEED) {
    if (!member.journeyId) continue;
    const journeyId = member.journeyId;
    const archive = member.journeyArchive;

    if (member.status === "legacy-archive" && !archive) {
      issues.push({
        id: `archive-missing-${member.id}`,
        kind: "archive-inconsistency",
        title: "Legacy archive status without metadata",
        summary: `Journey ${journeyId} is legacy-archive but journeyArchive metadata is missing.`,
        status: "critical",
        journeyIds: [journeyId]
      });
    }

    if (archive && member.status !== "legacy-archive" && member.status !== "married") {
      issues.push({
        id: `archive-status-mismatch-${member.id}`,
        kind: "archive-inconsistency",
        title: "Archive metadata with active status",
        summary: `Journey ${journeyId} has archive metadata but member status is ${member.status}.`,
        status: "partial",
        journeyIds: [journeyId]
      });
    }

    if (archive?.marriedAt && archive.archivedAt) {
      if (Date.parse(archive.archivedAt) < Date.parse(archive.marriedAt)) {
        issues.push({
          id: `archive-before-marriage-${member.id}`,
          kind: "archive-inconsistency",
          title: "Archive before marriage date",
          summary: `Journey ${journeyId} archivedAt precedes marriedAt.`,
          status: "broken",
          journeyIds: [journeyId]
        });
      }
    }
  }

  return issues;
}

function buildRecommendations(issues: JourneyIntegrityIssue[]): JourneyRepairRecommendation[] {
  const recommendations: JourneyRepairRecommendation[] = [];

  const orphanIssues = issues.filter((issue) => issue.kind === "orphan-record");
  if (orphanIssues.length) {
    recommendations.push({
      id: "repair-orphans",
      title: "Reconcile orphan journey references",
      summary:
        "Link audit, finance, and quality records to canonical member journeys or create missing member registry entries.",
      priority: "high",
      journeyId: orphanIssues[0]?.journeyIds[0] ?? null
    });
  }

  const missingFinance = findFinanceRecordsMissingJourneyRef();
  if (missingFinance > 0) {
    recommendations.push({
      id: "repair-finance-journey-ref",
      title: "Attach journey IDs to finance records",
      summary: `${missingFinance} finance record(s) have null journeyRef — attach BS-JR IDs for traceability.`,
      priority: "high",
      journeyId: null
    });
  }

  const duplicates = findDuplicateJourneyIds();
  if (duplicates.length) {
    recommendations.push({
      id: "repair-duplicates",
      title: "Resolve duplicate journey IDs",
      summary: `Duplicate IDs detected: ${duplicates.join(", ")}. Reissue unique journey IDs from the registry.`,
      priority: "high",
      journeyId: duplicates[0] ?? null
    });
  }

  const archiveIssues = issues.filter((issue) => issue.kind === "archive-inconsistency");
  if (archiveIssues.length) {
    recommendations.push({
      id: "repair-archive",
      title: "Align archive metadata with journey status",
      summary: "Sync journeyArchive fields with member status and lifecycle dates.",
      priority: "medium",
      journeyId: archiveIssues[0]?.journeyIds[0] ?? null
    });
  }

  const timelineIssues = issues.filter((issue) => issue.kind === "timeline-inconsistency");
  if (timelineIssues.length) {
    recommendations.push({
      id: "repair-timeline",
      title: "Normalize journey timelines",
      summary: "Ensure timeline events carry the correct journeyId and chronological order.",
      priority: "medium",
      journeyId: timelineIssues[0]?.journeyIds[0] ?? null
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: "repair-none",
      title: "No repairs required",
      summary: "Canonical journey registry and cross-system references are aligned.",
      priority: "low",
      journeyId: null
    });
  }

  return recommendations;
}

export function buildJourneyIntegrityReport(): JourneyIntegrityReport {
  const journeys = buildCanonicalJourneyRecords();
  const dependencies = buildJourneyDependencies();
  const canonicalIds = new Set(journeys.map((journey) => journey.journeyId));
  const references = collectReferencedJourneyIds();
  const issues: JourneyIntegrityIssue[] = [];

  const missingMembers = findMissingJourneyIdMembers();
  if (missingMembers.length) {
    issues.push({
      id: "missing-journey-id-members",
      kind: "missing-journey-id",
      title: "Members without journey IDs",
      summary: `${missingMembers.length} concierge member record(s) are missing journeyId.`,
      status: "critical",
      journeyIds: []
    });
  }

  const duplicates = findDuplicateJourneyIds();
  if (duplicates.length) {
    issues.push({
      id: "duplicate-journey-ids",
      kind: "duplicate-journey-id",
      title: "Duplicate journey IDs in registry",
      summary: `Duplicate journey IDs: ${duplicates.join(", ")}.`,
      status: "critical",
      journeyIds: duplicates
    });
  }

  for (const [journeyId, sources] of references.entries()) {
    if (!isValidJourneyId(journeyId)) {
      issues.push({
        id: `invalid-format-${journeyId}`,
        kind: "broken-link",
        title: "Invalid journey ID format",
        summary: `Journey reference ${journeyId} does not match BS-JR-YYYY-NNNN format.`,
        status: "broken",
        journeyIds: [journeyId]
      });
      continue;
    }

    const externalSources = sources.filter((source) => source !== "conciergeConsultantSeed");
    if (!canonicalIds.has(journeyId) && externalSources.length) {
      issues.push({
        id: `orphan-${journeyId}`,
        kind: "orphan-record",
        title: "Orphan journey reference",
        summary: `Journey ${journeyId} is referenced by ${externalSources.join(", ")} but missing from the member registry.`,
        status: "critical",
        journeyIds: [journeyId]
      });
    }
  }

  const missingFinance = findFinanceRecordsMissingJourneyRef();
  if (missingFinance > 0) {
    issues.push({
      id: "finance-missing-journey-ref",
      kind: "missing-journey-id",
      title: "Finance records missing journeyRef",
      summary: `${missingFinance} finance operation record(s) have null journeyRef.`,
      status: "partial",
      journeyIds: []
    });
  }

  issues.push(...detectTimelineIssues(), ...detectArchiveIssues());

  const brokenDependencies = dependencies.filter((dependency) => !dependency.linked);
  if (brokenDependencies.length) {
    issues.push({
      id: "broken-cross-system-links",
      kind: "broken-link",
      title: "Broken cross-system journey links",
      summary: `${brokenDependencies.length} dependency record(s) reference journeys outside the canonical registry.`,
      status: "broken",
      journeyIds: [...new Set(brokenDependencies.map((dependency) => dependency.journeyId))]
    });
  }

  const recommendations = buildRecommendations(issues);
  const metrics = buildMetrics(issues);

  return {
    generatedAt: new Date().toISOString(),
    journeys,
    dependencies,
    issues,
    recommendations,
    metrics,
    totalJourneys: journeys.length
  };
}

export function summarizeJourneyIntegrityStatus(
  report: JourneyIntegrityReport
): JourneyHealthStatusId {
  if (report.issues.some((issue) => issue.status === "critical")) return "critical";
  if (report.issues.some((issue) => issue.status === "broken")) return "broken";
  if (report.issues.some((issue) => issue.status === "partial")) return "partial";
  if (report.journeys.some((journey) => journey.status !== "healthy")) return "partial";
  return "healthy";
}
