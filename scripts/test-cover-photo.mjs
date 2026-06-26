/**
 * Smoke tests for cover photo merge + timestamped storage uploads.
 */
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  },
  { patchScope: "photos" }
);
assert(newer.coverPhotoUrl === "https://example.com/new.webp", "merge prefers newer cover");

const profileOnly = mergeMemberProfilePayload(
  {
    coverPhotoUrl: "https://example.com/keep.webp",
    bio: "Keep bio",
    photos: ["https://example.com/p1.webp"]
  },
  {
    bio: "Updated bio",
    coverPhotoUrl: "https://example.com/stale.webp",
    photos: []
  },
  { patchScope: "profile" }
);
assert(profileOnly.bio === "Updated bio", "profile patch updates bio");
assert(profileOnly.coverPhotoUrl === "https://example.com/keep.webp", "profile patch keeps cover");
assert(profileOnly.photos.length === 1, "profile patch keeps photos");

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const backdropWebp = path.join(root, "public/showcase/backdrop.webp");
const backdropPng = path.join(root, "public/showcase/backdrop.png");
const webpStat = await stat(backdropWebp);
const pngStat = await stat(backdropPng);

assert(webpStat.size > 512, "backdrop.webp exists and is non-trivial");
assert(webpStat.size <= 180 * 1024, "backdrop.webp is under 180 KB budget");
assert(pngStat.isFile(), "backdrop.png source kept in repo");

console.log("cover photo persistence tests ok");
