import { registerAuthSession } from "./sessions.js";
import { registerAuthDevice } from "./devices.js";
import { incrementAuthMetric } from "./observability.js";

export { recordAuthSecurityEvent, listAuthSecurityEventsForProfile } from "./securityEvents.js";
export {
  LIFECYCLE_STATUSES,
  resolveAccountLifecycleStatus,
  transitionAccountLifecycle,
  recordLifecycleFromMember,
  listLifecycleTransitions
} from "./lifecycle.js";
export {
  registerAuthSession,
  touchAuthSession,
  listAuthSessions,
  revokeAuthSession,
  revokeAllAuthSessions,
  recordAuthLogout,
  deriveSessionId,
  SERVER_SESSION_STATUSES,
  resolveServerSessionStatus,
  markSessionCompromised
} from "./sessions.js";
export {
  registerAuthDevice,
  listAuthDevices,
  revokeAuthDevice,
  setDeviceTrusted
} from "./devices.js";
export {
  RECOVERY_KINDS,
  createRecoveryToken,
  completeRecoveryToken,
  expireStaleRecoveryTokens
} from "./recovery.js";
export { parseAuthRequestContext } from "./requestContext.js";
export {
  incrementAuthMetric,
  getAuthObservabilityMetrics,
  recordAccountDeletionRetention,
  recordAccountRestored,
  recordPermanentDeletion,
  getAccountLifecycleSnapshot
} from "./observability.js";

/** Post-login hook — registers session + device and increments metrics. */
export async function handlePostLoginAuth(req, input = {}) {
  const sessionResult = await registerAuthSession(req, input);
  const deviceResult = await registerAuthDevice(req, {
    ...input,
    sessionId: sessionResult.sessionId,
    incrementSession: true
  });

  incrementAuthMetric("login");
  if (deviceResult.isNew) incrementAuthMetric("deviceCount");

  return { session: sessionResult, device: deviceResult };
}
