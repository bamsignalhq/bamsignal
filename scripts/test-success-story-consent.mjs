/**
 * Signal Concierge Success Story consent regression.
 */
import {
  applyPartyApproval,
  assertConsentHistoryAppendOnly,
  canPublishSuccessStory,
  createDefaultSuccessStoryConsent,
  updateConsentPermissions,
  withdrawSuccessStoryConsent
} from "../server/services/successStoryConsent.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = createDefaultSuccessStoryConsent({
  journeyId: "BS-JR-2028-0045",
  memberAId: "member_a",
  memberBId: "member_b",
  memberAName: "Chioma",
  memberBName: "David"
});

// Default — everything private
assert(!canPublishSuccessStory(base), "default consent is not publishable");
assert(base.testimonialPermission === "private-feedback-only", "default testimonial is private");
assert(base.photoPermission === "no-photos", "default photos denied");
assert(!base.partyApprovals.memberA.approved, "member A not approved by default");

// Dual approval — single party insufficient
let consent = applyPartyApproval(base, { memberId: "member_a", memberName: "Chioma" });
assert(!canPublishSuccessStory(consent), "single-party approval is insufficient");

consent = applyPartyApproval(consent, { memberId: "member_b", memberName: "David" });
assert(!canPublishSuccessStory(consent), "dual approval still private with testimonial-only feedback");

consent = updateConsentPermissions(
  consent,
  { testimonialPermission: "website-use-allowed", visibility: "first-name-only" },
  "Chioma"
);
assert(!canPublishSuccessStory(consent), "permission change resets approvals");

consent = applyPartyApproval(consent, { memberId: "member_a", memberName: "Chioma" });
consent = applyPartyApproval(consent, { memberId: "member_b", memberName: "David" });
assert(canPublishSuccessStory(consent), "dual approval with website permission is publishable");

// Consent persistence — history append only
const historyLen = consent.history.length;
let threw = false;
try {
  assertConsentHistoryAppendOnly(consent, { ...consent, history: consent.history.slice(1) });
} catch {
  threw = true;
}
assert(threw, "consent history cannot shrink");

// Withdrawal
consent = withdrawSuccessStoryConsent(consent, { memberId: "member_a", approvedBy: "Chioma" });
assert(!canPublishSuccessStory(consent), "withdrawn consent is not publishable");
assert(consent.withdrawn, "withdrawn flag set");
assert(consent.testimonialPermission === "private-feedback-only", "withdrawal resets to private");
assert(consent.history.length > historyLen, "withdrawal appends history");

// Permission changes after withdrawal require fresh dual approval
consent = updateConsentPermissions(
  consent,
  { testimonialPermission: "social-media-use-allowed" },
  "David"
);
assert(!canPublishSuccessStory(consent), "post-withdrawal update still needs dual approval");

console.log("test-success-story-consent: all checks passed");
