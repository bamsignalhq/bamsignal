import { requireAdmin } from "../../server/adminAuth.js";
import { requireAdminConsent, getAdminEmailFromRequest } from "../../server/adminConsent.js";
import { getDatabaseStatus } from "../../server/db.js";
import {
  applyShadowBan,
  canModerateMembers,
  liftShadowBan,
  listShadowBannedUsers
} from "../../server/services/moderation.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

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

async function requireModerationAdmin(req, res) {
  if (!(await requireAdmin(req, res))) return null;
  const operatorEmail = await getAdminEmailFromRequest(req);
  if (!operatorEmail || !(await canModerateMembers(operatorEmail))) {
    res.status(403).json({ ok: false, error: "Moderation permission required." });
    return null;
  }
  return operatorEmail;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected.", database });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "").trim();

  try {
    if (action === "list-shadow-banned") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;

      const users = await listShadowBannedUsers();
      return res.status(200).json({ ok: true, users, count: users.length });
    }

    if (action === "list-reports") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { listReportQueue } = await import("../../server/services/moderation.js");
      const reports = await listReportQueue({ limit: Number(body.limit) || 200 });
      return res.status(200).json({ ok: true, reports, count: reports.length });
    }

    if (action === "lift-shadow-ban") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      if (!(await requireAdminConsent(req, res))) return;

      const profileId = String(body.profileId || "").trim();
      const reason = String(body.reason || "").trim();
      const result = await liftShadowBan({ profileId, operatorEmail, reason });
      if (!result.ok) {
        return res.status(400).json(result);
      }
      return res.status(200).json({
        ok: true,
        message: "User visibility restored.",
        profile: result.profile
      });
    }

    if (action === "shadow-ban") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      if (!(await requireAdminConsent(req, res))) return;

      const profileId = String(body.profileId || "").trim();
      const reason = String(body.reason || "").trim() || "Shadow ban applied by operator.";
      const result = await applyShadowBan({
        profileId,
        operatorEmail,
        reason,
        moderationNotes: body.moderationNotes || null
      });
      if (!result.ok) {
        return res.status(400).json(result);
      }
      return res.status(200).json({ ok: true, profile: result.profile });
    }

    if (action === "list-flags") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { listModerationFlags } = await import("../../server/memberTrust.js");
      const flags = await listModerationFlags({ limit: Number(body.limit) || 50 });
      return res.status(200).json({ ok: true, flags, count: flags.length });
    }

    if (action === "list-contact-leaks") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { listContactLeakAttempts } = await import("../../server/services/contactLeak.js");
      const attempts = await listContactLeakAttempts({ limit: Number(body.limit) || 50 });
      return res.status(200).json({ ok: true, attempts, count: attempts.length });
    }

    if (action === "list-photo-reviews") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { listPhotoReviews } = await import("../../server/services/photoReview.js");
      const status = String(body.status || "pending_review").trim();
      const reviews = await listPhotoReviews({ status, limit: Number(body.limit) || 50 });
      return res.status(200).json({ ok: true, reviews, count: reviews.length });
    }

    if (action === "approve-photo-review") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { approvePhotoReview } = await import("../../server/services/photoReview.js");
      const reviewId = String(body.reviewId || "").trim();
      const result = await approvePhotoReview({ reviewId, operatorEmail });
      if (!result.ok) return res.status(400).json(result);
      return res.status(200).json(result);
    }

    if (action === "reject-photo-review") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { rejectPhotoReview } = await import("../../server/services/photoReview.js");
      const reviewId = String(body.reviewId || "").trim();
      const reason = String(body.reason || "").trim();
      const result = await rejectPhotoReview({ reviewId, operatorEmail, reason });
      if (!result.ok) return res.status(400).json(result);
      return res.status(200).json(result);
    }

    if (action === "hide-photo-review") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { hidePhotoReview } = await import("../../server/services/photoReview.js");
      const reviewId = String(body.reviewId || "").trim();
      const reason = String(body.reason || "").trim();
      const result = await hidePhotoReview({ reviewId, operatorEmail, reason });
      if (!result.ok) return res.status(400).json(result);
      return res.status(200).json(result);
    }

    if (action === "restore-photo-review") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { restorePhotoReview } = await import("../../server/services/photoReview.js");
      const reviewId = String(body.reviewId || "").trim();
      const result = await restorePhotoReview({ reviewId, operatorEmail });
      if (!result.ok) return res.status(400).json(result);
      return res.status(200).json(result);
    }

    if (action === "delete-photo-review") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { deletePhotoReview } = await import("../../server/services/photoReview.js");
      const reviewId = String(body.reviewId || "").trim();
      const reason = String(body.reason || "").trim();
      const result = await deletePhotoReview({ reviewId, operatorEmail, reason });
      if (!result.ok) return res.status(400).json(result);
      return res.status(200).json(result);
    }

    return res.status(400).json({
      ok: false,
      error:
        "Unknown action. Use list-shadow-banned, lift-shadow-ban, shadow-ban, list-flags, list-contact-leaks, list-photo-reviews, approve-photo-review, reject-photo-review, hide-photo-review, restore-photo-review, or delete-photo-review."
    });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "admin_moderation_failed",
      error,
      status: 500,
      message: "Moderation request failed.",
      context: { action }
    });
  }
}
