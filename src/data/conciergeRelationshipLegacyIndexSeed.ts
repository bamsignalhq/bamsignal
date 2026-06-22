import type { RelationshipLegacyIndexRecord } from "../types/relationshipLegacyIndex";

const JOURNEY_ID = "BS-JR-2028-0045";
const MEMBER_ID = "sc_member_adaeze";

export const CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED: RelationshipLegacyIndexRecord[] = [
  {
    journeyId: JOURNEY_ID,
    memberId: MEMBER_ID,
    legacyStatus: "active-legacy",
    country: "Nigeria",
    registeredAt: "2031-06-15T00:00:00.000Z",
    updatedAt: "2031-06-15T00:00:00.000Z",
    statusHistory: [
      {
        to: "active-legacy",
        at: "2031-06-15T00:00:00.000Z",
        by: "Ada Okafor"
      }
    ],
    futureLegacy: {
      enabled: false,
      kinds: [
        "silver-anniversaries",
        "golden-anniversaries",
        "legacy-events",
        "couple-celebrations",
        "family-milestones"
      ]
    }
  }
];
