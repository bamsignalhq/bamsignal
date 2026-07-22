/**
 * Admin dashboard contract — expanded operational snapshot. No frontend.
 */

import { getDeploymentMetadata, getUptimeSeconds } from "../../deployMetadata.js";
import { getDatabaseStatus, checkSchema } from "../../db.js";
import { getStartupValidation } from "../startupBootstrap.js";
import { getInfrastructureMetrics } from "../infrastructureObservability.js";
import { PRODUCTION_CERT_VERSION } from "../../../shared/productionCertification.mjs";
import { getAuthObservabilityMetrics } from "../auth/observability.js";
import { getFinancialObservabilityMetrics } from "../finance/observability.js";
import { getMessagingObservabilityMetrics } from "../messaging/observability.js";
import {
  getOperationsObservabilityMetrics,
  refreshOperationalQueueDepths
} from "./observability.js";
import { getConciergeMetrics } from "./concierge.js";
import { getRuntimeConfiguration } from "./featureFlags.js";
import { listModerationQueue } from "./moderation.js";
import { listSupportQueue } from "./support.js";

export async function buildAdminOperationsDashboardContract() {
  await refreshOperationalQueueDepths();

  const deploy = getDeploymentMetadata("bamsignal");
  const validation = getStartupValidation();
  const schema = await checkSchema();
  const infrastructure = getInfrastructureMetrics();
  const operations = getOperationsObservabilityMetrics();
  const concierge = await getConciergeMetrics();
  const runtimeConfig = await getRuntimeConfiguration();
  const openModeration = await listModerationQueue({ status: "submitted", limit: 5 });
  const openSupport = await listSupportQueue({ status: "open", limit: 5 });

  return {
    generatedAt: new Date().toISOString(),
    contract: "admin-operations-dashboard-v1",
    platformHealth: {
      status: getDatabaseStatus() === "connected" && validation?.ok ? "operational" : "degraded",
      database: getDatabaseStatus(),
      uptimeSeconds: getUptimeSeconds(),
      environment: deploy.environment
    },
    infrastructure: {
      startupDurationMs: infrastructure.startupDurationMs,
      migrationDurationMs: infrastructure.migrationDurationMs,
      readinessRequests: infrastructure.readinessRequests,
      healthRequests: infrastructure.healthRequests,
      schemaStatus: schema.ok ? "verified" : "degraded"
    },
    authentication: getAuthObservabilityMetrics(),
    finance: getFinancialObservabilityMetrics(),
    messaging: getMessagingObservabilityMetrics(),
    realtime: {
      eventsPublished: getMessagingObservabilityMetrics().realtimeEventsPublished || 0
    },
    moderation: {
      queueDepth: operations.moderationQueueDepth,
      openReportsSample: openModeration.length,
      appealVolume: operations.appealVolume,
      avgModerationMinutes: operations.moderationAvgMinutes
    },
    support: {
      queueDepth: operations.supportQueueDepth,
      openTicketsSample: openSupport.length,
      ticketsOpened: operations.supportTicketsOpened,
      ticketsResolved: operations.supportTicketsResolved,
      avgResponseMinutes: operations.supportResponseAvgMinutes,
      avgResolutionMinutes: operations.supportResolutionAvgMinutes,
      escalations: operations.supportEscalations
    },
    concierge: {
      ...concierge,
      queueDepth: operations.conciergeQueueDepth,
      casesCompleted: operations.conciergeCasesCompleted,
      escalations: operations.conciergeEscalations
    },
    revenue: {
      revenueKobo: getFinancialObservabilityMetrics().revenueKobo || 0
    },
    subscriptions: {
      activations: getFinancialObservabilityMetrics().subscriptionActivations || 0
    },
    matches: {
      placeholder: true
    },
    messages: {
      sent: getMessagingObservabilityMetrics().messagesSent || 0,
      delivered: getMessagingObservabilityMetrics().messagesDelivered || 0
    },
    dailyActiveUsers: {
      placeholder: true
    },
    growth: {
      placeholder: true
    },
    certification: {
      version: PRODUCTION_CERT_VERSION,
      executions: infrastructure.certificationExecutions
    },
    operations: {
      ...operations,
      moderatorWorkload: operations.moderatorWorkload,
      supportWorkload: operations.supportWorkload,
      conciergeWorkload: operations.conciergeWorkload,
      incidentCount: operations.incidentCount,
      operationalSlaBreaches: operations.operationalSlaBreaches
    },
    featureFlags: Array.isArray(runtimeConfig)
      ? runtimeConfig.map((row) => ({
          key: row.config_key,
          enabled: row.enabled,
          rolloutPercentage: row.rollout_percentage
        }))
      : [],
    trust: {
      placeholder: true
    }
  };
}
