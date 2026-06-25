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

/** Tables from migrations/0005_workforce_management.sql */
export const WORKFORCE_SCHEMA_TABLES = [
  "workforce_profiles",
  "workforce_availability",
  "consultant_capacity",
  "consultant_assignments",
  "regional_assignments",
  "leave_requests",
  "workforce_transfers",
  "workforce_metrics",
  "staffing_forecasts"
] as const;

/** Tables from migrations/0006_institutional_governance.sql */
export const GOVERNANCE_SCHEMA_TABLES = [
  "governance_roles",
  "governance_permissions",
  "governance_role_permissions",
  "governance_assignments",
  "approval_requests",
  "approval_steps",
  "approval_history",
  "delegations",
  "executive_decisions",
  "policy_acknowledgements",
  "authority_matrix",
  "institutional_policies"
] as const;

/** Tables from migrations/0007_business_continuity.sql */
export const BUSINESS_CONTINUITY_SCHEMA_TABLES = [
  "incident_reports",
  "recovery_plans",
  "backup_jobs",
  "system_health_snapshots",
  "provider_status",
  "continuity_exercises"
] as const;

/** Tables from migrations/0008_finance_operations.sql */
export const FINANCE_OPERATIONS_SCHEMA_TABLES = [
  "financial_transactions",
  "refund_requests",
  "refund_approvals",
  "consultant_payouts",
  "operating_expenses",
  "financial_reports",
  "reconciliation_logs"
] as const;

/** Tables from migrations/0010_consultant_quality.sql */
export const CONSULTANT_QUALITY_SCHEMA_TABLES = [
  "consultant_reviews",
  "consultant_certifications",
  "quality_assessments",
  "consultation_reviews",
  "coaching_sessions",
  "improvement_plans"
] as const;

/** Tables from migrations/0009_document_center.sql */
export const DOCUMENT_CENTER_SCHEMA_TABLES = [
  "documents",
  "document_versions",
  "document_categories",
  "document_acknowledgements",
  "policy_versions",
  "knowledge_articles"
] as const;

/** Tables from migrations/0011_configuration_platform.sql */
export const CONFIGURATION_PLATFORM_SCHEMA_TABLES = [
  "configuration_entries",
  "configuration_versions",
  "feature_flags",
  "configuration_approvals",
  "configuration_snapshots"
] as const;

/** Tables from migrations/0012_monitoring_center.sql */
export const MONITORING_CENTER_SCHEMA_TABLES = [
  "monitoring_services",
  "service_health_snapshots",
  "monitoring_incidents",
  "monitoring_alerts",
  "maintenance_windows",
  "metric_snapshots"
] as const;

/** Tables from migrations/0013_data_governance_center.sql */
export const DATA_GOVERNANCE_CENTER_SCHEMA_TABLES = [
  "data_inventory_items",
  "retention_policies",
  "privacy_requests",
  "consent_records",
  "regional_policies",
  "sensitive_data_registers"
] as const;

/** Tables from migrations/0014_api_platform.sql */
export const API_PLATFORM_SCHEMA_TABLES = [
  "api_catalog_entries",
  "api_clients",
  "api_keys",
  "api_webhooks",
  "api_rate_limits",
  "api_usage_snapshots"
] as const;

/** Tables from migrations/0015_disaster_recovery_center.sql */
export const RECOVERY_CENTER_SCHEMA_TABLES = [
  "recovery_backup_records",
  "recovery_restore_history",
  "recovery_playbook_records",
  "recovery_test_runs",
  "recovery_critical_systems",
  "recovery_dependency_links"
] as const;

/** Tables from migrations/0016_launch_control_center.sql */
export const LAUNCH_CONTROL_CENTER_SCHEMA_TABLES = [
  "launch_readiness_items",
  "launch_checklist_entries",
  "launch_blockers",
  "launch_risks",
  "launch_dependencies",
  "launch_timeline_events"
] as const;

/** Tables from migrations/0017_performance_center.sql */
export const PERFORMANCE_CENTER_SCHEMA_TABLES = [
  "performance_metric_snapshots",
  "performance_api_profiles",
  "performance_database_profiles",
  "performance_capacity_plans",
  "performance_optimization_items",
  "performance_growth_forecasts"
] as const;

/** Tables from migrations/0018_workflow_engine.sql */
export const WORKFLOW_ENGINE_SCHEMA_TABLES = [
  "workflow_definitions",
  "workflow_triggers",
  "workflow_actions",
  "workflow_run_history",
  "workflow_step_logs",
  "workflow_automation_snapshots"
] as const;

