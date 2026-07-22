/**
 * Passport signal governance — operational layer (Phase 3).
 */

export {
  LIFECYCLE_TRANSITIONS,
  TERMINAL_STATUSES,
  canTransition,
  targetStatusForAction,
  isTerminalStatus,
  lifecycleStatusAfterIngestion
} from "./lifecycle.js";

export { appendSignalHistory, listSignalHistory, mapHistoryRow } from "./history.js";

export {
  applyGovernanceAction,
  approveSignal,
  rejectSignal,
  revokeSignal,
  restoreSignal,
  expireSignal,
  quarantineSignal,
  annotateSignal,
  listGovernanceActions,
  mapGovernanceActionRow
} from "./actions.js";

export {
  enqueueSignalReview,
  updateReviewQueueStatus,
  resolveReviewQueueForSignal,
  listReviewQueue,
  getReviewQueueCounts,
  mapQueueRow
} from "./reviewQueue.js";

export {
  ensureContributorHealthRow,
  updateContributorHealthCounters,
  getContributorHealth,
  listContributorHealth,
  mapContributorHealthRow
} from "./contributorHealth.js";

export {
  recordReplayEvent,
  monitorIngestionReplay,
  detectDuplicateBurst,
  listRecentReplayEvents
} from "./replayMonitor.js";

export {
  RETENTION_POLICY,
  ensureRetentionRecord,
  archiveSignalRetention,
  getRetentionMetadata
} from "./retention.js";

export {
  passportSignalAlertPublisher,
  publishSignalAlert,
  subscribePassportSignalAlerts
} from "./alerting.js";

export { buildGovernanceDashboardSnapshot } from "./dashboardContract.js";
export { buildGovernanceReport } from "./reporting.js";
