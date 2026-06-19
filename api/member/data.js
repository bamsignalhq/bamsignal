import {
  fetchMemberBundle,
  findAppUserIdentity,
  getDatabaseStatus,
  persistReport,
  upsertAppUserIdentity
} from "../../server/db.js";
import { findEmailByUsername, upsertMemberProfile } from "../../server/cityHome.js";
import {
  acceptIncomingSignal,
  completeOnboardingReferral,
  declineIncomingSignal,
  ensureUserReferralCode,
  fetchIncomingSignals,
  fetchPremiumStatus,
  fetchProfileVisitors,
  fetchReferralStats,
  getMemberProfileById,
  ignoreIncomingSignal,
  listDiscoverProfiles,
  searchMemberProfiles,
  likeMemberProfile,
  followMemberProfile,
  registerWithReferral,
  sendSignalToProfile
} from "../../server/memberSocial.js";

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

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function normalizeIdentity(body = {}) {
  return {
    email: String(body.email || "").trim().toLowerCase(),
    phone: normalizePhone(body.phone),
    name: String(body.name || "").trim()
  };
}

function requireDatabase(res) {
  const database = getDatabaseStatus();
  if (database !== "connected") {
    res.status(503).json({
      ok: false,
      error: "Database is not connected.",
      database
    });
    return false;
  }
  return true;
}

