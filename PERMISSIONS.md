# Permissions

BamSignal uses a **role + permission** model for admin (`/hard`) and consultant access. Member routes use username + PIN session — separate from operator permissions.

---

## Key files

| File | Role |
|------|------|
| `src/constants/permissions.ts` | Roles, permissions, tab guards, enforced paths |
| `src/utils/governancePermissionEngine.ts` | Role → permission matrix |
| `src/components/admin/adminConsoleNav.ts` | `HardTab` definitions |
| `src/constants/hardRoutes.ts` | Tab slug → `/hard/*` path |
| `src/utils/adminSession.ts` | Operator session, route guards |
| `scripts/audit-permissions.mjs` | Permission registry audit |

---

## Roles

```
Admin, Executive, Operations, Consultant,
Senior Matchmaker, Compatibility Specialist,
Family Values Advisor, Diaspora Consultant,
Support, Research
```

Normalized via `normalizeOperatorRole()` — accepts DB aliases like `admin`, `operations`.

---

## Permissions (complete list)

Defined in `PERMISSIONS` constant:

| Category | Permissions |
|----------|-------------|
| Members | `ViewMembers`, `EditMembers`, `DeleteMembers` |
| Journeys | `AssignConsultants`, `TransferJourney`, `ApproveJourney` |
| Consultants | `ManageConsultants` |
| Payments | `ManagePayments`, `ApproveRefund`, `IssueRefund` |
| Operations | `ManageScheduling`, `ManageNotifications`, `ManageIntroductions`, `ManageFollowUps`, `ManageOperations`, `ManageCrm` |
| Archives | `ViewArchives`, `ManageArchives`, `ManageLegacy`, `ManageSuccessStories` |
| Finance | `ViewFinance`, `ManageFinance` |
| Research | `ViewResearch`, `PublishResearch` |
| Executive | `ViewExecutiveDashboard`, `ManageExecutiveReports` |
| Governance | `ManageGovernance`, `ManageCompliance`, `ViewAuditLogs`, `ExportReports` |
| Platform | `ManageSupport`, `ManageSafety`, `ManageDocuments`, `ManagePolicies`, `ManageCareers`, `ManageEvents`, `ManageInstitute`, `ManageCommunity`, `ManageMessaging`, `ManageConsultantQa`, `SystemAdministration`, `ManageRecovery` |

---

## Hard tab permissions

Each `HardTab` maps to one or more permissions in `HARD_TAB_PERMISSIONS`:

| Tab | Permission(s) |
|-----|---------------|
| `command` | `ManageOperations` |
| `users` | `ViewMembers` |
| `concierge` | `ManageConsultants` |
| `finance` | `ViewFinance` |
| `securitydashboard` | `ManageOperations`, `ManageSafety`, `SystemAdministration` |
| `launchcertification` | `ManageOperations`, `SystemAdministration`, `ViewExecutiveDashboard` |
| `enterprisecleanup` | `ManageOperations` |
| `configuration` | `SystemAdministration` |
| `recovery` | `ManageRecovery` |
| … | See `permissions.ts` for full map |

**Path enforcement:** `ENFORCED_HARD_ROUTE_PATHS` lists every protected `/hard/*` path for audits.

---

## Concierge sub-views

| View | Path | Permission |
|------|------|------------|
| `dashboard` | `/hard/concierge` | `ManageConsultants` |
| `operations-center` | `/hard/concierge/operations` | `ManageOperations` |
| `journey-intelligence` | `/hard/concierge/intelligence` | `ViewResearch` |

---

## Audit sub-views

| View | Path | Permission |
|------|------|------------|
| `compliance` | `/hard/audit` | `ViewArchives` |
| `routes` | `/hard/audit/routes` | `ViewArchives` |
| `database` | `/hard/audit/database` | `ManageOperations` |
| `security` | `/hard/audit/security` | `ViewArchives` |
| `journeys` | `/hard/audit/journeys` | `ViewArchives` |

---

## Authorization flow

1. Operator signs in at `/hard/auth` (Supabase/admin credentials).
2. `adminSession.ts` validates email against `admin_users` / allowlist.
3. Role resolved → `RolePermissions[role]` permission set.
4. `AdminHubPage` checks tab permission before rendering lazy tab.
5. Destructive saves require `COMMAND_CENTER_PIN` (server-validated).

**Important:** `localStorage` session keys are for UX only — never trust client storage for authorization.

---

## Member vs operator

| Surface | Auth |
|---------|------|
| Member app | Username + PIN → `/api/auth/pin-login` |
| Admin `/hard` | Operator email + password + PIN for destructive actions |
| Diagnostics | `x-diagnostics-secret` or `CRON_SECRET` header |
| Cron jobs | `CRON_SECRET` header only (no query string) |

---

## Auditing

```bash
npm run audit:permissions   # audit-permissions.mjs + test:permissions-audit + test:permissions
```

Permission audit UI: `/hard/audit/security` (`PermissionsAuditPage`).

---

## Related documents

- [SECURITY.md](./SECURITY.md)
- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- [CONSULTANT_WORKFLOW.md](./CONSULTANT_WORKFLOW.md)
