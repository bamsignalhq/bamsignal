#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  containsDocumentKeywords,
  containsImageUrlLeak,
  containsNigerianPhoneInText,
  scanPhotoSafetyText
} from "../shared/photoSafetyPatterns.mjs";
import {
  assessCoverPhoto,
  assessProfilePhoto,
  containsBusinessFlyerText,
  faceAreaPassesProfileCheck,
  PHOTO_RISK_REJECT_THRESHOLD,
  shouldRejectByRiskScore
} from "../shared/photoQualityScore.mjs";
import {
  filterPhotosForPublicView,
  isPhotoCountableForSignup
} from "../shared/photoReview.mjs";

function testDocumentKeywords() {
  const mustFail = [
    "NIN 12345678901",
    "National Identification Number",
    "Federal Republic of Nigeria",
    "BVN 22123456789",
    "International Passport",
    "Driver's Licence",
    "Issue Date 12/01/2020",
    "Surname Okafor",
    "Given Names Ada",
    "Card Number 1234",
    "Date of Birth 01/01/1990",
    "WAEC certificate",
    "Birth certificate",
    "Utility bill",
    "ATM card",
    "PVC voter card",
    "Receipt #4421"
  ];

  for (const sample of mustFail) {
    assert.equal(containsDocumentKeywords(sample), true, `should flag document text: ${sample}`);
    const scan = scanPhotoSafetyText(sample);
    assert.equal(scan.blocked, true, `should block: ${sample}`);
    assert.equal(scan.category, "document_detected");
  }

  const mustPass = [
    "Beach day with friends",
    "Sunday brunch portrait",
    "Lagos rooftop vibes",
    "Smiling at the camera"
  ];

  for (const sample of mustPass) {
    assert.equal(containsDocumentKeywords(sample), false, `should allow: ${sample}`);
    assert.equal(scanPhotoSafetyText(sample).blocked, false, `should allow: ${sample}`);
  }

  console.log("✓ Document keyword detection");
}

function testPhoneDetection() {
  const mustFail = ["07012345678", "08012345678", "08123456789", "09087654321", "09123456789", "+2348012345678"];
  for (const sample of mustFail) {
    assert.equal(containsNigerianPhoneInText(sample), true, `should flag phone: ${sample}`);
    const scan = scanPhotoSafetyText(sample);
    assert.equal(scan.blocked, true);
    assert.equal(scan.category, "contact_information");
  }
  console.log("✓ Nigerian phone detection");
}

function testUrlDetection() {
  const mustFail = [
    "WhatsApp me",
    "telegram chat",
    "instagram.com/user",
    "tiktok profile",
    "name@gmail.com",
    "https://example.com",
    "www.example.com",
    "wa.me/2348012345678",
    "t.me/username"
  ];
  for (const sample of mustFail) {
    assert.equal(containsImageUrlLeak(sample), true, `should flag url/social: ${sample}`);
    const scan = scanPhotoSafetyText(sample);
    assert.equal(scan.blocked, true);
    assert.equal(scan.category, "contact_information");
  }
  console.log("✓ URL / social leak detection");
}

function testVerificationSelfieAllowsDocuments() {
  const idText = "NIN National Identification Number Federal Republic of Nigeria";
  const publicScan = scanPhotoSafetyText(idText, { allowDocuments: false });
  assert.equal(publicScan.blocked, true);

  const selfieScan = scanPhotoSafetyText(idText, { allowDocuments: true });
  assert.equal(selfieScan.blocked, false);

  const phoneOnId = scanPhotoSafetyText("call 08012345678", { allowDocuments: true });
  assert.equal(phoneOnId.blocked, true);

  console.log("✓ Verification selfie document exception");
}

function testFaceAreaThreshold() {
  assert.equal(faceAreaPassesProfileCheck(0.03, 0.03), true);
  assert.equal(faceAreaPassesProfileCheck(0.01, 0.01), false);
  assert.equal(faceAreaPassesProfileCheck(0.015, 0.04), true);
  console.log("✓ Face area threshold");
}

