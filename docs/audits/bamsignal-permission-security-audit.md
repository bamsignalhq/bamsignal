# Permission & Security Audit™

Generated: 2026-06-25T02:01:36.333Z

## Executive Summary

Static RBAC verification across 10 institution roles, 38 enforced admin routes, and guard coverage for route, component, consultant, and API access.

**Role permission map:** 10 roles  
**Enforced /hard routes:** 38  
**Critical risks:** 2  
**Warnings:** 6  
**RequirePermission usages:** 1  
**PermissionGate usages:** 0  
**ConsultantCapabilityGate usages:** 1  
**Automated check failures:** 0

Live audit: `/hard/audit/security` (Permissions Audit™ admin view).

## Permission Matrix

Rows = institution roles. Columns = verification areas (Secure / Warning / Critical from role manifest).

| Role | Route access | API access | Dashboard access | Document access | Finance access | Support access | Safety access | Audit access |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Admin | Warning | Warning | Warning | Warning | Warning | Warning | Warning | Warning |
| Executive | Critical | Secure | Critical | Warning | Warning | Secure | Secure | Warning |
| Operations | Warning | Warning | Warning | Warning | Warning | Warning | Warning | Warning |
| Consultant | Warning | Warning | Warning | Secure | Secure | Secure | Secure | Secure |
| Senior Matchmaker | Warning | Warning | Warning | Secure | Secure | Secure | Secure | Secure |
| Compatibility Specialist | Warning | Warning | Warning | Secure | Secure | Secure | Secure | Secure |
| Family Values Advisor | Warning | Warning | Warning | Secure | Secure | Secure | Secure | Secure |
| Diaspora Consultant | Warning | Warning | Warning | Secure | Secure | Secure | Secure | Secure |
| Support | Warning | Warning | Warning | Secure | Secure | Warning | Secure | Secure |
| Research | Warning | Secure | Warning | Warning | Secure | Secure | Secure | Secure |


### Role permission counts

| Role | Permissions | Sample |
| --- | --- | --- |
| Admin | 20 | ViewMembers, EditMembers, AssignConsultants, ManageConsultants, ManagePayments… |
| Executive | 5 | ViewMembers, ViewFinance, ViewExecutiveDashboard, ViewArchives, ViewResearch |
| Operations | 16 | ViewMembers, EditMembers, AssignConsultants, ManageConsultants, ManageScheduling… |
| Consultant | 4 | ViewMembers, ManageIntroductions, ManageFollowUps, ManageScheduling |
| Senior Matchmaker | 4 | ViewMembers, ManageIntroductions, ManageFollowUps, ViewArchives |
| Compatibility Specialist | 2 | ViewMembers, ManageIntroductions |
| Family Values Advisor | 2 | ViewMembers, ManageFollowUps |
| Diaspora Consultant | 3 | ViewMembers, ManageIntroductions, ManageFollowUps |
| Support | 3 | ViewMembers, ManageSupport, ManageNotifications |
| Research | 3 | ViewMembers, ViewResearch, ViewArchives |


## Unauthorized Access Risks

| Severity | Issue | Affected roles | Summary |
| --- | --- | --- | --- |
| CRITICAL | CRON_SECRET bypasses admin auth | API / super-admin | server/adminAuth.js requireAdmin accepts x-bamsignal-secret matching CRON_SECRET — grants full admin API access without operator session. |
| CRITICAL | Consultant portal uses shared local PIN | Consultant family | consultantSession.ts authenticates with a fixed demo PIN (2468) and localStorage — not per-consultant Supabase credentials. |
| WARNING | Executive and Finance dashboards overlap | Executive, Admin, Operations | Executive Dashboard and Finance Operations both expose revenue — ViewFinance shared across Executive, Admin, and Operations roles. |
| WARNING | Consultant capabilities not enforced on all routes | Senior Matchmaker, Diaspora Consultant, Family Values Advisor | ConsultantCapabilityGate covers workspace pages but route-level capability isolation for /consultant/members and /consultant/regions is partial. |
| WARNING | Senior Matchmaker and Diaspora Consultant overlap | Senior Matchmaker, Diaspora Consultant | Both roles reach global/legacy member surfaces — capability matrix does not isolate diaspora-only vs legacy-only paths. |
| WARNING | super-admin maps to Admin role permissions | Admin, super-admin | normalizeOperatorRole maps super-admin to Admin — no distinct super-admin permission boundary on client. |
| WARNING | Operations role spans finance, safety, documents, and support | Operations | Operations RolePermissions includes ManageSafety, ManageDocuments, ManageSupport, ManageCareers — broad operational surface without sub-role isolation. |
| WARNING | PermissionGate component not used in admin pages | All admin operators | RequirePermission wraps AdminHub at route level; sensitive sub-sections within tabs lack PermissionGate component guards. |


