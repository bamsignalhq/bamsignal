import type { DatabaseDomainId, DatabaseHealthStatusId } from "../constants/databaseAudit";
import type { DatabaseTableRecord, LocalStorageDependency } from "../types/databaseAudit";

/** Tables from migrations/0002_baseline_bamsignal_schema.sql — verified at server startup. */
export const BASELINE_SCHEMA_TABLES = [
  "admin_users",
  "api_rate_events",
  "app_chat_threads",
  "app_fast_connection_daily",
  "app_matches",
  "app_member_profiles",
  "app_messages",
  "app_profile_follows",
  "app_profile_likes",
  "app_referral_events",
  "app_reports",
  "app_signals",
  "app_users",
  "audit_logs",
  "city_home_placements",
  "city_spotlight_events",
  "connection_notes",
  "contact_exchange_events",
  "contact_exchange_requests",
  "contact_leak_attempts",
  "email_verification_codes",
  "login_2fa_codes",
  "member_introductions",
  "moderation_audit_log",
  "moderation_flags",
  "payment_events",
  "payment_fulfillments",
  "payment_initialize_rate_events",
  "photo_reviews",
  "pin_auth_attempts",
  "pin_reset_codes",
  "platform_audit_log",
  "platform_settings",
  "saved_profiles",
  "signup_provisioning_attempts",
  "spam_message_fingerprints",
  "subscription_events",
  "success_stories",
  "user_compliance_acknowledgements",
  "verification_submissions",
  "whatsapp_verification_codes"
] as const;

/** Tables from migrations/0004_signal_concierge_persistence.sql — not yet in REQUIRED_SCHEMA_TABLES. */
export const CONCIERGE_SCHEMA_TABLES = [
  "concierge_consultants",
  "concierge_members",
  "concierge_consultation_payments",
  "concierge_consultations",
  "concierge_meeting_notes",
  "concierge_introductions",
  "concierge_followups",
  "concierge_archives",
  "concierge_legacy_profiles",
  "concierge_success_story_consents",
  "concierge_notifications",
  "concierge_relationship_health_alerts"
] as const;

type TableManifest = {
  tableName: string;
  migrationRef: string;
  domainIds: DatabaseDomainId[];
  inRequiredSchema: boolean;
  indexes: string[];
  constraints: string[];
  defaultHealth: DatabaseHealthStatusId;
  note?: string;
};