function testProfileRiskScoring() {
  const logoNoFace = assessProfilePhoto({
    hasAdequateFace: false,
    logoLikelihood: 0.8,
    textDensity: 0.05,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false
  });
  assert.equal(logoNoFace.hardBlock, false);
  assert.equal(logoNoFace.pendingReview, true);
  assert.ok(logoNoFace.riskFlags.includes("no_face_detected"));

  const selfiePass = assessProfilePhoto({
    hasAdequateFace: true,
    logoLikelihood: 0.1,
    textDensity: 0.05,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false
  });
  assert.equal(selfiePass.hardBlock, false);
  assert.equal(selfiePass.pendingReview, false);

  const memeText = assessProfilePhoto({
    hasAdequateFace: false,
    logoLikelihood: 0.2,
    textDensity: 0.19,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false
  });
  assert.equal(memeText.hardBlock, false);
  assert.equal(memeText.pendingReview, true);
  assert.ok(memeText.riskFlags.includes("text_heavy"));

  const ninHard = assessProfilePhoto({
    hasAdequateFace: true,
    logoLikelihood: 0.1,
    textDensity: 0.05,
    hasQr: false,
    hasDocumentKeywords: true,
    hasContactLeak: false
  });
  assert.equal(ninHard.hardBlock, true);

  console.log("✓ Profile risk scoring (upload-first)");
}

function testCoverRiskScoring() {
  const landscapePass = assessCoverPhoto({
    textDensity: 0.05,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false,
    hasFlyerText: false
  });
  assert.equal(landscapePass.hardBlock, false);
  assert.equal(landscapePass.pendingReview, false);

  const flyerFail = assessCoverPhoto({
    textDensity: 0.1,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false,
    hasFlyerText: true
  });
  assert.equal(flyerFail.hardBlock, true);

  const textHeavyFail = assessCoverPhoto({
    textDensity: 0.11,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false,
    hasFlyerText: false
  });
  assert.equal(textHeavyFail.hardBlock, true);

  const ninFail = assessCoverPhoto({
    textDensity: 0.04,
    hasQr: false,
    hasDocumentKeywords: true,
    hasContactLeak: false,
    hasFlyerText: false
  });
  assert.equal(ninFail.hardBlock, true);

  console.log("✓ Cover risk scoring (relaxed for scenery)");
}

function testBusinessFlyerKeywords() {
  assert.equal(containsBusinessFlyerText("Arsenal Football Club official"), true);
  assert.equal(containsBusinessFlyerText("Acme Services Limited"), true);
  assert.equal(containsBusinessFlyerText("Follow us @brandname"), true);
  assert.equal(containsBusinessFlyerText("Beach sunset"), false);
  console.log("✓ Business flyer keyword detection");
}

function testRiskThreshold() {
  assert.equal(shouldRejectByRiskScore(59), false);
  assert.equal(shouldRejectByRiskScore(60), true);
  assert.equal(shouldRejectByRiskScore(90), true);
  console.log("✓ Risk threshold at 60");
}

function testPhotoReviewVisibility() {
  const url = "https://example.com/photo.webp";
  const rejectedUrl = "https://example.com/rejected.webp";
  const photos = [url, rejectedUrl];
  const photoMeta = {
    [rejectedUrl]: { photoReviewStatus: "rejected", photoRiskFlags: [], type: "profile", uploadedAt: "" }
  };
  assert.deepEqual(filterPhotosForPublicView(photos, photoMeta), [url]);
  assert.equal(isPhotoCountableForSignup(rejectedUrl, photoMeta), false);
  assert.equal(isPhotoCountableForSignup(url, photoMeta), true);
  console.log("✓ Photo review visibility rules");
}

async function main() {
  testDocumentKeywords();
  testPhoneDetection();
  testUrlDetection();
  testVerificationSelfieAllowsDocuments();
  testFaceAreaThreshold();
  testProfileRiskScoring();
  testCoverRiskScoring();
  testBusinessFlyerKeywords();
  testRiskThreshold();
  testPhotoReviewVisibility();
  console.log("\nAll photo safety pattern checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
