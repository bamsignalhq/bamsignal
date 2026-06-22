import { COUPLE_HAPPINESS_NOTE_EXAMPLES } from "../constants/coupleHappinessNotes";
import type { CoupleHappinessNotesRecord } from "../types/coupleHappinessNotes";
import { createCoupleHappinessNoteEntry } from "../utils/coupleHappinessNotesLogic";

const JOURNEY_ID = "BS-JR-2028-0045";

const recordedAtBase = "2028-08-01T10:00:00.000Z";

export const COUPLE_HAPPINESS_NOTES_SEED: CoupleHappinessNotesRecord[] = [
  {
    journeyId: JOURNEY_ID,
    updatedAt: recordedAtBase,
    notes: COUPLE_HAPPINESS_NOTE_EXAMPLES.map((body, index) =>
      createCoupleHappinessNoteEntry({
        id: `chn_seed_${index + 1}`,
        journeyId: JOURNEY_ID,
        body,
        recordedBy: "Ada Okafor",
        recordedAt: new Date(
          Date.parse(recordedAtBase) - index * 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      })
    ),
    futureReady: {
      aiSummaries: false,
      anniversaryBooks: false,
      legacyMemories: false
    }
  }
];
