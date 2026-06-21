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
    intents: ["SeriousRelationship"],
    interests: ["movies", "travel", "foodLover"],
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
    intents: ["SeriousRelationship", "MeaningfulConversations"],
    interests: ["movies", "music"],
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
  assert.ok(reasons.includes("🎬 Movie lovers"), "shared More About Me — movies");
  assert.ok(reasons.includes("❤️ Both want something serious"), "shared relationship intent");
  assert.ok(reasons.includes("❤️ Both value faith"), "religion match");
  assert.equal(reasons[0], "🎬 Movie lovers", "More About Me ranks first");
  assert.ok(
    !reasons.some((reason) => /%|compatible|match score|things in common/i.test(reason)),
    "no score labels"
  );

  const sparse = buildCompatibilityReasons({}, {});
  assert.deepEqual(sparse, [], "missing fields return empty array");

  const deduped = buildCompatibilityReasons(
    {
      religion: "Muslim",
      intents: ["SeriousRelationship"],
      lifestyle: "Faith centered",
      interests: ["faith", "familyOriented"]
    },
    {
      religion: "Muslim",
      intents: ["SeriousRelationship"],
      lifestyle: "Faith centered",
      interests: ["faith", "familyOriented"],
      kidsPreference: "Wants kids"
    }
  );

  const faithCount = deduped.filter((reason) => reason.includes("faith")).length;
  assert.equal(faithCount, 1, "duplicate faith reasons collapse to one");

  const familyCount = deduped.filter((reason) => reason.includes("Family")).length;
  assert.equal(familyCount, 1, "family-oriented reasons collapse to one key");

  console.log("buildCompatibilityReasons: ok");
} finally {
  await vite.close();
}
