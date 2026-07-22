import { requireAdmin } from "../../server/adminAuth.js";
import { getAdminEmailFromRequest } from "../../server/adminConsent.js";
import { getDatabaseStatus } from "../../server/db.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";
import {
  buildAdminOperationsDashboardContract,
  resolveOperatorPermissions,
  assignAdminRole,
  revokeAdminRole,
  listModerationQueue,
  transitionModerationReport,
  assignModerationReport,
  addModerationEvidence,
  addModerationInternalNote,
  listModerationTransitions,
  submitModerationAppeal,
  suspendMember,
  unsuspendMember,
  applyShadowBanOperation,
  removeShadowBanOperation,
  temporaryLockMember,
  permanentLockMember,
  listSafetyActions,
  createSupportTicket,
  assignSupportTicket,
  transitionSupportTicket,
  listSupportQueue,
  escalateSupportTicket,
  enqueueConciergeCase,
  assignConciergeAgent,
  completeConciergeCase,
  listConciergeQueue,
  getRuntimeConfiguration,
  updateRuntimeConfiguration,
  listImmutableAudit,
  listAdminEvents,
  getOperationsObservabilityMetrics,
  runOperationalCertificationJourney
} from "../../server/services/operations/index.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!(await requireAdmin(req, res))) return;

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected.", database });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "dashboard").toLowerCase();
  const operatorEmail = (await getAdminEmailFromRequest(req)) || body.operatorEmail || "admin";

  try {
    if (action === "dashboard") {
      const contract = await buildAdminOperationsDashboardContract();
      return res.status(200).json({ ok: true, ...contract });
    }

    if (action === "permissions") {
      const resolved = await resolveOperatorPermissions(operatorEmail);
      return res.status(200).json({ ok: true, operatorEmail, ...resolved });
    }

    if (action === "assign-role") {
      const result = await assignAdminRole({
        operatorEmail: body.operatorEmail,
        roleSlug: body.roleSlug,
        actor: operatorEmail,
        reason: body.reason
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "revoke-role") {
      const result = await revokeAdminRole({
        operatorEmail: body.operatorEmail,
        roleSlug: body.roleSlug,
        actor: operatorEmail,
        reason: body.reason
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "moderation-queue") {
      const reports = await listModerationQueue({ status: body.status, limit: body.limit });
      return res.status(200).json({ ok: true, reports });
    }

    if (action === "moderation-transition") {
      const result = await transitionModerationReport({
        ...body,
        actor: operatorEmail,
        actorRole: body.actorRole || "moderator"
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "moderation-assign") {
      const result = await assignModerationReport({
        ...body,
        assignedTo: body.assignedTo || operatorEmail,
        actor: operatorEmail
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "moderation-evidence") {
      const result = await addModerationEvidence({ ...body, uploadedBy: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "moderation-note") {
      const result = await addModerationInternalNote({ ...body, authorEmail: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "moderation-history") {
      const transitions = await listModerationTransitions(body.reportId, { limit: body.limit });
      return res.status(200).json({ ok: true, transitions });
    }

    if (action === "moderation-appeal") {
      const result = await submitModerationAppeal(body);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "suspend-member") {
      const result = await suspendMember({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "unsuspend-member") {
      const result = await unsuspendMember({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "shadow-ban") {
      const result = await applyShadowBanOperation({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "lift-shadow-ban") {
      const result = await removeShadowBanOperation({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "temporary-lock") {
      const result = await temporaryLockMember({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "permanent-lock") {
      const result = await permanentLockMember({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "safety-history") {
      const actions = await listSafetyActions({
        targetProfileId: body.targetProfileId,
        limit: body.limit
      });
      return res.status(200).json({ ok: true, actions });
    }

    if (action === "create-ticket") {
      const result = await createSupportTicket(body);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "assign-ticket") {
      const result = await assignSupportTicket({ ...body, ownerEmail: body.ownerEmail || operatorEmail, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "transition-ticket") {
      const result = await transitionSupportTicket({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "support-queue") {
      const tickets = await listSupportQueue({ status: body.status, limit: body.limit });
      return res.status(200).json({ ok: true, tickets });
    }

    if (action === "escalate-ticket") {
      const result = await escalateSupportTicket({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "concierge-queue") {
      const queue = await listConciergeQueue({ status: body.status, limit: body.limit });
      return res.status(200).json({ ok: true, queue });
    }

    if (action === "concierge-enqueue") {
      const result = await enqueueConciergeCase(body);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "concierge-assign") {
      const result = await assignConciergeAgent({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "concierge-complete") {
      const result = await completeConciergeCase({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "runtime-config") {
      const config = await getRuntimeConfiguration(body.configKey || null);
      return res.status(200).json({ ok: true, config });
    }

    if (action === "update-runtime-config") {
      const result = await updateRuntimeConfiguration({ ...body, actor: operatorEmail });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "audit-log") {
      const records = await listImmutableAudit({
        entityType: body.entityType,
        entityId: body.entityId,
        actor: body.actor,
        action: body.action,
        limit: body.limit
      });
      return res.status(200).json({ ok: true, records });
    }

    if (action === "admin-events") {
      const events = await listAdminEvents({ eventType: body.eventType, limit: body.limit });
      return res.status(200).json({ ok: true, events });
    }

    if (action === "metrics") {
      return res.status(200).json({ ok: true, metrics: getOperationsObservabilityMetrics() });
    }

    if (action === "certify-journey") {
      const result = await runOperationalCertificationJourney(body);
      return res.status(result.passed ? 200 : 500).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "operations_admin_error",
      error,
      status: 500,
      message: "Operations admin request failed.",
      context: { action }
    });
  }
}
