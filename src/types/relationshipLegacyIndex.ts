import type { LegacyStatusId, LegacyIndexFutureKind } from "../constants/relationshipLegacyIndex";

export type LegacyStatusChange = {
  from?: LegacyStatusId;
  to: LegacyStatusId;
  at: string;
  by?: string;
};

export type RelationshipLegacyFuture = {
  enabled?: boolean;
  kinds?: LegacyIndexFutureKind[];
};

/** Permanent index entry — journey identity never regenerated. */
export type RelationshipLegacyIndexRecord = {
  journeyId: string;
  memberId: string;
  legacyStatus: LegacyStatusId;
  country: string;
  /** Immutable — first registration timestamp. */
  registeredAt: string;
  updatedAt: string;
  statusHistory: LegacyStatusChange[];
  futureLegacy?: RelationshipLegacyFuture;
};
