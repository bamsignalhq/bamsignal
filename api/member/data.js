import {
  findAppUserIdentity,
  getDatabaseStatus,
  upsertAppUserIdentity,
  query
} from "../../server/db.js";
import {
  fetchMemberBundle,
  persistMessage,
  persistReport
} from "../../server/services/memberPersistence.js";
import {
  isPublicMemberDataAction,
  PUBLIC_MEMBER_DATA_ACTIONS,
  requireMemberAuth
} from "../../server/services/memberAuth.js";
import {
  GENERIC_NOT_AUTHORIZED,
  logIdentityExposureBlocked,
  sanitizePublicMemberProfile,
  sendGenericServiceUnavailable
} from "../../server/services/identityExposure.js";
import {
  logAlertableEvent,
  observabilityContext
} from "../../server/services/observability.js";
import { sendLoggedApiError } from "../../server/services/apiErrorResponse.js";
import { upsertMemberProfile, findMemberProfileByUserKey } from "../../server/cityHome.js";
import {
  acceptIncomingSignal,
  completeOnboardingReferral,
  declineIncomingSignal,
  ensureUserReferralCode,
  fetchIncomingSignals,
  fetchPremiumStatus,
  fetchMemberEntitlements,
  fetchProfileVisitors,
  fetchReferralStats,
  getVisibleMemberProfileById,
  ignoreIncomingSignal,
  listDiscoverProfiles,
  searchMemberProfiles,
  likeMemberProfile,
  followMemberProfile,
  registerWithReferral,
  sendSignalToProfile,
  listFastConnectionPool,
  fetchFastConnectionSignalStatus,
  sendFastConnectionSignal,
  listFastConnectionPurchaseHistory,
  saveMemberProfile,
  unsaveMemberProfile,
  fetchSavedProfiles
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

function requireDatabase(res) {
  const database = getDatabaseStatus();
  if (database !== "connected") {
    return sendGenericServiceUnavailable(res);
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
  const action = String(req.query.action || "").trim();

  try {
    if (action === "profile-by-id") {
      if (!requireDatabase(res)) return;
      if (!(await enforceRate(req, res, {}, "profile-view"))) return;
      const profileId = String(body.profileId || "").trim();
      const viewerEmail = String(body.email || "").trim() || null;
      const viewerPhone = String(body.phone || "").trim() || null;
      const profile = await getVisibleMemberProfileById({
        profileId,
        viewerEmail,
        viewerPhone
      });
      return res.status(200).json({
        ok: true,
        profile: sanitizePublicMemberProfile(profile)
      });
    }

    if (action === "subscription-catalog") {
      const { getSubscriptionCatalog } = await import("../../server/services/subscriptionCatalog.js");
      const catalog = await getSubscriptionCatalog();
      return res.status(200).json({ ok: true, catalog });
    }

    if (action === "check-username") {
      const authResult = await requireMemberAuth(req, body);
      if (!authResult.ok) {
        logIdentityExposureBlocked({ endpoint: "check-username" });
        return res.status(authResult.status || 401).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
      }
      if (!requireDatabase(res)) return;
      const { checkUsernameAvailable } = await import("../../server/memberTrust.js");
      const result = await checkUsernameAvailable(
        String(body.username || ""),
        body.excludeProfileId || null
      );
      if (!result.ok || !result.available) {
        return res.status(200).json({ ok: false, available: false, error: GENERIC_NOT_AUTHORIZED });
      }
      return res.status(200).json({ ok: true, available: true, username: result.username });
    }

    if (!action) {
      return res.status(400).json({ ok: false, error: "Unknown action." });
    }

    if (isPublicMemberDataAction(action)) {
      return res.status(400).json({ ok: false, error: "Unknown action." });
    }

    const authResult = await requireMemberAuth(req, body);
    if (!authResult.ok) {
      return res.status(authResult.status).json({ ok: false, error: authResult.error || "not_authorized" });
    }
    const identity = authResult.identity;

    if (action === "pull") {
      if (!requireDatabase(res)) return;
      const bundle = await fetchMemberBundle(identity);
      return res.status(200).json({ ok: true, database: "connected", bundle });
    }

    if (action === "register") {
      if (!requireDatabase(res)) return;
      const user = body.referralCode
        ? await registerWithReferral({ ...identity, referralCode: body.referralCode })
        : await upsertAppUserIdentity(identity);
      if (user) await ensureUserReferralCode(identity);
      const freshUser = user ? await findAppUserIdentity(identity) : null;
      return res.status(200).json({ ok: true, user: freshUser || user });
    }

    if (action === "status") {
      if (!requireDatabase(res)) return;
      const user = await findAppUserIdentity(identity);
      const entitlements = await fetchMemberEntitlements(identity);
      const { listActiveMemberBoosts } = await import("../server/services/memberBoosts.js");
      const activeBoosts = await listActiveMemberBoosts({
        email: identity.email,
        phone: identity.phone
      });
      return res.status(200).json({
        ok: true,
        user,
        premium: entitlements.signalPass,
        entitlements,
        activeBoosts
      });
    }

    if (action === "discover") {
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

    if (action === "fast-connection-pool") {
      if (!requireDatabase(res)) return;
      if (!(await enforceRate(req, res, identity, "discover"))) return;
      const result = await listFastConnectionPool({
        email: identity.email,
        phone: identity.phone,
        excludeProfileIds: Array.isArray(body.excludeProfileIds) ? body.excludeProfileIds : [],
        limit: Number(body.limit) || 48
      });
      return res.status(result.ok || result.passActive === false ? 200 : 503).json(result);
    }

    if (action === "fast-connection-history") {
      if (!requireDatabase(res)) return;
      const history = await listFastConnectionPurchaseHistory({
        email: identity.email,
        phone: identity.phone,
        limit: Number(body.limit) || 12
      });
      return res.status(history.ok ? 200 : 503).json(history);
    }

    if (action === "fast-connection-status") {
      if (!requireDatabase(res)) return;
      const status = await fetchFastConnectionSignalStatus({
        email: identity.email,
        phone: identity.phone
      });
      return res.status(status.ok ? 200 : 503).json(status);
    }

    if (action === "fast-connection-signal") {
      if (!requireDatabase(res)) return;
      const result = await sendFastConnectionSignal({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim()
      });
      if (result?.cooldown) {
        return res.status(429).json({ ok: false, error: result.error, cooldown: true });
      }
      if (result?.limitReached) {
        return res.status(429).json(result);
      }
      if (result?.ok === false) {
        return res.status(result.passActive === false ? 403 : 400).json(result);
      }
      return res.status(200).json(result);
    }

    if (action === "search") {
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

    if (action === "incoming") {
      if (!requireDatabase(res)) return;
      const incomingSignals = await fetchIncomingSignals(identity);
      return res.status(200).json({ ok: true, incomingSignals });
    }

    if (action === "visitors") {
      if (!requireDatabase(res)) return;
      const viewers = await fetchProfileVisitors(identity);
      return res.status(200).json({ ok: true, viewers });
    }

    if (action === "referral") {
      if (!requireDatabase(res)) return;
      const referral = await fetchReferralStats(identity);
      return res.status(200).json({ ok: true, referral });
    }

    if (action === "signal") {
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
        // Sender-state errors only (e.g. paused). Target denials stay generic below.
        return res.status(400).json(row);
      }
      // Missing, shadow-banned, and Discreet-without-contact all return null — same denial.
      if (!row) {
        return res.status(404).json({ ok: false, error: "Profile not available." });
      }
      return res.status(200).json({ ok: true, signal: row });
    }

    if (action === "accept-signal") {
      if (!requireDatabase(res)) return;
      const result = await acceptIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(result ? 200 : 404).json({ ok: Boolean(result), ...result });
    }

    if (action === "decline-signal") {
      if (!requireDatabase(res)) return;
      const ok = await declineIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(ok ? 200 : 404).json({ ok });
    }

    if (action === "ignore-signal") {
      if (!requireDatabase(res)) return;
      const ok = await ignoreIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(ok ? 200 : 404).json({ ok });
    }

    if (action === "like-profile") {
      if (!requireDatabase(res)) return;
      const row = await likeMemberProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim(),
        photoIndex: Number(body.photoIndex) || 0
      });
      if (!row) {
        return res.status(404).json({ ok: false, error: "Profile not available." });
      }
      return res.status(200).json({ ok: true, like: row });
    }

    if (action === "follow-profile") {
      if (!requireDatabase(res)) return;
      const row = await followMemberProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim()
      });
      if (!row) {
        return res.status(404).json({ ok: false, error: "Profile not available." });
      }
      return res.status(200).json({ ok: true, follow: row });
    }

    if (action === "save-profile") {
      if (!requireDatabase(res)) return;
      const row = await saveMemberProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim()
      });
      if (!row) {
        return res.status(404).json({ ok: false, error: "Profile not available." });
      }
      return res.status(200).json({ ok: true, saved: row });
    }

    if (action === "unsave-profile") {
      if (!requireDatabase(res)) return;
      const row = await unsaveMemberProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim()
      });
      return res.status(row ? 200 : 404).json({ ok: Boolean(row), removed: row });
    }

    if (action === "list-saved-profiles") {
      if (!requireDatabase(res)) return;
      const profiles = await fetchSavedProfiles({
        email: identity.email,
        phone: identity.phone
      });
      return res.status(200).json({ ok: true, profiles });
    }

    if (action === "complete-onboarding") {
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

    if (action === "onboarding-status") {
      if (!requireDatabase(res)) return;
      const { getMemberOnboardingStatus } = await import("../../server/services/onboardingRepair.js");
      const result = await getMemberOnboardingStatus(identity);
      return res.status(200).json(result);
    }

    if (action === "force-complete-onboarding") {
      if (!requireDatabase(res)) return;
      const { forceCompleteMemberOnboarding } = await import("../../server/services/onboardingRepair.js");
      const result = await forceCompleteMemberOnboarding(identity);
      if (!result.ok) {
        return res.status(result.error === "Member profile not found." ? 404 : 400).json(result);
      }
      return res.status(200).json(result);
    }

    if (action === "repair-onboarding") {
      if (!requireDatabase(res)) return;
      const { repairMemberOnboarding } = await import("../../server/services/onboardingRepair.js");
      const result = await repairMemberOnboarding(identity);
      if (!result.ok) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    }

    if (action === "compliance-ack") {
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

    if (action === "repair-flow") {
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

    if (action === "match") {
      if (!requireDatabase(res)) return;
      const { persistMatch } = await import("../../server/db.js");
      const row = await persistMatch({
        email: identity.email,
        phone: identity.phone,
        match: body.match
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), match: row });
    }

    if (action === "message") {
      if (!requireDatabase(res)) return;
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
          return sendLoggedApiError({
            req,
            res,
            event: "member_data_blocked",
            error,
            status: 400,
            message: "Message blocked for safety.",
            context: { action, code: error.code },
            level: "warn"
          });
        }
        if (error?.code === "MEMBER_BLOCKED") {
          return sendLoggedApiError({
            req,
            res,
            event: "member_data_blocked",
            error,
            status: 403,
            message: "You can't message this person.",
            context: { action, code: error.code },
            level: "warn"
          });
        }
        throw error;
      }
    }

    if (action === "report") {
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
          return sendLoggedApiError({
            req,
            res,
            event: "member_data_blocked",
            error,
            status: 400,
            message: "Report blocked for safety.",
            context: { action, code: error.code },
            level: "warn"
          });
        }
        throw error;
      }
    }

    if (action === "profile") {
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

      const { mergeMemberProfilePayload } = await import("../../server/utils/profileMerge.js");
      const existingMember = await findMemberProfileByUserKey(identity.email, identity.phone);
      const existingProfile =
        existingMember?.profile && typeof existingMember.profile === "object"
          ? existingMember.profile
          : {};
      const profilePatchScope = String(body.profilePatchScope || "full").trim();
      const profile = mergeMemberProfilePayload(existingProfile, incomingProfile, {
        patchScope: profilePatchScope
      });
      const { normalizeProfileIntents } = await import("../../shared/memberIntents.mjs");
      const { normalizeProfileOptionalPreferences } = await import(
        "../../shared/memberOptionalPreferences.mjs"
      );
      if (Array.isArray(profile.intents)) {
        profile.intents = normalizeProfileIntents(profile.intents);
      }
      Object.assign(profile, normalizeProfileOptionalPreferences(profile));
      const voicePatchActive =
        profilePatchScope === "voice" ||
        profilePatchScope === "full" ||
        Object.prototype.hasOwnProperty.call(incomingProfile, "voiceIntroUrl") ||
        Object.prototype.hasOwnProperty.call(incomingProfile, "voiceVibeUrl");
      if (voicePatchActive && profile.voiceIntroUrl) {
        const voiceUrl = String(profile.voiceIntroUrl).trim();
        profile.voiceIntroUrl =
          voiceUrl &&
          !voiceUrl.startsWith("data:") &&
          !voiceUrl.startsWith("blob:") &&
          voiceUrl.includes("/storage/v1/object/public/voice-intros/")
            ? voiceUrl
            : existingProfile.voiceIntroUrl &&
                String(existingProfile.voiceIntroUrl).includes("/storage/v1/object/public/voice-intros/")
              ? existingProfile.voiceIntroUrl
              : undefined;
      }
      const { assertProfileSafeForContactLeak } = await import("../../server/services/contactLeak.js");
      const leakCheck = await assertProfileSafeForContactLeak({
        email: identity.email,
        phone: identity.phone,
        name: identity.name || body.name,
        username: identity.username || null,
        profile
      });
      if (!leakCheck.ok) {
        return res.status(400).json({ ok: false, error: leakCheck.error });
      }

      const hideFromDiscovery = Boolean(profile.safetySettings?.hideFromDiscovery);
      const { computeDiscoverableFlag } = await import(
        "../../server/services/memberVisibilityPolicy.js"
      );
      const existing = await findMemberProfileByUserKey(identity.email, identity.phone);
      const discoverable = computeDiscoverableFlag({
        hideFromDiscovery,
        paused: Boolean(existing?.profile_paused_at),
        accountStatus: body.accountStatus || existing?.account_status || "active",
        privacyMode: existing?.privacy_mode || "discover",
        discreetUntil: existing?.discreet_until || null,
        clientDiscoverable: body.discoverable !== false
      });

      const row = await upsertMemberProfile({
        email: identity.email,
        phone: identity.phone,
        name: identity.name || body.name,
        username: identity.username || String(body.username || "").trim() || null,
        city,
        state: String(body.state || body.profile?.state || "").trim() || null,
        profile,
        discoverable,
        onboardingComplete: Boolean(body.onboardingComplete ?? body.profile?.onboardingComplete),
        cityHomeHidden: Boolean(body.cityHomeHidden)
      });
      if (!row) {
        logAlertableEvent(
          "profile_save_failed",
          observabilityContext(req, { action: "profile", reason: "upsert_returned_null" })
        );
      }
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), profile: row });
    }

    if (action === "account-state") {
      if (!requireDatabase(res)) return;
      const { fetchMemberAccountState } = await import("../../server/memberTrust.js");
      const state = await fetchMemberAccountState(identity);
      return res.status(200).json({ ok: true, account: state });
    }

    if (action === "security-settings") {
      if (!requireDatabase(res)) return;
      const { getAccountSecuritySettings } = await import("../../server/services/accountSecurity.js");
      const settings = await getAccountSecuritySettings({
        email: identity.email,
        phone: identity.phone
      });
      return res.status(200).json({ ok: true, settings });
    }

    if (action === "two-factor-enable") {
      if (!requireDatabase(res)) return;
      const { setTwoFactorEnabled } = await import("../../server/services/accountSecurity.js");
      const ip =
        typeof req.headers["x-forwarded-for"] === "string"
          ? req.headers["x-forwarded-for"].split(",")[0].trim()
          : req.socket?.remoteAddress || null;
      const userAgent = String(req.headers["user-agent"] || "").slice(0, 512) || null;
      const result = await setTwoFactorEnabled({
        email: identity.email,
        phone: identity.phone,
        enabled: Boolean(body.enabled),
        method: body.method,
        ip,
        userAgent
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "change-username") {
      if (!requireDatabase(res)) return;
      const { changeMemberUsername } = await import("../../server/memberTrust.js");
      const result = await changeMemberUsername({
        email: identity.email,
        phone: identity.phone,
        username: String(body.username || "")
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "pause-profile") {
      if (!requireDatabase(res)) return;
      const { pauseMemberProfile } = await import("../../server/memberTrust.js");
      const result = await pauseMemberProfile({
        email: identity.email,
        phone: identity.phone,
        reason: body.reason
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "unpause-profile") {
      if (!requireDatabase(res)) return;
      const { unpauseMemberProfile } = await import("../../server/memberTrust.js");
      const result = await unpauseMemberProfile({ email: identity.email, phone: identity.phone });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "soft-delete-account") {
      if (!requireDatabase(res)) return;
      const { softDeleteMemberAccount } = await import("../../server/memberTrust.js");
      const result = await softDeleteMemberAccount({ email: identity.email, phone: identity.phone });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "restore-account") {
      if (!requireDatabase(res)) return;
      const { restoreMemberAccount } = await import("../../server/memberTrust.js");
      const result = await restoreMemberAccount({ email: identity.email, phone: identity.phone });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "user-block") {
      if (!requireDatabase(res)) return;
      const targetProfileId = String(body.targetProfileId || "").trim();
      if (!targetProfileId) {
        return res.status(400).json({ ok: false, error: "targetProfileId is required." });
      }
      const { persistMemberBlock } = await import("../../server/services/memberBlocks.js");
      const { normalizeUserKey } = await import("../../server/db.js");
      const reporter = await findMemberProfileByUserKey(identity.email, identity.phone);
      const blockerUserKey =
        reporter?.user_key ||
        normalizeUserKey({ email: identity.email, phone: identity.phone });
      const target = await query(
        `select user_key from app_member_profiles where id = $1 limit 1`,
        [targetProfileId]
      );
      await persistMemberBlock({
        blockerUserKey,
        blockedProfileId: targetProfileId,
        blockedUserKey: target.rows[0]?.user_key || null
      });
      const { writeAuditLog } = await import("../../server/services/auditLog.js");
      await writeAuditLog({
        userId: reporter?.id || null,
        targetUserId: targetProfileId,
        action: "user_blocked",
        details: {}
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "unmatch") {
      if (!requireDatabase(res)) return;
      const matchId = String(body.matchId || "").trim();
      const targetProfileId = String(body.targetProfileId || "").trim();
      if (!matchId) {
        return res.status(400).json({ ok: false, error: "matchId is required." });
      }
      const { unmatchBothSides, persistMemberBlock } = await import("../../server/services/memberBlocks.js");
      const { normalizeUserKey } = await import("../../server/db.js");
      const reporter = await findMemberProfileByUserKey(identity.email, identity.phone);
      const userKey =
        reporter?.user_key ||
        normalizeUserKey({ email: identity.email, phone: identity.phone });
      const result = await unmatchBothSides({ matchId, userKey });
      if (targetProfileId) {
        const target = await query(
          `select user_key from app_member_profiles where id = $1 limit 1`,
          [targetProfileId]
        );
        await persistMemberBlock({
          blockerUserKey: userKey,
          blockedProfileId: targetProfileId,
          blockedUserKey: target.rows[0]?.user_key || result?.peerUserKey || null
        });
      }
      return res.status(200).json({ ok: Boolean(result?.ok) });
    }

    if (action === "connection-note") {
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

    if (action === "send-introduction") {
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

    if (action === "success-story") {
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

    if (action === "moderation-flag") {
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

    if (action === "contact-exchange-state") {
      if (!requireDatabase(res)) return;
      const { getContactExchangeState } = await import("../../server/services/contactExchange.js");
      const result = await getContactExchangeState({
        email: identity.email,
        phone: identity.phone,
        matchId: String(body.matchId || "").trim()
      });
      return res.status(200).json(result);
    }

    if (action === "contact-exchange-request") {
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

    if (action === "contact-exchange-respond") {
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

    if (action === "contact-exchange-complete") {
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

    if (action === "contact-exchange-cancel") {
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

    if (action === "contact-exchange-disable") {
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

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: action === "profile" ? "profile_save_failed" : "member_data_failed",
      error,
      status: 500,
      message: "Member data request failed.",
      context: { action }
    });
  }
}

export { PUBLIC_MEMBER_DATA_ACTIONS };
