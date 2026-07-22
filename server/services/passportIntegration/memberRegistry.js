import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { normalizePassportId } from "../passportSignals/signalRegistry.js";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const REGISTRY_TABLE = "member_passport_registry";

function randomSegment() {
  const bytes = crypto.randomBytes(4);
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generatePassportId() {
  return `SKL-${randomSegment()}-${randomSegment()}`;
}

async function ensureRegistry() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(REGISTRY_TABLE);
    return true;
  } catch {
    return false;
  }
}

export async function getPassportIdForMember(memberId) {
  if (!(await ensureRegistry()) || !memberId) return null;
  const { rows } = await query(
    "select passport_id from member_passport_registry where member_id = $1 limit 1",
    [memberId]
  );
  return rows[0]?.passport_id || null;
}

export async function getMemberIdForPassport(passportId) {
  if (!(await ensureRegistry()) || !passportId) return null;
  const normalized = normalizePassportId(passportId);
  if (!normalized) return null;
  const { rows } = await query(
    "select member_id from member_passport_registry where passport_id = $1 limit 1",
    [normalized]
  );
  return rows[0]?.member_id || null;
}

export async function ensurePassportForMember(input = {}) {
  const memberId = input.memberId;
  if (!memberId) return { ok: false, error: "missing_member" };
  if (!(await ensureRegistry())) return { ok: false, skipped: true };

  const existing = await getPassportIdForMember(memberId);
  if (existing) {
    return { ok: true, passportId: existing, created: false, memberId };
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const passportId = generatePassportId();
    try {
      await query(
        `insert into member_passport_registry (member_id, passport_id, user_key, metadata)
         values ($1, $2, $3, $4::jsonb)
         on conflict (member_id) do nothing`,
        [memberId, passportId, input.userKey || null, JSON.stringify(input.metadata || {})]
      );
      const resolved = await getPassportIdForMember(memberId);
      if (resolved) {
        const { ensureContributorEmissionConsent } = await import("../passportSignals/consentGate.js");
        await ensureContributorEmissionConsent(resolved, "bamsignal");
        const { publishTrustPlatformEvent } = await import("./eventBus.js");
        await publishTrustPlatformEvent({
          eventType: "passport.updated",
          passportId: resolved,
          payload: { action: "issued", memberId },
          correlationId: input.correlationId || `passport:issued:${memberId}`
        });
        return { ok: true, passportId: resolved, created: true, memberId };
      }
    } catch {
      /* collision retry */
    }
  }

  return { ok: false, error: "passport_generation_failed" };
}
