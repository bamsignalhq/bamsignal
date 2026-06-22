/** Signal Concierge Success Story consent — dual approval, withdrawal, publication guard. */

const DEFAULT_SUCCESS_STORY_CONSENT = {
  visibility: "anonymous",
  photoPermission: "no-photos",
  videoPermission: "no-video",
  testimonialPermission: "private-feedback-only"
};

export function createDefaultSuccessStoryConsent(input) {
  const now = new Date().toISOString();
  return {
    id: `ssc_${input.journeyId}`,
    journeyId: input.journeyId,
    memberAId: input.memberAId,
    memberBId: input.memberBId,
    memberAName: input.memberAName,
    memberBName: input.memberBName,
    visibility: DEFAULT_SUCCESS_STORY_CONSENT.visibility,
    photoPermission: DEFAULT_SUCCESS_STORY_CONSENT.photoPermission,
    videoPermission: DEFAULT_SUCCESS_STORY_CONSENT.videoPermission,
    testimonialPermission: DEFAULT_SUCCESS_STORY_CONSENT.testimonialPermission,
    partyApprovals: {
      memberA: { memberId: input.memberAId, memberName: input.memberAName, approved: false },
      memberB: { memberId: input.memberBId, memberName: input.memberBName, approved: false }
    },
    withdrawn: false,
    history: [],
    createdAt: now,
    updatedAt: now
  };
}

export function bothPartiesApproved(consent) {
  return consent.partyApprovals.memberA.approved && consent.partyApprovals.memberB.approved;
}

export function canPublishSuccessStory(consent) {
  if (!consent || consent.withdrawn) return false;
  if (!bothPartiesApproved(consent)) return false;
  if (consent.testimonialPermission === "private-feedback-only") return false;
  return true;
}

export function assertConsentHistoryAppendOnly(previous, next) {
  if (!previous?.history) return;
  if ((next?.history?.length ?? 0) < previous.history.length) {
    throw new Error("Consent history cannot shrink");
  }
}

function appendHistory(consent, entry) {
  return {
    ...consent,
    history: [entry, ...consent.history],
    updatedAt: new Date().toISOString()
  };
}

export function applyPartyApproval(consent, input) {
  const now = new Date().toISOString();
  const isA = input.memberId === consent.memberAId;
  const isB = input.memberId === consent.memberBId;
  if (!isA && !isB) {
    throw new Error("Member is not part of this couple consent record");
  }

  const partyKey = isA ? "memberA" : "memberB";
  const next = {
    ...consent,
    withdrawn: false,
    withdrawnAt: undefined,
    partyApprovals: {
      ...consent.partyApprovals,
      [partyKey]: {
        ...consent.partyApprovals[partyKey],
        approved: true,
        approvedAt: now
      }
    },
    updatedAt: now
  };

  return appendHistory(next, {
    id: `ssch_${Date.now().toString(36)}`,
    action: consent.history.length ? "updated" : "granted",
    at: now,
    approvedBy: input.memberName,
    memberId: input.memberId,
    detail: "Party approval recorded",
    visibility: next.visibility,
    photoPermission: next.photoPermission,
    videoPermission: next.videoPermission,
    testimonialPermission: next.testimonialPermission
  });
}

export function updateConsentPermissions(consent, permissions, approvedBy) {
  const now = new Date().toISOString();
  const next = {
    ...consent,
    ...permissions,
    partyApprovals: {
      memberA: { ...consent.partyApprovals.memberA, approved: false, approvedAt: undefined },
      memberB: { ...consent.partyApprovals.memberB, approved: false, approvedAt: undefined }
    },
    withdrawn: false,
    withdrawnAt: undefined,
    updatedAt: now
  };

  return appendHistory(next, {
    id: `ssch_${Date.now().toString(36)}`,
    action: "updated",
    at: now,
    approvedBy,
    detail: "Permissions updated — both approvals required again",
    visibility: next.visibility,
    photoPermission: next.photoPermission,
    videoPermission: next.videoPermission,
    testimonialPermission: next.testimonialPermission
  });
}

export function withdrawSuccessStoryConsent(consent, input) {
  const now = new Date().toISOString();
  const next = {
    ...consent,
    withdrawn: true,
    withdrawnAt: now,
    partyApprovals: {
      memberA: { ...consent.partyApprovals.memberA, approved: false, approvedAt: undefined },
      memberB: { ...consent.partyApprovals.memberB, approved: false, approvedAt: undefined }
    },
    testimonialPermission: DEFAULT_SUCCESS_STORY_CONSENT.testimonialPermission,
    photoPermission: DEFAULT_SUCCESS_STORY_CONSENT.photoPermission,
    videoPermission: DEFAULT_SUCCESS_STORY_CONSENT.videoPermission,
    updatedAt: now
  };

  return appendHistory(next, {
    id: `ssch_${Date.now().toString(36)}`,
    action: "withdrawn",
    at: now,
    approvedBy: input.approvedBy,
    memberId: input.memberId,
    detail: "Consent withdrawn — future publications stop immediately"
  });
}

export function getPartyApprovalStatus(consent) {
  return {
    memberA: consent.partyApprovals.memberA,
    memberB: consent.partyApprovals.memberB,
    bothApproved: bothPartiesApproved(consent),
    publishable: canPublishSuccessStory(consent)
  };
}
