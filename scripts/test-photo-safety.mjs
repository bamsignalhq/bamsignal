#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  containsDocumentKeywords,
  containsImageUrlLeak,
  containsNigerianPhoneInText,
  scanPhotoSafetyText
} from "../shared/photoSafetyPatterns.mjs";
import {
  classifyCoverRisk,
  classifyProfileRisk,
  containsBusinessFlyerText,
  faceAreaPassesProfileCheck,
  PHOTO_RISK_REJECT_THRESHOLD,
  shouldRejectByRiskScore
} from "../shared/photoQualityScore.mjs";

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
  const mustFail = ["07012345678", "08012345678", "08123456789", "09087654321", "+2348012345678"];
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
    "wa.me/2348012345678"
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
  const logoNoFace = classifyProfileRisk({
    hasAdequateFace: false,
    logoLikelihood: 0.8,
    textDensity: 0.05,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false
  });
  assert.equal(logoNoFace.reject, true);
  assert.equal(logoNoFace.category, "no_face");
  assert.ok(logoNoFace.riskScore >= PHOTO_RISK_REJECT_THRESHOLD);

  const selfiePass = classifyProfileRisk({
    hasAdequateFace: true,
    logoLikelihood: 0.1,
    textDensity: 0.05,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false
  });
  assert.equal(selfiePass.reject, false);

  const memeText = classifyProfileRisk({
    hasAdequateFace: false,
    logoLikelihood: 0.2,
    textDensity: 0.19,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false
  });
  assert.equal(memeText.reject, true);
  assert.equal(memeText.category, "text_heavy");

  console.log("✓ Profile risk scoring");
}

function testCoverRiskScoring() {
  const landscapePass = classifyCoverRisk({
    textDensity: 0.05,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false,
    hasFlyerText: false
  });
  assert.equal(landscapePass.reject, false);

  const carCoverPass = classifyCoverRisk({
    textDensity: 0.08,
    hasQr: false,
    hasDocumentKeywords: false,
    hasContactLeak: false,
    hasFlyerText: false
  });
  assert.equal(carCoverPass.reject, false);

  const flyerFail = classifyCoverRisk({
    textDensity: 0.1,
    hasQr: true,
    hasDocumentKeywords: false,
    hasContactLeak: false,
    hasFlyerText: true
  });
  assert.equal(flyerFail.reject, true);

  const ninFail = classifyCoverRisk({
    textDensity: 0.04,
    hasQr: false,
    hasDocumentKeywords: true,
    hasContactLeak: false,
    hasFlyerText: false
  });
  assert.equal(ninFail.reject, true);
  assert.equal(ninFail.category, "document");

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
  console.log("\nAll photo safety pattern checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
