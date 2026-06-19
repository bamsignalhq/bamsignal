/**
 * Smoke tests for cover photo merge + timestamped storage uploads.
 */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { mergeMemberProfilePayload } = await import("../server/utils/profileMerge.js");

const merged = mergeMemberProfilePayload(
  {
    coverPhotoUrl: "https://example.com/old.webp",
    coverPhotoUpdatedAt: "2026-06-17T10:00:00.000Z",
    coverPhotoExplicit: true,
    photos: ["https://example.com/p1.webp"]
  },
  {
    bio: "Updated bio"
  }
);
assert(merged.coverPhotoUrl === "https://example.com/old.webp", "merge keeps existing cover when incoming omits it");
assert(merged.photos.length === 1, "merge keeps photos when incoming omits them");

const newer = mergeMemberProfilePayload(
  {
    coverPhotoUrl: "https://example.com/old.webp",
    coverPhotoUpdatedAt: "2026-06-17T10:00:00.000Z",
    coverPhotoExplicit: true
  },
  {
    coverPhotoUrl: "https://example.com/new.webp",
    coverPhotoUpdatedAt: "2026-06-18T12:00:00.000Z",
    coverPhotoExplicit: true
  }
);
assert(newer.coverPhotoUrl === "https://example.com/new.webp", "merge prefers newer cover");

console.log("cover photo persistence tests ok");
