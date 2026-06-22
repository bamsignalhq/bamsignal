import type { SuccessStoryConsentRecord } from "../types/conciergeSuccessStoryConsent";
import { createDefaultSuccessStoryConsent } from "../utils/successStoryConsentLogic";
import { applyPartyApproval, updateConsentPermissions } from "../utils/successStoryConsentLogic";

const JOURNEY_ID = "BS-JR-2028-0045";

let seed: SuccessStoryConsentRecord = createDefaultSuccessStoryConsent({
  journeyId: JOURNEY_ID,
  memberAId: "sc_member_adaeze",
  memberBId: "sc_member_emeka_o",
  memberAName: "Adaeze M.",
  memberBName: "Emeka O."
});

seed = updateConsentPermissions(
  seed,
  {
    visibility: "first-name-only",
    photoPermission: "private-photos",
    videoPermission: "no-video",
    testimonialPermission: "website-use-allowed"
  },
  "Ada Okafor"
);

seed = applyPartyApproval(seed, { memberId: "sc_member_adaeze", memberName: "Adaeze M." });
seed = applyPartyApproval(seed, { memberId: "sc_member_emeka_o", memberName: "Emeka O." });

export const CONCIERGE_SUCCESS_STORY_CONSENT_SEED: SuccessStoryConsentRecord[] = [seed];
