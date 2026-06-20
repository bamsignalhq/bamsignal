/**
 * Profile patch race hardening — scoped saves must not clobber unrelated fields.
 */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { mergeMemberProfilePayload } = await import("../server/utils/profileMerge.js");

const existing = {
  bio: "Fresh bio",
  interests: ["Music", "Travel"],
  voiceIntroUrl: "https://cdn.example.com/voice.mp3",
  photos: ["https://cdn.example.com/a.webp", "https://cdn.example.com/b.webp"],
  mainPhotoUrl: "https://cdn.example.com/a.webp",
  photoMeta: {
    "https://cdn.example.com/a.webp": {
      photoReviewStatus: "approved",
      photoRiskFlags: [],
      type: "profile",
      uploadedAt: "2026-06-19T00:00:00.000Z"
    },
    "https://cdn.example.com/b.webp": {
      photoReviewStatus: "pending_review",
      photoRiskFlags: [],
      type: "profile",
      uploadedAt: "2026-06-20T00:00:00.000Z"
    }
  }
};

const staleSnapshot = {
  bio: "Stale bio",
  interests: ["Music"],
  voiceIntroUrl: undefined,
  photos: ["https://cdn.example.com/a.webp", "https://cdn.example.com/c.webp"],
  mainPhotoUrl: "https://cdn.example.com/c.webp",
  photoMeta: {
    "https://cdn.example.com/a.webp": {
      photoReviewStatus: "approved",
      photoRiskFlags: [],
      type: "profile",
      uploadedAt: "2026-06-19T00:00:00.000Z"
    },
    "https://cdn.example.com/c.webp": {
      photoReviewStatus: "approved",
      photoRiskFlags: [],
      type: "profile",
      uploadedAt: "2026-06-20T12:00:00.000Z"
    }
  }
};

const photoSave = mergeMemberProfilePayload(existing, staleSnapshot, { patchScope: "photos" });
assert(photoSave.bio === "Fresh bio", "photo upload must not overwrite bio");
assert(photoSave.voiceIntroUrl === existing.voiceIntroUrl, "photo upload must not clear voice intro");
assert(
  photoSave.interests.join(",") === existing.interests.join(","),
  "photo upload must not overwrite interests"
);
assert(photoSave.photos.includes("https://cdn.example.com/c.webp"), "photo upload must apply gallery changes");
assert(
  photoSave.photoMeta["https://cdn.example.com/c.webp"].photoReviewStatus === "pending_review",
  "photo upload must not trust client-approved moderation status"
);

const profileSave = mergeMemberProfilePayload(existing, staleSnapshot, { patchScope: "profile" });
assert(profileSave.bio === "Stale bio", "profile save must apply bio edits");
assert(profileSave.photos.join(",") === existing.photos.join(","), "profile save must not reorder photos");
assert(
  profileSave.voiceIntroUrl === existing.voiceIntroUrl,
  "profile save must preserve voice intro"
);

const voiceSave = mergeMemberProfilePayload(
  existing,
  {
    ...staleSnapshot,
    voiceIntroUrl: "https://cdn.example.com/new-voice.mp3",
    voiceIntroUpdatedAt: "2026-06-20T13:00:00.000Z"
  },
  { patchScope: "voice" }
);
assert(voiceSave.voiceIntroUrl === "https://cdn.example.com/new-voice.mp3", "voice save must update voice URL");
assert(voiceSave.bio === existing.bio, "voice save must not overwrite bio");
assert(voiceSave.photos.join(",") === existing.photos.join(","), "voice save must not overwrite photos");

const preferenceSave = mergeMemberProfilePayload(
  existing,
  {
    ...staleSnapshot,
    interests: ["Art", "Food"],
    intents: ["Relationship"]
  },
  { patchScope: "profile" }
);
assert(preferenceSave.interests.join(",") === "Art,Food", "preference save must apply interests");
assert(
  preferenceSave.photos.join(",") === existing.photos.join(","),
  "preference save must not change photo order"
);

const parallelPhotoThenProfile = mergeMemberProfilePayload(
  mergeMemberProfilePayload(existing, staleSnapshot, { patchScope: "photos" }),
  { bio: "Final bio", interests: ["Music", "Travel", "Art"] },
  { patchScope: "profile" }
);
assert(parallelPhotoThenProfile.bio === "Final bio", "parallel profile patch must keep latest bio");
assert(
  parallelPhotoThenProfile.photos.includes("https://cdn.example.com/c.webp"),
  "parallel profile patch must keep photo upload result"
);
assert(
  parallelPhotoThenProfile.voiceIntroUrl === existing.voiceIntroUrl,
  "parallel patches must keep voice intro"
);

const memberDataApiSource = await import("node:fs").then(({ readFileSync }) =>
  readFileSync(new URL("../api/member/data.js", import.meta.url), "utf8")
);
const cityHomeSource = await import("node:fs").then(({ readFileSync }) =>
  readFileSync(new URL("../src/services/cityHome.ts", import.meta.url), "utf8")
);
const profileMergeSource = await import("node:fs").then(({ readFileSync }) =>
  readFileSync(new URL("../server/utils/profileMerge.js", import.meta.url), "utf8")
);

assert(
  memberDataApiSource.includes("profilePatchScope") &&
    cityHomeSource.includes("profilePatchScope") &&
    profileMergeSource.includes("patchScope"),
  "profile sync must pass explicit patch scopes to server merge"
);

console.log("profile patch race tests ok");
