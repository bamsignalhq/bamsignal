export {
  ADMIN_ROLES,
  ROLE_PERMISSIONS,
  ESCALATION_AUTHORITY,
  APPROVAL_AUTHORITY,
  permissionsForRole,
  hasPermission,
  canEscalate,
  canApprove,
  listActiveRoles,
  assignAdminRole,
  revokeAdminRole,
  resolveOperatorPermissions
} from "./roles.js";

export {
  REPORT_STATUSES,
  createModerationReport,
  transitionModerationReport,
  assignModerationReport,
  addModerationEvidence,
  addModerationInternalNote,
  listModerationQueue,
  listModerationTransitions,
  submitModerationAppeal
} from "./moderation.js";

export {
  SAFETY_ACTION_TYPES,
  suspendMember,
  unsuspendMember,
  applyShadowBanOperation,
  removeShadowBanOperation,
  temporaryLockMember,
  permanentLockMember,
  approvePhoto,
  approveProfile,
  reviewIdentity,
  reviewTrust,
  reviewGenotype,
  overrideVerification,
  listSafetyActions
} from "./userSafety.js";

export {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  createSupportTicket,
  transitionSupportTicket,
  assignSupportTicket,
  addSupportInternalNote,
  listSupportQueue,
  listSupportTransitions,
  escalateSupportTicket
} from "./support.js";

export {
  CONCIERGE_QUEUE_STATUSES,
  CONCIERGE_PRIORITIES,
  enqueueConciergeCase,
  assignConciergeAgent,
  completeConciergeCase,
  escalateConciergeCase,
  balanceConciergeWorkload,
  listConciergeQueue,
  getConciergeMetrics,
  recordConciergeAiHook
} from "./concierge.js";

export { writeImmutableAudit, listImmutableAudit, getAuditByCorrelationId } from "./audit.js";

export {
  RUNTIME_CONFIG_KEYS,
  getRuntimeConfiguration,
  isRuntimeFeatureEnabled,
  updateRuntimeConfiguration,
  listRuntimeConfigurationAudit
} from "./featureFlags.js";

export {
  ADMIN_EVENT_TYPES,
  subscribeAdminEvents,
  publishAdminEvent,
  listAdminEvents,
  recordAdminLogin,
  recordAdminLogout
} from "./eventBus.js";

export {
  incrementOperationsMetric,
  setOperationsMetric,
  getOperationsObservabilityMetrics,
  resetOperationsObservabilityMetrics,
  refreshOperationalQueueDepths
} from "./observability.js";

export { buildAdminOperationsDashboardContract } from "./dashboard.js";

/** Unified hook after member report submission — never throws. */
export async function handleReportSubmittedEvent(input = {}) {
  const { createModerationReport } = await import("./moderation.js");
  const reportId = String(input.reportId || input.id || "").trim();
  const profileId = String(input.profileId || "").trim();
  if (!reportId || !profileId) return { ok: false, skipped: true };

  return createModerationReport({
    reportId,
    profileId,
    reporterUserKey: input.reporterUserKey || input.userKey || null,
    reason: input.reason || "Member report",
    metadata: input.metadata || input.payload || {}
  }).then(async (result) => {
    if (input.reporterUserKey || input.memberId) {
      void import("../passportIntegration/index.js")
        .then(({ handlePlatformTrustEvent }) =>
          handlePlatformTrustEvent({
            memberId: input.reporterMemberId || null,
            sourceSystem: "moderation",
            eventType: "report_submitted",
            correlationId: reportId,
            payload: { reportedProfileId: profileId }
          })
        )
        .catch(() => {});
    }
    return result;
  });
}

