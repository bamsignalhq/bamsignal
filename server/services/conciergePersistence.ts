/** Signal Concierge™ — Supabase persistence types. */

export type ConciergePersistenceStatus = {
  ready: boolean;
  database: string;
  memberCount: number;
  consultantCount: number;
  bootstrapped: boolean;
};

export type ConciergePersistenceBootstrapPayload = {
  consultants?: Record<string, unknown>[];
  members?: Record<string, unknown>[];
  consultationPayments?: Record<string, unknown>[];
  consultations?: Record<string, unknown>[];
  meetingNotes?: Record<string, unknown>[];
  introductions?: Record<string, unknown>[];
  followups?: Record<string, unknown>[];
  archives?: Record<string, unknown>[];
  legacyProfiles?: Record<string, unknown>[];
  successStoryConsents?: Record<string, unknown>[];
  notifications?: Record<string, unknown>[];
  relationshipHealthAlerts?: Record<string, unknown>[];
};

export type ConciergeTimelineAppendInput = {
  table:
    | "members"
    | "consultation_payments"
    | "consultations"
    | "meeting_notes"
    | "introductions"
    | "followups"
    | "archives"
    | "success_story_consents"
    | "notifications"
    | "relationship_health_alerts";
  recordId: string;
  entry: Record<string, unknown>;
};

export type ConciergePersistenceUpsertResult = {
  ok: boolean;
  memberId?: string;
  journeyId?: string;
  error?: string;
};
