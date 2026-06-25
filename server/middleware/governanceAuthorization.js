import { logAlertableEvent, observabilityContext } from "../services/observability.js";
import { GENERIC_NOT_AUTHORIZED } from "../services/identityExposure.js";
import { requireAdmin } from "../adminAuth.js";
import {
  governanceSlugFromLegacyPermission,
  operatorHasLegacyPermission,
  operatorHasGovernancePermission,
  buildGovernanceAuthorizationContext
} from "../services/institutionalGovernance.js";
import { getInstitutionalGovernanceSeedState } from "../services/institutionalGovernanceSeed.js";

async function resolveOperatorContext(req) {
  const seedState = getInstitutionalGovernanceSeedState();
  const email =
    String(req.headers["x-operator-email"] || req.body?.operatorEmail || req.query?.operatorEmail || "")
      .trim()
      .toLowerCase() || "founder@bamsignal.com";
  const legacyRole = String(req.headers["x-operator-role"] || req.body?.operatorRole || "Admin");
  return buildGovernanceAuthorizationContext(seedState, email, legacyRole);
}

export async function requireGovernancePermission(req, res, legacyPermission) {
  if (!(await requireAdmin(req, res))) return false;

  const permissionSlug = governanceSlugFromLegacyPermission(legacyPermission);
  if (!permissionSlug) {
    res.status(403).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
    return false;
  }

  const context = await resolveOperatorContext(req);
  if (!operatorHasLegacyPermission(context, legacyPermission)) {
    logAlertableEvent(
      "governance_authorization_denied",
      observabilityContext(req, {
        permission: legacyPermission,
        permissionSlug
      })
    );
    res.status(403).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
    return false;
  }

  return true;
}

export async function requireGovernanceSlug(req, res, permissionSlug) {
  if (!(await requireAdmin(req, res))) return false;
  const context = await resolveOperatorContext(req);
  if (!operatorHasGovernancePermission(context, permissionSlug)) {
    res.status(403).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
    return false;
  }
  return true;
}

export async function requireGovernanceConsole(req, res) {
  return requireGovernanceSlug(req, res, "manage-governance");
}