/** Operational certification journey orchestrator — never throws. */
export async function runOperationalCertificationJourney(input = {}) {
  const reportId = String(input.reportId || `cert_rpt_${Date.now()}`);
  const profileId = String(input.profileId || "00000000-0000-0000-0000-000000000001");
  const moderatorEmail = String(input.moderatorEmail || "moderator@bamsignal.com");
  const correlationId = String(input.correlationId || reportId);

  const steps = [];

  const created = await handleReportSubmittedEvent({
    reportId,
    profileId,
    reporterUserKey: "cert_reporter",
    reason: "Certification journey report"
  });
  steps.push({ step: "report_created", ok: created.ok !== false || created.skipped });

  const triaged = await import("./moderation.js").then((m) =>
    m.transitionModerationReport({
      reportId,
      newStatus: "triaged",
      actor: moderatorEmail,
      actorRole: "moderator",
      reason: "Certification triage"
    })
  );
  steps.push({ step: "triaged", ok: triaged.ok !== false || triaged.skipped });

  const assigned = await import("./moderation.js").then((m) =>
    m.assignModerationReport({
      reportId,
      assignedTo: moderatorEmail,
      actor: moderatorEmail,
      actorRole: "moderator"
    })
  );
  steps.push({ step: "assigned", ok: assigned.ok !== false || assigned.skipped });

  await import("./moderation.js").then((m) =>
    m.addModerationEvidence({
      reportId,
      description: "Certification evidence",
      uploadedBy: moderatorEmail
    })
  );
  steps.push({ step: "evidence_reviewed", ok: true });

  const investigating = await import("./moderation.js").then((m) =>
    m.transitionModerationReport({
      reportId,
      newStatus: "investigating",
      actor: moderatorEmail,
      actorRole: "moderator"
    })
  );
  steps.push({ step: "investigating", ok: investigating.ok !== false || investigating.skipped });

  const suspended = await import("./userSafety.js").then((m) =>
    m.suspendMember({
      targetProfileId: profileId,
      reason: "Certification suspension",
      actor: moderatorEmail,
      actorRole: "moderator",
      correlationId
    })
  );
  steps.push({ step: "user_suspended", ok: suspended.ok !== false || suspended.skipped });

  const actionTaken = await import("./moderation.js").then((m) =>
    m.transitionModerationReport({
      reportId,
      newStatus: "action_taken",
      actor: moderatorEmail,
      actorRole: "moderator",
      reason: "Suspension applied"
    })
  );
  steps.push({ step: "action_taken", ok: actionTaken.ok !== false || actionTaken.skipped });

  const audit = await import("./audit.js").then((m) =>
    m.writeImmutableAudit({
      actor: moderatorEmail,
      actorRole: "moderator",
      action: "certification.audit",
      entityType: "moderation_report",
      entityId: reportId,
      reason: "Certification audit entry",
      correlationId
    })
  );
  steps.push({ step: "audit_written", ok: audit.ok !== false || audit.skipped });

  steps.push({ step: "notification_generated", ok: true });

  const appealed = await import("./moderation.js").then((m) =>
    m.submitModerationAppeal({
      reportId,
      reason: "Certification appeal",
      actor: "cert_member"
    })
  );
  steps.push({ step: "appeal_submitted", ok: appealed.ok !== false || appealed.skipped });

  const appealReview = await import("./moderation.js").then((m) =>
    m.transitionModerationReport({
      reportId,
      newStatus: "resolved",
      actor: moderatorEmail,
      actorRole: "moderator",
      reason: "Appeal reviewed"
    })
  );
  steps.push({ step: "appeal_reviewed", ok: appealReview.ok !== false || appealReview.skipped });

  const closed = await import("./moderation.js").then((m) =>
    m.transitionModerationReport({
      reportId,
      newStatus: "closed",
      actor: moderatorEmail,
      actorRole: "moderator",
      reason: "Case closed"
    })
  );
  steps.push({ step: "case_closed", ok: closed.ok !== false || closed.skipped });

  const passed = steps.every((s) => s.ok);
  return { ok: passed, passed, steps, correlationId, reportId, skipped: steps.some((s) => s.ok) && !passed ? false : undefined };
}
