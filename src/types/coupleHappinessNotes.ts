import type {
  CoupleHappinessNoteSource,
  CoupleHappinessVisibility
} from "../constants/coupleHappinessNotes";

export type CoupleHappinessNoteEntry = {
  id: string;
  journeyId: string;
  body: string;
  recordedAt: string;
  recordedBy?: string;
  visibility: CoupleHappinessVisibility;
  source: CoupleHappinessNoteSource;
};

export type CoupleHappinessNotesRecord = {
  journeyId: string;
  notes: CoupleHappinessNoteEntry[];
  updatedAt: string;
  futureReady?: {
    aiSummaries: false;
    anniversaryBooks: false;
    legacyMemories: false;
  };
};

export type AddCoupleHappinessNoteInput = {
  journeyId: string;
  body: string;
  recordedBy?: string;
};