const TABLE_MANIFEST: TableManifest[] = [
  {
    tableName: "concierge_consultants",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: [],
    constraints: ["id primary key"],
    defaultHealth: "needs-migration",
    note: "Migration exists; not in server REQUIRED_SCHEMA_TABLES verify list"
  },
  {
    tableName: "concierge_members",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["members"],
    inRequiredSchema: false,
    indexes: ["concierge_members_journey_id_idx (unique)"],
    constraints: ["journey_id format check", "journey_id immutable trigger"],
    defaultHealth: "partial",
    note: "Server persistence active via conciergePersistence.js; client stores remain"
  },
  {
    tableName: "concierge_introductions",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["introductions"],
    inRequiredSchema: false,
    indexes: ["concierge_introductions_introduction_id_idx (unique)", "concierge_introductions_member_idx"],
    constraints: ["introduction_id immutable trigger", "no delete trigger"],
    defaultHealth: "partial"
  },
  {
    tableName: "concierge_followups",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["follow-ups"],
    inRequiredSchema: false,
    indexes: ["concierge_followups_member_idx"],
    constraints: ["no delete trigger"],
    defaultHealth: "partial"
  },
  {
    tableName: "concierge_archives",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["archives"],
    inRequiredSchema: false,
    indexes: [],
    constraints: ["journey_id primary key", "no delete trigger"],
    defaultHealth: "partial"
  },
  {
    tableName: "concierge_legacy_profiles",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["legacy"],
    inRequiredSchema: false,
    indexes: [],
    constraints: ["journey_id primary key", "no delete trigger"],
    defaultHealth: "partial"
  },
  {
    tableName: "concierge_consultation_payments",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["payments"],
    inRequiredSchema: false,
    indexes: ["concierge_consultation_payments_member_idx"],
    constraints: ["payment_id format check", "payment_id immutable trigger"],
    defaultHealth: "partial"
  },
  {
    tableName: "payment_events",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["payments"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "healthy"
  },
  {
    tableName: "payment_fulfillments",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["payments", "finance"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "healthy"
  },
  {
    tableName: "concierge_notifications",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["notifications"],
    inRequiredSchema: false,
    indexes: ["concierge_notifications_notification_id_idx (unique)"],
    constraints: ["notification_id format check", "no delete trigger"],
    defaultHealth: "partial"
  },
  {
    tableName: "app_users",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["members"],
    inRequiredSchema: true,
    indexes: ["app_users_user_key_idx", "app_users_email_unique_idx", "app_users_phone_unique_idx"],
    constraints: [],
    defaultHealth: "healthy"
  },
  {
    tableName: "app_member_profiles",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["members"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "healthy"
  },
  {
    tableName: "member_introductions",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["introductions"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "partial",
    note: "Member-app introductions — parallel to concierge_introductions"
  },
  {
    tableName: "success_stories",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["legacy"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "partial",
    note: "Member success stories — parallel to concierge_success_story_consents"
  },
  {
    tableName: "concierge_success_story_consents",
    migrationRef: "0004_signal_concierge_persistence.sql",
    domainIds: ["legacy"],
    inRequiredSchema: false,
    indexes: ["journey_id unique"],
    constraints: ["no delete trigger"],
    defaultHealth: "partial"
  },
  {
    tableName: "audit_logs",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["qa"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "partial",
    note: "Overlaps platform_audit_log and moderation_audit_log"
  },
  {
    tableName: "platform_audit_log",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["qa"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "partial",
    note: "Overlaps audit_logs"
  },
  {
    tableName: "moderation_audit_log",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["qa", "safety"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "partial"
  },
  {
    tableName: "verification_submissions",
    migrationRef: "0002_baseline_bamsignal_schema.sql",
    domainIds: ["qa"],
    inRequiredSchema: true,
    indexes: [],
    constraints: [],
    defaultHealth: "healthy"
  }
];

const ADMIN_LOCAL_STORAGE_MANIFEST: Omit<LocalStorageDependency, "id" | "health">[] = [
  {
    storageKey: "bamsignal.documentCenter.v1",
    domainId: "documents",
    engine: "documentCenterEngine.ts",
    expectedTable: null,
    note: "Admin Document Center™ — no Postgres table yet"
  },
  {
    storageKey: "bamsignal.supportCenter.v1",
    domainId: "support",
    engine: "supportCenterEngine.ts",
    expectedTable: null,
    note: "Support Center admin layer — member tickets use server APIs"
  },
  {
    storageKey: "bamsignal.safetyCenter.v1",
    domainId: "safety",
    engine: "safetyCenterEngine.ts",
    expectedTable: null,
    note: "Crisis & Safety Center™ — incidents not persisted to dedicated table"
  },
  {
    storageKey: "bamsignal.talentRecruiting.v1",
    domainId: "careers",
    engine: "talentRecruitingEngine.ts",
    expectedTable: null,
    note: "Talent / careers admin — public careers routes only"
  },
  {
    storageKey: "bamsignal.consultantAcademy.v1",
    domainId: "academy",
    engine: "consultantAcademyEngine.ts",
    expectedTable: null,
    note: "Consultant Academy™ modules — localStorage only"
  },
  {
    storageKey: "bamsignal.consultantQuality.v1",
    domainId: "qa",
    engine: "consultantQualityEngine.ts",
    expectedTable: null,
    note: "Quality Assurance™ reviews — localStorage only"
  },
  {
    storageKey: "bamsignal.financeOperations.v1",
    domainId: "finance",
    engine: "financeOperationsEngine.ts",
    expectedTable: "payment_fulfillments",
    note: "Finance ops layer mirrors Paystack — partial overlap with payment tables"
  },
  {
    storageKey: "bamsignal.auditCenter.v1",
    domainId: "qa",
    engine: "auditCenterEngine.ts",
    expectedTable: "audit_logs",
    note: "Append-only audit UI — should converge on platform_audit_log"
  },
  {
    storageKey: "bamsignal.internalMessaging.v1",
    domainId: "notifications",
    engine: "internalMessagingEngine.ts",
    expectedTable: null,
    note: "Internal Messaging™ — not notification delivery table"
  },
  {
    storageKey: "bamsignal-concierge-journey-registry",
    domainId: "members",
    engine: "conciergeConsultantStore.ts",
    expectedTable: "concierge_members",
    note: "Dual-write migration in progress"
  },
  {
    storageKey: "bamsignal-concierge-introduction-registry",
    domainId: "introductions",
    engine: "conciergeIntroductionStore.ts",
    expectedTable: "concierge_introductions",
    note: "Dual-write migration in progress"
  },
  {
    storageKey: "bamsignal-concierge-journey-archive",
    domainId: "archives",
    engine: "conciergeJourneyArchive.ts",
    expectedTable: "concierge_archives",
    note: "Dual-write migration in progress"
  },
  {
    storageKey: "bamsignal-concierge-relationship-legacy-index",
    domainId: "legacy",
    engine: "relationshipLegacyIndexStore.ts",
    expectedTable: "concierge_legacy_profiles",
    note: "Dual-write migration in progress"
  },
  {
    storageKey: "bamsignal-concierge-notification-store",
    domainId: "notifications",
    engine: "SignalConciergeNotificationEngine.ts",
    expectedTable: "concierge_notifications",
    note: "Dual-write migration in progress"
  },
  {
    storageKey: "bamsignal-concierge-consultation-payment-store",
    domainId: "payments",
    engine: "ConsultationPaymentEngine.ts",
    expectedTable: "concierge_consultation_payments",
    note: "Dual-write migration in progress"
  }
];

const DUPLICATE_TABLE_GROUPS: string[][] = [
  ["audit_logs", "platform_audit_log", "moderation_audit_log"],
  ["member_introductions", "concierge_introductions"],
  ["success_stories", "concierge_success_story_consents"]
];

export function buildDatabaseTableInventory(): DatabaseTableRecord[] {
  const records = TABLE_MANIFEST.map((item) => ({
    id: `table-${item.tableName}`,
    tableName: item.tableName,
    migrationRef: item.migrationRef,
    domainIds: item.domainIds,
    inRequiredSchema: item.inRequiredSchema,
    health: item.defaultHealth,
    indexes: item.indexes,
    constraints: item.constraints,
    note: item.note ?? null
  }));

  for (const tableName of CONCIERGE_SCHEMA_TABLES) {
    if (records.some((record) => record.tableName === tableName)) continue;
    records.push({
      id: `table-${tableName}`,
      tableName,
      migrationRef: "0004_signal_concierge_persistence.sql",
      domainIds: ["members"],
      inRequiredSchema: false,
      health: "needs-migration",
      indexes: [],
      constraints: ["no delete trigger"],
      note: "Concierge table not mapped in audit manifest — review domain assignment"
    });
  }

  return records.sort((left, right) => left.tableName.localeCompare(right.tableName));
}

export function buildLocalStorageDependencies(): LocalStorageDependency[] {
  return ADMIN_LOCAL_STORAGE_MANIFEST.map((item) => {
    let health: DatabaseHealthStatusId = "legacy-dependency";
    if (item.expectedTable) {
      health = "partial";
    }
    if (!item.expectedTable) {
      health = "needs-migration";
    }

    return {
      id: `dep-${item.storageKey}`,
      ...item,
      health
    };
  }).sort((left, right) => left.storageKey.localeCompare(right.storageKey));
}

export function getDuplicateTableGroups(): string[][] {
  return DUPLICATE_TABLE_GROUPS.map((group) => [...group]);
}

export function getAllKnownTables(): string[] {
  return [...new Set([...BASELINE_SCHEMA_TABLES, ...CONCIERGE_SCHEMA_TABLES, "schema_migrations"])].sort();
}

export function getUnmappedBaselineTables(mappedTableNames: Set<string>): string[] {
  return BASELINE_SCHEMA_TABLES.filter((tableName) => !mappedTableNames.has(tableName));
}
