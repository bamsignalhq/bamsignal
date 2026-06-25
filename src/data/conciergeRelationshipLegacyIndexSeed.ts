import type { RelationshipLegacyIndexRecord } from "../types/relationshipLegacyIndex";

const JOURNEY_ID = "BS-JR-2028-0045";
const MEMBER_ID = "sc_member_adaeze";

export const CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED: RelationshipLegacyIndexRecord[] = [
  {
    journeyId: JOURNEY_ID,
    memberId: MEMBER_ID,
    legacyStatus: "legacy-family",
    country: "Nigeria",
    registeredAt: "2031-06-15T00:00:00.000Z",
    updatedAt: "2042-01-15T00:00:00.000Z",
    statusHistory: [
      {
        to: "active-legacy",
        at: "2031-06-15T00:00:00.000Z",
        by: "Ada Okafor"
      },
      {
        from: "active-legacy",
        to: "legacy-family",
        at: "2035-06-01T00:00:00.000Z",
        by: "Ada Okafor"
      }
    ],
    legacyFamily: {
      childrenCount: 2,
      currentCountry: "Canada",
      recordedAt: "2035-06-01T00:00:00.000Z",
      recordedBy: "Ada Okafor",
      history: [
        {
          childrenCount: 1,
          currentCountry: "Canada",
          at: "2035-06-01T00:00:00.000Z",
          by: "Ada Okafor"
        },
        {
          childrenCount: 2,
          currentCountry: "Canada",
          at: "2042-01-15T00:00:00.000Z",
          by: "Ada Okafor"
        }
      ],
      futureFamily: {
        enabled: false,
        kinds: ["family-events", "legacy-celebrations", "child-milestones"]
      }
    },
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
