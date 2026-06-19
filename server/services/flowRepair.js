import { findMemberProfileByUserKey } from "../cityHome.js";
import { isDatabaseReady, query } from "../db.js";
import {
  isServerComplianceComplete,
  recordComplianceAcknowledgements,
  resolveMemberCompliance
} from "./compliance.js";
import { markMemberOnboardingComplete } from "../memberSocial.js";

function profileLooksComplete(profile = {}) {
  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  return Boolean(
    profile.onboardingComplete ||
      profile.setupCompleted ||
      profile.profileCompletedAt ||
      profile.onboardingCompletedAt ||
      profile.completedAt ||
      (photos.length >= 3 && profile.city && profile.gender)
  );
}

export async function repairMemberFlow({
  email,
  phone,
  currentRoute = "/",
  flowName = "",
  clientState = {}
}) {
  if (!isDatabaseReady()) {
    return { ok: false, error: "Database unavailable." };
  }

  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) {
    return { ok: false, error: "Member profile not found." };
  }

  let repaired = false;
  const profileJson = member.profile && typeof member.profile === "object" ? member.profile : {};
  let compliance = await resolveMemberCompliance(member.id, profileJson.compliance);

  const pendingAcks = Array.isArray(clientState.pendingAcks) ? clientState.pendingAcks : [];
  if (pendingAcks.length) {
    const ackResult = await recordComplianceAcknowledgements({
      email,
      phone,
      acks: pendingAcks.map((type) => ({ type }))
    });
    if (ackResult.ok && ackResult.compliance) {
      compliance = ackResult.compliance;
      repaired = true;
    }
  }

  const profileComplete = Boolean(clientState.profileComplete || profileLooksComplete(profileJson));
  if (profileComplete && !member.onboarding_complete) {
    const marked = await markMemberOnboardingComplete({ email, phone });
    if (marked?.ok) repaired = true;
  }

  const storedCompliance =
    profileJson.compliance && typeof profileJson.compliance === "object" ? profileJson.compliance : {};
  const complianceChanged = JSON.stringify(storedCompliance) !== JSON.stringify(compliance);
  if (complianceChanged) {
    const nextProfile = { ...profileJson, compliance };
    await query(
      `update app_member_profiles
       set profile = $2::jsonb, updated_at = now()
       where id = $1`,
      [member.id, nextProfile]
    );
    repaired = true;
  }

  const complete = isServerComplianceComplete(compliance);
  const nextRoute = complete ? "/home" : currentRoute || "/";

  return {
    ok: true,
    repaired,
    nextRoute,
    compliance,
    message: repaired
      ? "Account state repaired."
      : complete
        ? "Compliance already complete."
        : "No changes were needed."
  };
}