## Missing Guards

- PermissionGate not applied to admin tab sub-sections (finance actions, user purge, audit exports)
- Server admin APIs use requireAdmin allowlist — operator RolePermissions not enforced server-side on all endpoints
- Consultant /consultant/regions not uniformly wrapped in ConsultantCapabilityGate
- No dedicated Research or Support role gate on /hard/support beyond ManageSupport permission


## Over-Permissioned Areas

- Admin — 20 permissions (full ALL_PERMISSIONS)
- Operations — ManageSafety, ManageDocuments, ManageSupport, ManageCareers without sub-role scoping
- Executive — ViewFinance grants /hard/business access alongside executive dashboard
- Consultant family — shared local PIN grants any directory consultant the same session model


## Guard & Redirect Coverage

| Guard | Status | Notes |
| --- | --- | --- |
| RequirePermission (route) | Active | AdminHubPage wraps full console |
| PermissionGate (component) | Not used | Sub-section guards within admin tabs |
| UnauthorizedPage redirect | Active | Denied operators return to /hard/command |
| AdminCommandDock filter | Active | Nav items hidden by role |
| ConsultantRouteGuard | Active | Consultant portal session gate |
| ConsultantCapabilityGate | 1 usages | Consultant workspace sub-section gates |
| MemberRouteGuard | Active | Member app session gate |


## Isolation Verification

| Check | Result |
| --- | --- |
| Consultant separation | Pass — consultant routes separate from /hard and member shells |
| Executive isolation | Partial — executive has finance visibility but not payment management |
| Operations isolation | Partial — operations lacks executive dashboard permission but shares many admin surfaces |
| Member data isolation | Review needed |


## Route Access Registry

All 38 paths in `ENFORCED_HARD_ROUTE_PATHS` are mapped in `HARD_ROUTE_PERMISSIONS` (23 literal keys, 15 const refs).

RequirePermission resolves permissions via `permissionsForHardPath` — longest matching /hard path wins.

## API & Data Access

| Surface | Enforcement |
| --- | --- |
| Admin APIs | `requireAdmin` — Supabase session + email allowlist, or CRON_SECRET header |
| Member APIs | PIN session + member auth middleware |
| Consultant APIs | No dedicated consultant API auth — persistence API is admin-only |
| Operator role source | `admin_users.role` via admin-session identity endpoint |
| Sensitive exposure | Generic 401 on admin auth failure — no email enumeration |

## Recommendations

1. Replace consultant local PIN with per-consultant Supabase credentials before production scale.
2. Scope CRON_SECRET bypass to cron-only endpoints or require signed job tokens.
3. Apply PermissionGate to destructive admin actions (user purge, finance refunds, audit exports).
4. Add server-side RolePermissions checks on admin mutation APIs — do not rely on client RequirePermission alone.
5. Split executive finance visibility from operations payment management with distinct permissions.
6. Enforce ConsultantCapabilityGate on all consultant workspace routes including regions and members.
7. Re-run `npm run audit:permissions` when RolePermissions or HARD_ROUTE_PERMISSIONS change.

## Commands

```bash
npm run build
npm run test:server-import
npm run audit:permissions
```
