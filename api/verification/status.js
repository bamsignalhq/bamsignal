import { requireMemberAuth } from "../../server/services/memberAuth.js";
import { normalizeUserKey } from "../../server/db.js";
import { ensureApiRequestContext } from "../../server/services/errorResponse.js";
import { getVerificationStatusForUser } from "../../server/lib/verification/index.js";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { requestId } = ensureApiRequestContext(req, res);
  const body = req.body || {};
  const sessionId = String(req.query.sessionId || body.sessionId || "").trim();

  const auth = await requireMemberAuth(req, body);
  if (!auth.ok) {
    return res.status(auth.status || 401).json({
      ok: false,
      error: "Sign in to view verification status.",
      errorCode: auth.error || "not_authorized",
      requestId
    });
  }

  const userKey = auth.userKey || normalizeUserKey({ email: auth.email, phone: auth.phone });
  const result = await getVerificationStatusForUser({
    sessionId: sessionId || null,
    userKey
  });

  return res.status(200).json({
    ok: result.ok,
    status: result.status,
    requestId
  });
}
