#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  getPhotoModerationMode,
  moderatePhoto
} from "../server/services/photoModerationProvider.js";

const originalMode = process.env.PHOTO_MODERATION_MODE;

function withMode(mode, fn) {
  process.env.PHOTO_MODERATION_MODE = mode;
  try {
    fn();
  } finally {
    if (originalMode === undefined) delete process.env.PHOTO_MODERATION_MODE;
    else process.env.PHOTO_MODERATION_MODE = originalMode;
  }
}

withMode("upload_first", () => {
  assert.equal(getPhotoModerationMode(), "upload_first");
});

withMode("strict", () => {
  assert.equal(getPhotoModerationMode(), "strict");
});

withMode(undefined, () => {
  assert.equal(getPhotoModerationMode(), "upload_first");
});

async function testUploadFirstAllowsRealPhotos() {
  process.env.PHOTO_MODERATION_MODE = "upload_first";
  const samples = [
    "gym-selfie.jpg",
    "mirror-photo.png",
    "IMG_1234.JPG",
    "WhatsApp Image 2024-06-17 at 10.00.00.jpeg",
    "outdoor-portrait.webp"
  ];

  for (const filename of samples) {
    const result = await moderatePhoto({
      imageUrl: "https://example.com/photo.webp",
      userId: "user-1",
      photoType: "profile",
      hints: { filename }
    });
    assert.equal(result.decision, "approved", `upload_first should approve: ${filename}`);
  }
}

async function testUploadFirstFlagsContactFilename() {
  process.env.PHOTO_MODERATION_MODE = "upload_first";
  const result = await moderatePhoto({
    imageUrl: "https://example.com/photo.webp",
    userId: "user-1",
    photoType: "profile",
    hints: { filename: "call-me-08012345678.jpg" }
  });
  assert.equal(result.decision, "pending_review");
  assert.ok(result.flags.includes("contact_info_detected"));
}

async function testStrictFlagsObviousDanger() {
  process.env.PHOTO_MODERATION_MODE = "strict";
  const result = await moderatePhoto({
    imageUrl: "https://example.com/photo.webp",
    userId: "user-1",
    photoType: "profile",
    hints: { ocrText: "NIN National Identification Number Federal Republic of Nigeria" }
  });
  assert.equal(result.decision, "pending_review");
  assert.ok(result.flags.includes("document_like"));
}

async function testProviderFailurePendingReview() {
  process.env.PHOTO_MODERATION_MODE = "upload_first";
  const result = await moderatePhoto({
    imageUrl: "https://example.com/photo.webp",
    userId: "user-1",
    photoType: "profile",
    hints: {
      get filename() {
        throw new Error("moderation provider unavailable");
      }
    }
  });
  assert.equal(result.decision, "pending_review");
  assert.ok(result.flags.includes("moderation_unavailable"));
}

await testUploadFirstAllowsRealPhotos();
await testUploadFirstFlagsContactFilename();
await testStrictFlagsObviousDanger();
await testProviderFailurePendingReview();

if (originalMode === undefined) delete process.env.PHOTO_MODERATION_MODE;
else process.env.PHOTO_MODERATION_MODE = originalMode;

console.log("✓ Photo moderation provider");