/** Tables from migrations/0019_reporting_center.sql */
export const REPORTING_CENTER_SCHEMA_TABLES = [
  "reporting_catalog_entries",
  "reporting_schedules",
  "reporting_export_history",
  "reporting_filter_presets",
  "reporting_run_history",
  "reporting_snapshots"
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
  },
  {
    tableName: "workforce_profiles",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["workforce_profiles_consultant_id_idx", "workforce_profiles_region_id_idx"],
    constraints: ["uuid primary key", "created_at", "updated_at", "created_by", "updated_by"],
    defaultHealth: "needs-migration",
    note: "Operational Capacity & Workforce Management™ profiles"
  },
  {
    tableName: "workforce_availability",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["workforce_availability_profile_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "consultant_capacity",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["consultant_capacity_profile_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "consultant_assignments",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["consultant_assignments_profile_idx", "consultant_assignments_journey_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "regional_assignments",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["regional_assignments_primary_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "leave_requests",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["leave_requests_profile_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "workforce_transfers",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["workforce_transfers_from_idx", "workforce_transfers_to_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "workforce_metrics",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["workforce_metrics_key_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "staffing_forecasts",
    migrationRef: "0005_workforce_management.sql",
    domainIds: ["consultants"],
    inRequiredSchema: false,
    indexes: ["staffing_forecasts_region_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "governance_roles",
    migrationRef: "0006_institutional_governance.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["governance_roles_parent_idx"],
    constraints: ["uuid primary key", "slug unique"],
    defaultHealth: "needs-migration",
    note: "Institutional Governance System™ — constitutional authority layer"
  },
  {
    tableName: "governance_permissions",
    migrationRef: "0006_institutional_governance.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["governance_permissions_module_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "governance_assignments",
    migrationRef: "0006_institutional_governance.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["governance_assignments_email_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "approval_requests",
    migrationRef: "0006_institutional_governance.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["approval_requests_status_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "delegations",
    migrationRef: "0006_institutional_governance.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["delegations_delegate_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "executive_decisions",
    migrationRef: "0006_institutional_governance.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: [],
    constraints: ["uuid primary key", "decision_ref unique", "append only"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "institutional_policies",
    migrationRef: "0006_institutional_governance.sql",
    domainIds: ["documents"],
    inRequiredSchema: false,
    indexes: [],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "incident_reports",
    migrationRef: "0007_business_continuity.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["incident_reports_status_idx"],
    constraints: ["uuid primary key", "incident_ref unique"],
    defaultHealth: "needs-migration",
    note: "Business Continuity & DR Center™ — incident tracking"
  },
  {
    tableName: "recovery_plans",
    migrationRef: "0007_business_continuity.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["recovery_plans_domain_idx"],
    constraints: ["uuid primary key", "slug unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "backup_jobs",
    migrationRef: "0007_business_continuity.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["backup_jobs_area_idx"],
    constraints: ["uuid primary key", "job_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "system_health_snapshots",
    migrationRef: "0007_business_continuity.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["system_health_snapshots_at_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "provider_status",
    migrationRef: "0007_business_continuity.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["provider_status_provider_idx"],
    constraints: ["uuid primary key", "provider_id unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "continuity_exercises",
    migrationRef: "0007_business_continuity.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["continuity_exercises_scheduled_idx"],
    constraints: ["uuid primary key", "exercise_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "financial_transactions",
    migrationRef: "0008_finance_operations.sql",
    domainIds: ["finance", "payments"],
    inRequiredSchema: false,
    indexes: ["financial_transactions_category_idx"],
    constraints: ["uuid primary key", "transaction_ref unique"],
    defaultHealth: "needs-migration",
    note: "Finance Operations Center™ — institutional transaction ledger"
  },
  {
    tableName: "refund_requests",
    migrationRef: "0008_finance_operations.sql",
    domainIds: ["finance"],
    inRequiredSchema: false,
    indexes: ["refund_requests_status_idx"],
    constraints: ["uuid primary key", "refund_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "refund_approvals",
    migrationRef: "0008_finance_operations.sql",
    domainIds: ["finance"],
    inRequiredSchema: false,
    indexes: ["refund_approvals_request_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "consultant_payouts",
    migrationRef: "0008_finance_operations.sql",
    domainIds: ["finance", "consultants"],
    inRequiredSchema: false,
    indexes: ["consultant_payouts_status_idx"],
    constraints: ["uuid primary key", "payout_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "operating_expenses",
    migrationRef: "0008_finance_operations.sql",
    domainIds: ["finance"],
    inRequiredSchema: false,
    indexes: ["operating_expenses_incurred_idx"],
    constraints: ["uuid primary key", "expense_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "financial_reports",
    migrationRef: "0008_finance_operations.sql",
    domainIds: ["finance"],
    inRequiredSchema: false,
    indexes: ["financial_reports_period_idx"],
    constraints: ["uuid primary key", "report_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "reconciliation_logs",
    migrationRef: "0008_finance_operations.sql",
    domainIds: ["finance", "payments"],
    inRequiredSchema: false,
    indexes: ["reconciliation_logs_type_idx"],
    constraints: ["uuid primary key", "reconciliation_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "documents",
    migrationRef: "0009_document_center.sql",
    domainIds: ["documents"],
    inRequiredSchema: false,
    indexes: ["documents_category_idx", "documents_status_idx"],
    constraints: ["uuid primary key", "slug unique"],
    defaultHealth: "needs-migration",
    note: "Institutional Policy & Documentation Center™"
  },
  {
    tableName: "document_versions",
    migrationRef: "0009_document_center.sql",
    domainIds: ["documents"],
    inRequiredSchema: false,
    indexes: ["document_versions_doc_idx"],
    constraints: ["uuid primary key", "document_id + version unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "document_acknowledgements",
    migrationRef: "0009_document_center.sql",
    domainIds: ["documents"],
    inRequiredSchema: false,
    indexes: ["document_acknowledgements_doc_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "policy_versions",
    migrationRef: "0009_document_center.sql",
    domainIds: ["documents"],
    inRequiredSchema: false,
    indexes: ["policy_versions_slug_idx"],
    constraints: ["uuid primary key", "policy_slug + version unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "knowledge_articles",
    migrationRef: "0009_document_center.sql",
    domainIds: ["documents"],
    inRequiredSchema: false,
    indexes: ["knowledge_articles_search_idx"],
    constraints: ["uuid primary key", "slug unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "consultant_reviews",
    migrationRef: "0010_consultant_quality.sql",
    domainIds: ["qa", "consultants"],
    inRequiredSchema: false,
    indexes: ["consultant_reviews_consultant_idx"],
    constraints: ["uuid primary key", "review_ref unique"],
    defaultHealth: "needs-migration",
    note: "Consultant Quality, Standards & Certification™"
  },
  {
    tableName: "consultant_certifications",
    migrationRef: "0010_consultant_quality.sql",
    domainIds: ["qa", "consultants"],
    inRequiredSchema: false,
    indexes: ["consultant_certifications_active_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "quality_assessments",
    migrationRef: "0010_consultant_quality.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["quality_assessments_consultant_idx"],
    constraints: ["uuid primary key", "assessment_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "consultation_reviews",
    migrationRef: "0010_consultant_quality.sql",
    domainIds: ["qa", "consultants"],
    inRequiredSchema: false,
    indexes: ["consultation_reviews_journey_idx"],
    constraints: ["uuid primary key", "review_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "coaching_sessions",
    migrationRef: "0010_consultant_quality.sql",
    domainIds: ["qa", "consultants", "academy"],
    inRequiredSchema: false,
    indexes: ["coaching_sessions_consultant_idx"],
    constraints: ["uuid primary key", "session_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "improvement_plans",
    migrationRef: "0010_consultant_quality.sql",
    domainIds: ["qa", "consultants"],
    inRequiredSchema: false,
    indexes: ["improvement_plans_consultant_idx"],
    constraints: ["uuid primary key", "plan_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "configuration_entries",
    migrationRef: "0011_configuration_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["configuration_entries_category_idx"],
    constraints: ["uuid primary key", "config_key unique"],
    defaultHealth: "needs-migration",
    note: "Enterprise Configuration Platform™"
  },
  {
    tableName: "configuration_versions",
    migrationRef: "0011_configuration_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["configuration_versions_entry_idx"],
    constraints: ["uuid primary key", "entry_id + version_number unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "feature_flags",
    migrationRef: "0011_configuration_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["feature_flags_category_idx"],
    constraints: ["uuid primary key", "flag_key unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "configuration_approvals",
    migrationRef: "0011_configuration_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["configuration_approvals_status_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "configuration_snapshots",
    migrationRef: "0011_configuration_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["configuration_snapshots_created_idx"],
    constraints: ["uuid primary key", "snapshot_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "monitoring_services",
    migrationRef: "0012_monitoring_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["monitoring_services_section_idx"],
    constraints: ["uuid primary key", "service_id unique"],
    defaultHealth: "needs-migration",
    note: "Enterprise Monitoring & Incident Center™"
  },
  {
    tableName: "service_health_snapshots",
    migrationRef: "0012_monitoring_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["service_health_snapshots_service_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "monitoring_incidents",
    migrationRef: "0012_monitoring_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["monitoring_incidents_status_idx"],
    constraints: ["uuid primary key", "incident_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "monitoring_alerts",
    migrationRef: "0012_monitoring_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["monitoring_alerts_status_idx"],
    constraints: ["uuid primary key", "alert_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "maintenance_windows",
    migrationRef: "0012_monitoring_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["maintenance_windows_schedule_idx"],
    constraints: ["uuid primary key", "window_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "metric_snapshots",
    migrationRef: "0012_monitoring_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["metric_snapshots_key_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "data_inventory_items",
    migrationRef: "0013_data_governance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["data_inventory_items_class_idx"],
    constraints: ["uuid primary key", "inventory_ref unique"],
    defaultHealth: "needs-migration",
    note: "Data Governance, Privacy & Retention Center™"
  },
  {
    tableName: "retention_policies",
    migrationRef: "0013_data_governance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["retention_policies_category_idx"],
    constraints: ["uuid primary key", "policy_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "privacy_requests",
    migrationRef: "0013_data_governance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["privacy_requests_status_idx"],
    constraints: ["uuid primary key", "request_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "consent_records",
    migrationRef: "0013_data_governance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["consent_records_member_idx"],
    constraints: ["uuid primary key", "consent_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "regional_policies",
    migrationRef: "0013_data_governance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["regional_policies_region_idx"],
    constraints: ["uuid primary key", "policy_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "sensitive_data_registers",
    migrationRef: "0013_data_governance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["sensitive_data_registers_class_idx"],
    constraints: ["uuid primary key", "register_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "api_catalog_entries",
    migrationRef: "0014_api_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["api_catalog_entries_domain_idx"],
    constraints: ["uuid primary key", "catalog_ref unique"],
    defaultHealth: "needs-migration",
    note: "Institutional API Platform™"
  },
  {
    tableName: "api_clients",
    migrationRef: "0014_api_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["api_clients_active_idx"],
    constraints: ["uuid primary key", "client_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "api_keys",
    migrationRef: "0014_api_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["api_keys_client_idx"],
    constraints: ["uuid primary key", "key_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "api_webhooks",
    migrationRef: "0014_api_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["api_webhooks_provider_idx"],
    constraints: ["uuid primary key", "webhook_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "api_rate_limits",
    migrationRef: "0014_api_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["api_rate_limits_active_idx"],
    constraints: ["uuid primary key", "limit_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "api_usage_snapshots",
    migrationRef: "0014_api_platform.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["api_usage_snapshots_domain_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "recovery_backup_records",
    migrationRef: "0015_disaster_recovery_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["recovery_backup_records_category_idx"],
    constraints: ["uuid primary key", "backup_ref unique"],
    defaultHealth: "needs-migration",
    note: "Business Continuity & Disaster Recovery Center™"
  },
  {
    tableName: "recovery_restore_history",
    migrationRef: "0015_disaster_recovery_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["recovery_restore_history_status_idx"],
    constraints: ["uuid primary key", "restore_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "recovery_playbook_records",
    migrationRef: "0015_disaster_recovery_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["recovery_playbook_records_playbook_idx"],
    constraints: ["uuid primary key", "playbook_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "recovery_test_runs",
    migrationRef: "0015_disaster_recovery_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["recovery_test_runs_playbook_idx"],
    constraints: ["uuid primary key", "test_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "recovery_critical_systems",
    migrationRef: "0015_disaster_recovery_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["recovery_critical_systems_tier_idx"],
    constraints: ["uuid primary key", "system_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "recovery_dependency_links",
    migrationRef: "0015_disaster_recovery_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["recovery_dependency_links_critical_idx"],
    constraints: ["uuid primary key", "link_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "launch_readiness_items",
    migrationRef: "0016_launch_control_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["launch_readiness_items_domain_idx"],
    constraints: ["uuid primary key", "readiness_ref unique"],
    defaultHealth: "needs-migration",
    note: "Institutional Launch Control Center™"
  },
  {
    tableName: "launch_checklist_entries",
    migrationRef: "0016_launch_control_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["launch_checklist_entries_status_idx"],
    constraints: ["uuid primary key", "checklist_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "launch_blockers",
    migrationRef: "0016_launch_control_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["launch_blockers_status_idx"],
    constraints: ["uuid primary key", "blocker_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "launch_risks",
    migrationRef: "0016_launch_control_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["launch_risks_status_idx"],
    constraints: ["uuid primary key", "risk_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "launch_dependencies",
    migrationRef: "0016_launch_control_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["launch_dependencies_critical_idx"],
    constraints: ["uuid primary key", "dependency_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "launch_timeline_events",
    migrationRef: "0016_launch_control_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["launch_timeline_events_schedule_idx"],
    constraints: ["uuid primary key", "event_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "performance_metric_snapshots",
    migrationRef: "0017_performance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["performance_metric_snapshots_section_idx"],
    constraints: ["uuid primary key", "metric_ref unique"],
    defaultHealth: "needs-migration",
    note: "Performance, Capacity & Scalability Center™"
  },
  {
    tableName: "performance_api_profiles",
    migrationRef: "0017_performance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["performance_api_profiles_p95_idx"],
    constraints: ["uuid primary key", "endpoint_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "performance_database_profiles",
    migrationRef: "0017_performance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["performance_database_profiles_status_idx"],
    constraints: ["uuid primary key", "profile_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "performance_capacity_plans",
    migrationRef: "0017_performance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["performance_capacity_plans_section_idx"],
    constraints: ["uuid primary key", "plan_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "performance_optimization_items",
    migrationRef: "0017_performance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["performance_optimization_items_status_idx"],
    constraints: ["uuid primary key", "item_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "performance_growth_forecasts",
    migrationRef: "0017_performance_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["performance_growth_forecasts_period_idx"],
    constraints: ["uuid primary key", "forecast_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "workflow_definitions",
    migrationRef: "0018_workflow_engine.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["workflow_definitions_status_idx"],
    constraints: ["uuid primary key", "workflow_ref unique"],
    defaultHealth: "needs-migration",
    note: "Automation & Workflow Engine™"
  },
  {
    tableName: "workflow_triggers",
    migrationRef: "0018_workflow_engine.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["workflow_triggers_workflow_idx"],
    constraints: ["uuid primary key", "trigger_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "workflow_actions",
    migrationRef: "0018_workflow_engine.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["workflow_actions_workflow_idx"],
    constraints: ["uuid primary key", "action_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "workflow_run_history",
    migrationRef: "0018_workflow_engine.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["workflow_run_history_started_idx"],
    constraints: ["uuid primary key", "history_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "workflow_step_logs",
    migrationRef: "0018_workflow_engine.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["workflow_step_logs_run_idx"],
    constraints: ["uuid primary key"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "workflow_automation_snapshots",
    migrationRef: "0018_workflow_engine.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["workflow_automation_snapshots_created_idx"],
    constraints: ["uuid primary key", "snapshot_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "reporting_catalog_entries",
    migrationRef: "0019_reporting_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["reporting_catalog_entries_category_idx"],
    constraints: ["uuid primary key", "report_ref unique"],
    defaultHealth: "needs-migration",
    note: "Institutional Reporting Center™"
  },
  {
    tableName: "reporting_schedules",
    migrationRef: "0019_reporting_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["reporting_schedules_next_run_idx"],
    constraints: ["uuid primary key", "schedule_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "reporting_export_history",
    migrationRef: "0019_reporting_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["reporting_export_history_exported_idx"],
    constraints: ["uuid primary key", "export_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "reporting_filter_presets",
    migrationRef: "0019_reporting_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["reporting_filter_presets_category_idx"],
    constraints: ["uuid primary key", "preset_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "reporting_run_history",
    migrationRef: "0019_reporting_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["reporting_run_history_generated_idx"],
    constraints: ["uuid primary key", "run_ref unique"],
    defaultHealth: "needs-migration"
  },
  {
    tableName: "reporting_snapshots",
    migrationRef: "0019_reporting_center.sql",
    domainIds: ["qa"],
    inRequiredSchema: false,
    indexes: ["reporting_snapshots_created_idx"],
    constraints: ["uuid primary key", "snapshot_ref unique"],
    defaultHealth: "needs-migration"
  }
];

const ADMIN_LOCAL_STORAGE_MANIFEST: Omit<LocalStorageDependency, "id" | "health">[] = [
  {
    storageKey: "bamsignal.documentCenter.v3",
    domainId: "documents",
    engine: "documentCenterEngine.ts",
    expectedTable: "documents",
    note: "Institutional Policy & Documentation Center™ — dual-write via documentCenter.js"
  },
  {
    storageKey: "bamsignal.configurationPlatform.v1",
    domainId: "qa",
    engine: "configurationPlatformEngine.ts",
    expectedTable: "configuration_entries",
    note: "Institutional Configuration Center™ — dual-write via configurationPlatform.js"
  },
  {
    storageKey: "bamsignal.monitoringCenter.v1",
    domainId: "qa",
    engine: "monitoringCenterEngine.ts",
    expectedTable: "monitoring_services",
    note: "Enterprise Monitoring & Incident Center™ — dual-write via monitoringCenter.js"
  },
  {
    storageKey: "bamsignal.dataGovernanceCenter.v1",
    domainId: "qa",
    engine: "dataGovernanceCenterEngine.ts",
    expectedTable: "data_inventory_items",
    note: "Data Governance, Privacy & Retention Center™ — dual-write via dataGovernanceCenter.js"
  },
  {
    storageKey: "bamsignal.apiPlatform.v1",
    domainId: "qa",
    engine: "apiPlatformEngine.ts",
    expectedTable: "api_catalog_entries",
    note: "Institutional API Platform™ — dual-write via apiPlatform.js"
  },
  {
    storageKey: "bamsignal.recoveryCenter.v2",
    domainId: "qa",
    engine: "recoveryCenterEngine.ts",
    expectedTable: "recovery_backup_records",
    note: "Business Continuity & Disaster Recovery Center™ — dual-write via recoveryCenter.js"
  },
  {
    storageKey: "bamsignal.launchControlCenter.v1",
    domainId: "qa",
    engine: "launchControlCenterEngine.ts",
    expectedTable: "launch_readiness_items",
    note: "Institutional Launch Control Center™ — dual-write via launchControlCenter.js"
  },
  {
    storageKey: "bamsignal.performanceCenter.v1",
    domainId: "qa",
    engine: "performanceCenterEngine.ts",
    expectedTable: "performance_metric_snapshots",
    note: "Performance, Capacity & Scalability Center™ — dual-write via performanceCenter.js"
  },
  {
    storageKey: "bamsignal.workflowEngine.v1",
    domainId: "qa",
    engine: "workflowEngineEngine.ts",
    expectedTable: "workflow_definitions",
    note: "Automation & Workflow Engine™ — dual-write via workflowEngine.js"
  },
  {
    storageKey: "bamsignal.reportingCenter.v1",
    domainId: "qa",
    engine: "reportingCenterEngine.ts",
    expectedTable: "reporting_catalog_entries",
    note: "Institutional Reporting Center™ — dual-write via reportingCenter.js"
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
    storageKey: "bamsignal.consultantQuality.v3",
    domainId: "qa",
    engine: "consultantQualityEngine.ts",
    expectedTable: "consultant_reviews",
    note: "Consultant Quality, Standards & Certification™ — dual-write via consultantQuality.js"
  },
  {
    storageKey: "bamsignal.financeOperations.v1",
    domainId: "finance",
    engine: "financeOperationsEngine.ts",
    expectedTable: "financial_transactions",
    note: "Finance Operations Center™ — institutional finance governance via financeOperations.js"
  },
  {
    storageKey: "bamsignal.workforceManagement.v1",
    domainId: "consultants",
    engine: "workforceManagementEngine.ts",
    expectedTable: "workforce_profiles",
    note: "Workforce admin layer — dual-write to workforce_* tables via workforceManagement.js"
  },
  {
    storageKey: "bamsignal.institutionalGovernance.v1",
    domainId: "qa",
    engine: "governanceEngine.ts",
    expectedTable: "governance_roles",
    note: "Institutional Governance System™ — constitutional permission source of truth"
  },
  {
    storageKey: "bamsignal.businessContinuity.v1",
    domainId: "qa",
    engine: "businessContinuityEngine.ts",
    expectedTable: "incident_reports",
    note: "Business Continuity & DR Center™ — dual-write to continuity tables via businessContinuity.js"
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
