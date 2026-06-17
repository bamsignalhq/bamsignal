#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  containsDocumentKeywords,
  containsImageUrlLeak,
  containsNigerianPhoneInText,
  scanPhotoSafetyText
} from "../shared/photoSafetyPatterns.mjs";

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

async function main() {
  testDocumentKeywords();
  testPhoneDetection();
  testUrlDetection();
  testVerificationSelfieAllowsDocuments();
  console.log("\nAll photo safety pattern checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
