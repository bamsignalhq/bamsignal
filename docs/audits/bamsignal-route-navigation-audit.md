# Route & Navigation Integrity Audit™

Generated: 2026-06-25T18:08:32.093Z

## Executive Summary

Static route inventory, navigation map cross-check, permission coverage, lazy-loading verification, and sitemap alignment for BamSignal web routes.

**Inventory total:** 178 registered routes  
**Duplicates:** 1 (1 intentional SEO/support overlap)  
**Unlinked nested admin views:** 7  
**Permission gaps:** 0  
**Lazy exports:** 101  
**Hardcoded route string files (warning):** 23  
**Automated check failures:** 0

## Route Inventory

- **admin**: 59 routes
- **century**: 4 routes
- **concierge**: 7 routes
- **consultant**: 7 routes
- **events**: 8 routes
- **institute**: 56 routes
- **member**: 13 routes
- **public**: 24 routes

### Sample inventory

| Path | Area | Source | Health |
| --- | --- | --- | --- |
| / | public | public-static | healthy |
| /love | public | public-static | healthy |
| /love/login | public | public-static | healthy |
| /love/sign | public | public-static | healthy |
| /blog | public | public-static | healthy |
| /nigeria | public | public-static | healthy |
| /cities | public | public-static | healthy |
| /help | public | public-static | healthy |
| /safety | public | public-static | healthy |
| /features | public | public-static | healthy |
| /premium | public | public-static | healthy |
| /faq | public | public-static | healthy |
| /guides | public | public-static | healthy |
| /compare | public | public-static | healthy |
| /home | member | member-app | healthy |
| /fast-connection | member | member-app | healthy |
| /onboarding | member | member-app | healthy |
| /discover | member | member-app | healthy |
| /chats | member | member-app | healthy |
| /signals | member | member-app | healthy |
| /profile | member | member-app | healthy |
| /voice-vibe | member | member-app | healthy |
| /trusted-member | member | member-app | healthy |
| /saved-profiles | member | member-app | healthy |
| /settings | member | member-app | healthy |
| /subscription | member | member-app | healthy |
| /payment/success | member | member-app | healthy |
| /consultant/crm | consultant | CONSULTANT_ROUTES | healthy |
| /consultant/regions | consultant | CONSULTANT_ROUTES | healthy |
| /consultant/assist | consultant | CONSULTANT_ROUTES | healthy |
| /consultant/portfolio | consultant | CONSULTANT_ROUTES | healthy |
| /consultant/members | consultant | CONSULTANT_ROUTES | healthy |
| /consultant/introductions | consultant | CONSULTANT_ROUTES | healthy |
| /consultant/followups | consultant | CONSULTANT_ROUTES | healthy |
| /signal-concierge/apply | concierge | SIGNAL_CONCIERGE_ROUTES | healthy |
| /signal-concierge/status | concierge | SIGNAL_CONCIERGE_ROUTES | healthy |
| /signal-concierge/dashboard | concierge | SIGNAL_CONCIERGE_ROUTES | healthy |
| /signal-concierge/consultation | concierge | SIGNAL_CONCIERGE_ROUTES | healthy |
| /signal-concierge/share-your-story | concierge | SIGNAL_CONCIERGE_ROUTES | healthy |
| /signal-concierge/privacy | concierge | SIGNAL_CONCIERGE_ROUTES | healthy |


Full live inventory: `/hard/audit/routes` (Route & Navigation Audit™ admin view).

## Broken Routes

No unreachable registered routes detected in static analysis.


## Duplicate Routes

| Path | Status | Sources |
| --- | --- | --- |
| /help | Intentional overlap | public:public-static, public:SUPPORT_CENTER_ROUTES |


## Missing Navigation Entries

Nested admin workspaces reachable by URL but not listed in `ADMIN_NAV_SECTIONS`:

| Path | Label | Recommendation |
| --- | --- | --- |
| /hard/concierge/operations | Operations Center | Add sub-nav or cross-link from parent tab |
| /hard/concierge/intelligence | Journey Intelligence | Add sub-nav or cross-link from parent tab |
| /hard/audit/routes | Route & Navigation Audit | Add sub-nav or cross-link from parent tab |
| /hard/audit/database | Database Audit | Add sub-nav or cross-link from parent tab |
| /hard/audit/security | Permissions Audit | Add sub-nav or cross-link from parent tab |
| /hard/audit/journeys | Journey Integrity Audit | Add sub-nav or cross-link from parent tab |
| /hard/data-integrity | Data Integrity | Add sub-nav or cross-link from parent tab |


## Permission Mismatches

| Check | Result |
| --- | --- |
| `HARD_ROUTE_PERMISSIONS` tab coverage | All admin tab paths covered |
| `RequirePermission` wrapper on AdminHub | Missing |
| Consultant login public | Expected — local PIN session |
| Member routes gated | `requiresMemberRestoreBlocking` + `MemberRouteGuard` |

Known permission warnings tracked in Permissions Audit™ (`/hard/audit/security`).

## Lazy Loading

| Check | Status |
| --- | --- |
| `lazyRoutes.ts` exports | 101 lazy modules |
| App imports resolve | Pass |
| Admin console | Lazy |
| Consultant portal | Lazy |
| Public marketing shell | Lazy |

## Sitemap Inclusion

Public indexable route families are generated via `scripts/generate-sitemap.mjs` during `npm run build`.

### Sitemap gaps (non-auth public paths)

- /signal-concierge/privacy (SIGNAL_CONCIERGE_ROUTES)
- /signal-concierge/faq (SIGNAL_CONCIERGE_ROUTES)


Member (`/home`, `/discover`, etc.) and admin (`/hard/*`) routes are intentionally excluded from `sitemap.xml`.

## Route Constants Usage

Route constants live under `src/constants/*Routes.ts` and are consumed by `src/utils/routeAudit.ts` inventory builders.

Hardcoded route strings outside constants: **23 files** (acceptable in pages/components when paired with matchers — migrate opportunistically).

## Recommendations

1. Add sub-navigation or breadcrumbs for nested admin views (Operations Center, Journey Intelligence, Route & Navigation Audit, Database Audit, Permissions Audit, Journey Integrity Audit, Data Integrity).
2. Cross-link finance surfaces (`/hard/business`, `/hard/finance`, `/hard/executive`) per navigation simplification guidance.
3. Unify Support Center discoverability for `/help`, `/contact`, `/tickets`, and SEO hub overlap.
4. Keep institute route density grouped under fewer nav clusters — 60+ institute paths are registered.
5. Re-run `npm run audit:routes` after adding routes; update `src/utils/routeAudit.ts` inventory when introducing new route families.

## Commands

```bash
npm run build
npm run test:server-import
npm run audit:routes
```
