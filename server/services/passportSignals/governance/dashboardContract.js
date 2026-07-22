/**
 * Governance dashboard contract — backend snapshot for future UI.
 */

import { getDatabaseStatus } from "../../../db.js";
import { listReviewQueue, getReviewQueueCounts } from "./reviewQueue.js";
import { listContributorHealth } from "./contributorHealth.js";
import { listGovernanceActions } from "./actions.js";
import { listRecentReplayEvents } from "./replayMonitor.js";
import { getPassportSignalMetrics } from "../observability.js";

export async function buildGovernanceDashboardSnapshot() {
  const queueCounts = await getReviewQueueCounts();
  const contributorHealth = await listContributorHealth();
  const pipelineMetrics = getPassportSignalMetrics();
  const recentGovernanceActions = await listGovernanceActions({ limit: 20 });
  const replayAlerts = await listRecentReplayEvents({ limit: 10 });
  const pendingQueue = await listReviewQueue({ limit: 10 });

  return {
    generatedAt: new Date().toISOString(),
    signalQueue: {
      ...queueCounts,
      items: pendingQueue
    },
    contributorHealth,
    pipelineMetrics,
    recentGovernanceActions,
    validationFailures: pipelineMetrics.validationFailures || 0,
    consentFailures: pipelineMetrics.consentFailures || 0,
    replayAlerts,
    systemHealth: {
      database: getDatabaseStatus(),
      ingestion: pipelineMetrics.ingestionFailure > 0 ? "degraded" : "operational"
    }
  };
}