async function enforceRate(req, res, identity, endpoint) {
  const { checkRateLimit } = await import("../../server/services/rateLimit.js");
  const result = await checkRateLimit({
    req,
    endpoint,
    email: identity.email,
    phone: identity.phone
  });
  if (!result.ok) {
    res.status(429).json({ ok: false, error: result.error, retryAfterMs: result.retryAfterMs });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req);

  try {
    if (req.query.action === "resolve-username") {
      if (!requireDatabase(res)) return;
      const username = String(body.username || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, "");
      if (!username) {
        return res.status(400).json({ ok: false, error: "Username is required." });
      }
      const email = await findEmailByUsername(username);
      if (!email) {
        return res.status(404).json({ ok: false, error: "Account not found." });
      }
      return res.status(200).json({ ok: true, email });
    }

    const identity = normalizeIdentity(body);

    if (!identity.email && !identity.phone) {
      return res.status(400).json({ ok: false, error: "Email or phone is required." });
    }

    if (req.query.action === "pull") {
      if (!requireDatabase(res)) return;
      const bundle = await fetchMemberBundle(identity);
      return res.status(200).json({ ok: true, database: "connected", bundle });
    }

    if (req.query.action === "register") {
      if (!requireDatabase(res)) return;
      const user = body.referralCode
        ? await registerWithReferral({ ...identity, referralCode: body.referralCode })
        : await upsertAppUserIdentity(identity);
      if (user) await ensureUserReferralCode(identity);
      const freshUser = user ? await findAppUserIdentity(identity) : null;
      return res.status(200).json({ ok: true, user: freshUser || user });
    }

    if (req.query.action === "status") {
      if (!requireDatabase(res)) return;
      const user = await findAppUserIdentity(identity);
      const premium = await fetchPremiumStatus(identity);
      return res.status(200).json({ ok: true, user, premium });
    }

    if (req.query.action === "discover") {
      if (!requireDatabase(res)) return;
      if (!(await enforceRate(req, res, identity, "discover"))) return;
      const city = String(body.city || "").trim();
      if (!city) return res.status(400).json({ ok: false, error: "City is required." });
      const profiles = await listDiscoverProfiles({
        email: identity.email,
        phone: identity.phone,
        city,
        excludeProfileIds: Array.isArray(body.excludeProfileIds) ? body.excludeProfileIds : [],
        limit: Number(body.limit) || 48
      });
      return res.status(200).json({ ok: true, profiles });
    }

    if (req.query.action === "search") {
      if (!requireDatabase(res)) return;
      if (!(await enforceRate(req, res, identity, "search"))) return;
      const city = String(body.city || "").trim();
      const state = String(body.state || "").trim();
      const cities = Array.isArray(body.cities)
        ? body.cities.map((c) => String(c || "").trim()).filter(Boolean)
        : [];
      if (!city && !state && cities.length === 0) {
        return res.status(400).json({ ok: false, error: "City or state is required." });
      }
      const profiles = await searchMemberProfiles({
        email: identity.email,
        phone: identity.phone,
        state,
        city,
        cities,
        ageMin: Number(body.ageMin) || 18,
        ageMax: Number(body.ageMax) || 99,
        excludeProfileIds: Array.isArray(body.excludeProfileIds) ? body.excludeProfileIds : [],
        limit: Number(body.limit) || 72,
        tribes: Array.isArray(body.tribes) ? body.tribes : [],
        religions: Array.isArray(body.religions) ? body.religions : [],
        occupations: Array.isArray(body.occupations) ? body.occupations : [],
        statesOfOrigin: Array.isArray(body.statesOfOrigin) ? body.statesOfOrigin : [],
        relationshipIntentions: Array.isArray(body.relationshipIntentions)
          ? body.relationshipIntentions
          : [],
        genotypes: Array.isArray(body.genotypes) ? body.genotypes : [],
        kidsPreferences: Array.isArray(body.kidsPreferences) ? body.kidsPreferences : []
      });
      return res.status(200).json({ ok: true, profiles });
    }

    if (req.query.action === "profile-by-id") {
      if (!requireDatabase(res)) return;
      if (!(await enforceRate(req, res, identity, "profile-view"))) return;
      const profile = await getMemberProfileById(String(body.profileId || "").trim());
      return res.status(200).json({ ok: Boolean(profile), profile });
    }

    if (req.query.action === "incoming") {
      if (!requireDatabase(res)) return;
      const incomingSignals = await fetchIncomingSignals(identity);
      return res.status(200).json({ ok: true, incomingSignals });
    }

    if (req.query.action === "visitors") {
      if (!requireDatabase(res)) return;
      const viewers = await fetchProfileVisitors(identity);
      return res.status(200).json({ ok: true, viewers });
    }

    if (req.query.action === "referral") {
      if (!requireDatabase(res)) return;
      const referral = await fetchReferralStats(identity);
      return res.status(200).json({ ok: true, referral });
    }

    if (req.query.action === "signal") {
      if (!requireDatabase(res)) return;
      const row = await sendSignalToProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim(),
        signalType: String(body.signalType || "signal"),
        payload: body.payload || {}
      });
      if (row?.cooldown) {
        return res.status(429).json({ ok: false, error: row.error, cooldown: true });
      }
      if (row?.ok === false) {
        return res.status(400).json(row);
      }
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), signal: row });
    }

    if (req.query.action === "accept-signal") {
      if (!requireDatabase(res)) return;
      const result = await acceptIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(result ? 200 : 404).json({ ok: Boolean(result), ...result });
    }

    if (req.query.action === "decline-signal") {
      if (!requireDatabase(res)) return;
      const ok = await declineIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(ok ? 200 : 404).json({ ok });
    }

    if (req.query.action === "ignore-signal") {
      if (!requireDatabase(res)) return;
      const ok = await ignoreIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(ok ? 200 : 404).json({ ok });
    }

    if (req.query.action === "like-profile") {
      if (!requireDatabase(res)) return;
      const row = await likeMemberProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim(),
        photoIndex: Number(body.photoIndex) || 0
      });
      return res.status(row ? 200 : 400).json({ ok: Boolean(row), like: row });
    }

    if (req.query.action === "follow-profile") {
      if (!requireDatabase(res)) return;
      const row = await followMemberProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim()
      });
      return res.status(row ? 200 : 400).json({ ok: Boolean(row), follow: row });
    }

    if (req.query.action === "complete-onboarding") {
      if (!requireDatabase(res)) return;
      const { markMemberOnboardingComplete, completeOnboardingReferral } = await import(
        "../../server/memberSocial.js"
      );
      const marked = await markMemberOnboardingComplete(identity);
      if (!marked.ok) {
        return res.status(400).json({ ok: false, error: "Could not complete onboarding." });
      }
      const result = await completeOnboardingReferral(identity);
      const referral = await fetchReferralStats(identity);
      return res.status(200).json({ ok: true, result, referral });
    }

    if (req.query.action === "compliance-ack") {
      const { recordComplianceAcknowledgements } = await import(
        "../../server/services/compliance.js"
      );
      const forwarded = String(req.headers["x-forwarded-for"] || "")
        .split(",")[0]
        .trim();
      const ip = forwarded || req.socket?.remoteAddress || null;
      const userAgent = String(req.headers["user-agent"] || "").trim() || null;
      const result = await recordComplianceAcknowledgements({
        email: identity.email,
        phone: identity.phone,
        acks: Array.isArray(body.acks) ? body.acks : [],
        ip,
        userAgent,
        metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {}
      });
      if (!result.ok) {
        return res.status(result.error === "Member profile not found." ? 404 : 400).json(result);
      }
      return res.status(200).json(result);
    }

    if (req.query.action === "repair-flow") {
      if (!requireDatabase(res)) return;
      const { repairMemberFlow } = await import("../../server/services/flowRepair.js");
      const result = await repairMemberFlow({
        email: identity.email,
        phone: identity.phone,
        currentRoute: String(body.currentRoute || "/").trim(),
        flowName: String(body.flowName || "").trim(),
        clientState: body.clientState && typeof body.clientState === "object" ? body.clientState : {}
      });
      if (!result.ok) {
        return res.status(result.error === "Member profile not found." ? 404 : 400).json(result);
      }
      return res.status(200).json(result);
    }

    if (req.query.action === "match") {
      if (!requireDatabase(res)) return;
      const { persistMatch } = await import("../../server/db.js");
      const row = await persistMatch({
        email: identity.email,
        phone: identity.phone,
        match: body.match
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), match: row });
    }

    if (req.query.action === "message") {
      if (!requireDatabase(res)) return;
      const { persistMessage } = await import("../../server/db.js");
      try {
        const row = await persistMessage({
          email: identity.email,
          phone: identity.phone,
          threadId: String(body.threadId || "").trim(),
          message: body.message,
          threadMeta: body.threadMeta || {}
        });
        return res.status(row ? 200 : 503).json({ ok: Boolean(row), message: row });
      } catch (error) {
        if (error?.code === "CONTACT_LEAK_BLOCKED") {
          return res.status(400).json({ ok: false, error: error.message });
        }
        throw error;
      }
    }

    if (req.query.action === "report") {
      if (!requireDatabase(res)) return;
      try {
        const row = await persistReport({
          email: identity.email,
          phone: identity.phone,
          report: body.report
        });
        return res.status(row ? 200 : 503).json({ ok: Boolean(row), report: row });
      } catch (error) {
        if (error?.code === "CONTACT_LEAK_BLOCKED") {
          return res.status(400).json({ ok: false, error: error.message });
        }
        throw error;
      }
    }

    if (req.query.action === "profile") {
      if (!requireDatabase(res)) return;
      const city = String(body.city || body.profile?.city || "").trim();
      if (!city) {
        return res.status(400).json({ ok: false, error: "City is required for profile sync." });
      }

      const incomingProfile = { ...(body.profile || {}) };
      if (
        typeof incomingProfile.coverPhotoUrl === "string" &&
        incomingProfile.coverPhotoUrl.startsWith("/showcase/")
      ) {
        incomingProfile.coverPhotoUrl = undefined;
        incomingProfile.coverPhoto = undefined;
        incomingProfile.coverPhotoExplicit = false;
      }
      if (typeof incomingProfile.coverPhoto === "string" && incomingProfile.coverPhoto.startsWith("/showcase/")) {
        incomingProfile.coverPhoto = undefined;
        incomingProfile.coverPhotoExplicit = false;
      }

      const { findMemberProfileByUserKey } = await import("../../server/cityHome.js");
      const { mergeMemberProfilePayload } = await import("../../server/utils/profileMerge.js");
      const existingMember = await findMemberProfileByUserKey(identity.email, identity.phone);
      const existingProfile =
        existingMember?.profile && typeof existingMember.profile === "object"
          ? existingMember.profile
          : {};
      const profile = mergeMemberProfilePayload(existingProfile, incomingProfile);
      const { assertProfileSafeForContactLeak } = await import("../../server/services/contactLeak.js");
      const leakCheck = await assertProfileSafeForContactLeak({
        email: identity.email,
        phone: identity.phone,
        name: identity.name || body.name,
        username: String(body.username || "").trim() || null,
        profile
      });
      if (!leakCheck.ok) {
        return res.status(400).json({ ok: false, error: leakCheck.error });
      }

      const hideFromDiscovery = Boolean(profile.safetySettings?.hideFromDiscovery);
      const discoverable =
        body.discoverable !== false && !hideFromDiscovery && body.accountStatus !== "deleted_pending";

      const row = await upsertMemberProfile({
        email: identity.email,
        phone: identity.phone,
        name: identity.name || body.name,
        username: String(body.username || "").trim() || null,
        city,
        state: String(body.state || body.profile?.state || "").trim() || null,
        profile,
        discoverable,
        onboardingComplete: Boolean(body.onboardingComplete ?? body.profile?.onboardingComplete),
        cityHomeHidden: Boolean(body.cityHomeHidden)
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), profile: row });
    }

    if (req.query.action === "account-state") {
      if (!requireDatabase(res)) return;
      const { fetchMemberAccountState } = await import("../../server/memberTrust.js");
      const state = await fetchMemberAccountState(identity);
      return res.status(200).json({ ok: true, account: state });
    }

    if (req.query.action === "check-username") {
      if (!requireDatabase(res)) return;
      const { checkUsernameAvailable } = await import("../../server/memberTrust.js");
      const result = await checkUsernameAvailable(
        String(body.username || ""),
        body.excludeProfileId || null
      );
      return res.status(result.available ? 200 : 409).json(result);
    }

    if (req.query.action === "change-username") {
      if (!requireDatabase(res)) return;
      const { changeMemberUsername } = await import("../../server/memberTrust.js");
      const result = await changeMemberUsername({
        email: identity.email,
        phone: identity.phone,
        username: String(body.username || "")
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "pause-profile") {
      if (!requireDatabase(res)) return;
      const { pauseMemberProfile } = await import("../../server/memberTrust.js");
      const result = await pauseMemberProfile({
        email: identity.email,
        phone: identity.phone,
        reason: body.reason
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "unpause-profile") {
      if (!requireDatabase(res)) return;
      const { unpauseMemberProfile } = await import("../../server/memberTrust.js");
      const result = await unpauseMemberProfile({ email: identity.email, phone: identity.phone });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "soft-delete-account") {
      if (!requireDatabase(res)) return;
      const { softDeleteMemberAccount } = await import("../../server/memberTrust.js");
      const result = await softDeleteMemberAccount({ email: identity.email, phone: identity.phone });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "restore-account") {
      if (!requireDatabase(res)) return;
      const { restoreMemberAccount } = await import("../../server/memberTrust.js");
      const result = await restoreMemberAccount({ email: identity.email, phone: identity.phone });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "user-block") {
      if (!requireDatabase(res)) return;
      const targetProfileId = String(body.targetProfileId || "").trim();
      if (!targetProfileId) {
        return res.status(400).json({ ok: false, error: "targetProfileId is required." });
      }
      const { findMemberProfileByUserKey } = await import("../../server/cityHome.js");
      const reporter = await findMemberProfileByUserKey(identity.email, identity.phone);
      const { writeAuditLog } = await import("../../server/services/auditLog.js");
      await writeAuditLog({
        userId: reporter?.id || null,
        targetUserId: targetProfileId,
        action: "user_blocked",
        details: {}
      });
      return res.status(200).json({ ok: true });
    }

    if (req.query.action === "connection-note") {
      if (!requireDatabase(res)) return;
      const { fetchConnectionNote, upsertConnectionNote } = await import("../../server/memberTrust.js");
      const targetProfileId = String(body.targetProfileId || "").trim();
      if (req.method === "GET" || body.readOnly) {
        const note = await fetchConnectionNote({
          email: identity.email,
          phone: identity.phone,
          targetProfileId
        });
        return res.status(200).json({ ok: true, note });
      }
      const result = await upsertConnectionNote({
        email: identity.email,
        phone: identity.phone,
        targetProfileId,
        note: body.note
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "send-introduction") {
      if (!requireDatabase(res)) return;
      const { sendMemberIntroduction } = await import("../../server/memberTrust.js");
      const result = await sendMemberIntroduction({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || ""),
        recipientProfileId: String(body.recipientProfileId || ""),
        note: body.note
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "success-story") {
      if (!requireDatabase(res)) return;
      const { submitSuccessStory } = await import("../../server/memberTrust.js");
      const result = await submitSuccessStory({
        email: identity.email,
        phone: identity.phone,
        story: body.story,
        anonymous: body.anonymous
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "moderation-flag") {
      if (!requireDatabase(res)) return;
      const { createModerationFlag } = await import("../../server/memberTrust.js");
      const { normalizeUserKey } = await import("../../server/db.js");
      const userKey = normalizeUserKey(identity);
      const flag = await createModerationFlag({
        userKey,
        profileId: body.profileId || null,
        reason: String(body.reason || ""),
        severity: body.severity || "medium",
        metadata: body.metadata || {}
      });
      return res.status(flag ? 200 : 400).json({ ok: Boolean(flag), flag });
    }

    if (req.query.action === "contact-exchange-state") {
      if (!requireDatabase(res)) return;
      const { getContactExchangeState } = await import("../../server/services/contactExchange.js");
      const result = await getContactExchangeState({
        email: identity.email,
        phone: identity.phone,
        matchId: String(body.matchId || "").trim()
      });
      return res.status(200).json(result);
    }

    if (req.query.action === "contact-exchange-request") {
      if (!requireDatabase(res)) return;
      const { requestContactExchange } = await import("../../server/services/contactExchange.js");
      const result = await requestContactExchange({
        email: identity.email,
        phone: identity.phone,
        matchId: String(body.matchId || "").trim(),
        recipientProfileId: String(body.recipientProfileId || "").trim(),
        requesterProfileId: body.requesterProfileId || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "contact-exchange-respond") {
      if (!requireDatabase(res)) return;
      const { respondContactExchange } = await import("../../server/services/contactExchange.js");
      const result = await respondContactExchange({
        email: identity.email,
        phone: identity.phone,
        matchId: String(body.matchId || "").trim(),
        accept: Boolean(body.accept),
        profileId: body.profileId || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "contact-exchange-complete") {
      if (!requireDatabase(res)) return;
      const { completeContactExchange } = await import("../../server/services/contactExchange.js");
      const result = await completeContactExchange({
        email: identity.email,
        phone: identity.phone,
        matchId: String(body.matchId || "").trim(),
        sharedContacts: body.sharedContacts || {},
        profileId: body.profileId || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "contact-exchange-cancel") {
      if (!requireDatabase(res)) return;
      const { cancelContactExchange } = await import("../../server/services/contactExchange.js");
      const result = await cancelContactExchange({
        email: identity.email,
        phone: identity.phone,
        matchId: String(body.matchId || "").trim(),
        profileId: body.profileId || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "contact-exchange-disable") {
      if (!requireDatabase(res)) return;
      const { disableContactSharing } = await import("../../server/services/contactExchange.js");
      const result = await disableContactSharing({
        email: identity.email,
        phone: identity.phone,
        matchId: String(body.matchId || "").trim(),
        profileId: body.profileId || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.query.action === "subscription-catalog") {
      const { getSubscriptionCatalog } = await import("../../server/services/subscriptionCatalog.js");
      const catalog = await getSubscriptionCatalog();
      return res.status(200).json({ ok: true, catalog });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Member data request failed." });
  }
}
