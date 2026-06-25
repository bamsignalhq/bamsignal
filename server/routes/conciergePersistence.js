import { requireAdmin } from "../adminAuth.js";
import { requireGovernancePermission } from "../middleware/governanceAuthorization.js";
import { getDatabaseStatus } from "../db.js";
import {
  appendConciergeTimelineEntry,
  bootstrapConciergePersistence,
  getConciergeMemberFromDb,
  getConciergePersistenceStatus,
  listConciergeConsultantsFromDb,
  listConciergeMembersFromDb,
  upsertConciergeMemberRecord
} from "../services/conciergePersistence.js";
import { logObservabilityEvent, observabilityContext } from "../services/observability.js";
import { sanitizeApiErrorForLog } from "../services/errorResponse.js";
import { requireMemberAuth } from "../services/memberAuth.js";

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

function databaseUnavailable(res) {
  return res.status(503).json({
    ok: false,
    error: "Database is not connected.",
    database: getDatabaseStatus()
  });
}

export default async function conciergePersistenceHandler(req, res) {
  const action = String(req.query?.action || req.body?.action || "status")
    .trim()
    .toLowerCase();
  const body = parseBody(req);

  try {
    if (action === "status") {
      const status = await getConciergePersistenceStatus();
      return res.status(200).json({ ok: true, ...status });
    }

    const adminActions = new Set([
      "bootstrap",
      "list-members",
      "list-consultants",
      "get-member",
      "upsert-member",
      "append-timeline"
    ]);

    if (adminActions.has(action)) {
      if (!(await requireAdmin(req, res))) return;
      if (getDatabaseStatus() !== "connected") {
        return databaseUnavailable(res);
      }
    }

    if (action === "bootstrap") {
      const result = await bootstrapConciergePersistence({
        force: Boolean(body.force),
        consultants: body.consultants,
        members: body.members,
        consultationPayments: body.consultationPayments,
        consultations: body.consultations,
        meetingNotes: body.meetingNotes,
        introductions: body.introductions,
        followups: body.followups,
        archives: body.archives,
        legacyProfiles: body.legacyProfiles,
        successStoryConsents: body.successStoryConsents,
        notifications: body.notifications,
        relationshipHealthAlerts: body.relationshipHealthAlerts
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "list-members") {
      const members = await listConciergeMembersFromDb();
      return res.status(200).json({ ok: true, members });
    }

    if (action === "list-consultants") {
      const consultants = await listConciergeConsultantsFromDb();
      return res.status(200).json({ ok: true, consultants });
    }

    if (action === "get-member") {
      const memberId = String(body.memberId || "").trim();
      if (!memberId) {
        return res.status(400).json({ ok: false, error: "Member ID is required." });
      }
      const member = await getConciergeMemberFromDb(memberId);
      return res.status(200).json({ ok: true, member });
    }

    if (action === "upsert-member") {
      if (!(await requireGovernancePermission(req, res, "EditMembers"))) return;
      const member = body.member;
      if (!member || typeof member !== "object") {
        return res.status(400).json({ ok: false, error: "Member payload is required." });
      }
      const result = await upsertConciergeMemberRecord(member);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "append-timeline") {
      const result = await appendConciergeTimelineEntry({
        table: body.table,
        recordId: body.recordId,
        entry: body.entry
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "member-get") {
      const memberAuth = await requireMemberAuth(req);
      if (!memberAuth?.memberId) {
        return res.status(401).json({ ok: false, error: "Authentication required." });
      }
      if (getDatabaseStatus() !== "connected") {
        return databaseUnavailable(res);
      }
      const memberId = String(body.memberId || memberAuth.memberId).trim();
      const member = await getConciergeMemberFromDb(memberId);
      return res.status(200).json({ ok: true, member });
    }

    return res.status(400).json({ ok: false, error: "Unsupported action." });
  } catch (error) {
    logObservabilityEvent(
      "concierge_persistence_route_error",
      {
        ...observabilityContext(req),
        action,
        error: sanitizeApiErrorForLog(error)
      },
      "error"
    );
    return res.status(500).json({ ok: false, error: "Unable to process concierge persistence request." });
  }
}
