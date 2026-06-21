#!/usr/bin/env node
import assert from "node:assert/strict";
import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true },
  logLevel: "error"
});

try {
  const { buildCompatibilityReasons } = await vite.ssrLoadModule(
    "/src/utils/buildCompatibilityReasons.ts"
  );

  const viewer = {
    religion: "Christian",
    intents: ["Relationship"],
    interests: ["Movies", "Travel", "Food"],
    occupation: "Tech",
    lifestyle: "Career focused",
    kidsPreference: "Wants kids",
    ethnicity: "Igbo",
    state: "Lagos",
    city: "Lekki",
    verified: true,
    voiceIntroUrl: "https://example.com/voice.mp3"
  };

  const target = {
    religion: "Christian",
    intents: ["Relationship", "Chat"],
    interests: ["Movies", "Music"],
    occupation: "Tech",
    lifestyle: "Family oriented",
    kidsPreference: "Open to kids",
    ethnicity: "Igbo",
    state: "Lagos",
    city: "Lekki",
    verified: true
  };

  const reasons = buildCompatibilityReasons(viewer, target);

  assert.ok(reasons.length <= 5, "never more than 5 reasons");
  assert.ok(reasons.includes("❤️ Both value faith"), "religion match");
  assert.ok(reasons.includes("💍 Looking for something serious"), "relationship goal match");
  assert.equal(reasons[0], "❤️ Both value faith", "religion has highest priority");
  assert.ok(
    !reasons.some((reason) => /%|compatible|match score|things in common/i.test(reason)),
    "no score labels"
  );

  const sparse = buildCompatibilityReasons({}, {});
  assert.deepEqual(sparse, [], "missing fields return empty array");

  const deduped = buildCompatibilityReasons(
    {
      religion: "Muslim",
      intents: ["Relationship"],
      lifestyle: "Faith centered",
      interests: ["Church community", "Family"]
    },
    {
      religion: "Muslim",
      intents: ["Relationship"],
      lifestyle: "Faith centered",
      interests: ["Mosque hangouts", "Family"],
      kidsPreference: "Wants kids"
    }
  );

  const faithCount = deduped.filter((reason) => reason.includes("faith")).length;
  assert.equal(faithCount, 1, "duplicate faith reasons collapse to one");

  console.log("buildCompatibilityReasons: ok");
} finally {
  await vite.close();
}
