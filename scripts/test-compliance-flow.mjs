/**
 * Smoke tests for compliance server repair import.
 */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { resolveMemberCompliance, isServerComplianceComplete } = await import(
  "../server/services/compliance.js"
);
const { repairMemberFlow } = await import("../server/services/flowRepair.js");

assert(typeof resolveMemberCompliance === "function", "resolveMemberCompliance should export");
assert(typeof isServerComplianceComplete === "function", "isServerComplianceComplete should export");
assert(typeof repairMemberFlow === "function", "repairMemberFlow should export");

const complete = isServerComplianceComplete({
  tosAccepted: true,
  tosVersion: "2026-06-18",
  privacyAccepted: true,
  privacyVersion: "2026-06-18",
  ageConfirmed18: true,
  ageConfirmedAt: "2026-06-18T00:00:00.000Z",
  safetyPledgeAccepted: true,
  safetyPledgeVersion: "2026-06-18",
  safetyPledgeAcceptedAt: "2026-06-18T00:00:00.000Z",
  offlineSafetyAcknowledged: true,
  offlineSafetyVersion: "2026-06-18",
  offlineSafetyAcknowledgedAt: "2026-06-18T00:00:00.000Z"
});
assert(complete, "server compliance complete check");

const incompleteAfterOnboarding = isServerComplianceComplete({
  tosAccepted: true,
  tosVersion: "2026-06-18",
  privacyAccepted: true,
  privacyVersion: "2026-06-18",
  ageConfirmed18: true,
  ageConfirmedAt: "2026-06-18T00:00:00.000Z"
});
assert(!incompleteAfterOnboarding, "legal-only compliance must not count as complete");

console.log("compliance flow tests ok");
