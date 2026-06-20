/**
 * Photo moderation authority — members must not approve/hide/reject via profile or API payloads.
 */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const {
  sanitizeMemberPhotoMeta,
  resolveMemberPhotoReviewStatus,
  getApprovedPublicPhotos
} = await import("../shared/photoReview.mjs");
const { mergeMemberProfilePayload } = await import("../server/utils/profileMerge.js");

const photoA = "https://cdn.example.com/a.webp";
const photoB = "https://cdn.example.com/b.webp";
const photoC = "https://cdn.example.com/c.webp";

const sanitizedApproved = sanitizeMemberPhotoMeta(
  { [photoA]: { photoReviewStatus: "pending_review", type: "profile", photoRiskFlags: [] } },
  { [photoA]: { photoReviewStatus: "approved", approvedAt: "2026-06-20T00:00:00.000Z" } },
  [photoA]
);
assert(
  sanitizedApproved[photoA].photoReviewStatus === "pending_review",
  "member profile save must ignore approved on existing pending photo"
);

const sanitizedNew = sanitizeMemberPhotoMeta(
  {},
  { [photoB]: { photoReviewStatus: "approved", moderationReason: "self approve" } },
  [photoB]
);
assert(
  sanitizedNew[photoB].photoReviewStatus === "pending_review",
  "new member photo must always start pending_review"
);

const sanitizedHidden = sanitizeMemberPhotoMeta(
  {
    [photoA]: {
      photoReviewStatus: "approved",
      type: "profile",
      photoRiskFlags: [],
      approvedAt: "2026-06-19T00:00:00.000Z"
    }
  },
  { [photoA]: { photoReviewStatus: "hidden", hiddenAt: "2026-06-20T00:00:00.000Z" } },
  [photoA]
);
assert(
  sanitizedHidden[photoA].photoReviewStatus === "approved",
  "server-approved photo must stay approved when client sends hidden"
);

const deleteSafe = sanitizeMemberPhotoMeta(
  {
    [photoA]: { photoReviewStatus: "approved", type: "profile", photoRiskFlags: [] },
    [photoB]: { photoReviewStatus: "pending_review", type: "profile", photoRiskFlags: [] }
  },
  {
    [photoA]: { photoReviewStatus: "hidden" },
    [photoB]: { photoReviewStatus: "rejected" }
  },
  [photoA]
);
assert(deleteSafe[photoA].photoReviewStatus === "approved", "delete-safe merge keeps approved photo meta");
assert(!deleteSafe[photoB], "removed photo meta must not remain after delete");

const mergedAttack = mergeMemberProfilePayload(
  {
    photos: [photoA, photoB],
    photoMeta: {
      [photoA]: { photoReviewStatus: "approved", type: "profile", photoRiskFlags: [] },
      [photoB]: { photoReviewStatus: "pending_review", type: "profile", photoRiskFlags: [] }
    }
  },
  {
    photos: [photoA, photoB, photoC],
    photoMeta: {
      [photoA]: { photoReviewStatus: "hidden" },
      [photoB]: { photoReviewStatus: "approved" },
      [photoC]: { photoReviewStatus: "approved" }
    }
  }
);
assert(
  mergedAttack.photoMeta[photoA].photoReviewStatus === "approved",
  "profile merge must preserve server-approved status"
);
assert(
  mergedAttack.photoMeta[photoB].photoReviewStatus === "pending_review",
  "profile merge must preserve server pending status"
);
assert(
  mergedAttack.photoMeta[photoC].photoReviewStatus === "pending_review",
  "profile merge must force pending on newly added photos"
);

assert(
  resolveMemberPhotoReviewStatus({ requestedStatus: "approved", trustedModeration: false }) ===
    "pending_review",
  "member submit-review must strip approved status"
);
assert(
  resolveMemberPhotoReviewStatus({
    requestedStatus: "hidden",
    previousStatus: "approved",
    trustedModeration: false
  }) === "approved",
  "member submit-review must not downgrade approved review"
);
assert(
  resolveMemberPhotoReviewStatus({
    requestedStatus: "approved",
    trustedModeration: true
  }) === "approved",
  "admin moderation path must allow approved status"
);

const publicPhotos = getApprovedPublicPhotos({
  photos: [photoA, photoB, photoC],
  photoMeta: {
    [photoA]: { photoReviewStatus: "approved", type: "profile", photoRiskFlags: [] },
    [photoB]: { photoReviewStatus: "pending_review", type: "profile", photoRiskFlags: [] },
    [photoC]: { photoReviewStatus: "hidden", type: "profile", photoRiskFlags: [] }
  }
});
assert(publicPhotos.length === 1 && publicPhotos[0] === photoA, "public surfaces show approved only");

const memberPhotosApiSource = await import("node:fs").then(({ readFileSync }) =>
  readFileSync(new URL("../api/member/photos.js", import.meta.url), "utf8")
);
const profileMergeSource = await import("node:fs").then(({ readFileSync }) =>
  readFileSync(new URL("../server/utils/profileMerge.js", import.meta.url), "utf8")
);
const photoReviewServiceSource = await import("node:fs").then(({ readFileSync }) =>
  readFileSync(new URL("../server/services/photoReview.js", import.meta.url), "utf8")
);

assert(
  !memberPhotosApiSource.includes("body.photoReviewStatus"),
  "member photos API must not read photoReviewStatus from client body"
);
assert(
  profileMergeSource.includes("sanitizeMemberPhotoMeta"),
  "profile merge must sanitize member photoMeta"
);
assert(
  photoReviewServiceSource.includes("trustedModeration") &&
    photoReviewServiceSource.includes("resolveMemberPhotoReviewStatus"),
  "photo review service must enforce trusted moderation gate"
);

console.log("photo moderation authority tests ok");
