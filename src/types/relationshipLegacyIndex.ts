import type { LegacyFamilyFutureKind, LegacyStatusId, LegacyIndexFutureKind } from "../constants/relationshipLegacyIndex";

export type LegacyStatusChange = {
  from?: LegacyStatusId;
  to: LegacyStatusId;
  at: string;
  by?: string;
};

/** Append-only family metadata — counts and country only, never child names. */
export type LegacyFamilyChange = {
  childrenCount: number;
  currentCountry: string;
  at: string;
  by?: string;
};

export type LegacyFamilyProfile = {
  childrenCount: number;
  currentCountry: string;
  recordedAt: string;
  recordedBy?: string;
  /** Append-only — children count never decreases. */
  history: LegacyFamilyChange[];
  /** Reserved — family events and celebrations, not implemented. */
  futureFamily?: {
    enabled?: boolean;
    kinds?: LegacyFamilyFutureKind[];
  };
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
  /** Country at legacy registration — preserved, not overwritten. */
  country: string;
  /** Immutable — first registration timestamp. */
  registeredAt: string;
  updatedAt: string;
  statusHistory: LegacyStatusChange[];
  /** Legacy Families™ — milestone-only family metadata when couples have children. */
  legacyFamily?: LegacyFamilyProfile;
  futureLegacy?: RelationshipLegacyFuture;
};
