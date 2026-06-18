#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  isUnhealthyPhotoSubmission,
  PHOTO_VIOLATION_SHADOW_BAN_THRESHOLD
} from "../server/services/moderation.js";

assert.equal(PHOTO_VIOLATION_SHADOW_BAN_THRESHOLD, 3);

assert.equal(isUnhealthyPhotoSubmission({ photoReviewStatus: "pending_review" }), true);
assert.equal(isUnhealthyPhotoSubmission({ photoReviewStatus: "rejected" }), true);
assert.equal(isUnhealthyPhotoSubmission({ photoReviewStatus: "approved", photoRiskFlags: [] }), false);
assert.equal(
  isUnhealthyPhotoSubmission({ photoReviewStatus: "approved", photoRiskFlags: ["no_face_detected"] }),
  true
);

console.log("✓ Photo violation helpers");
