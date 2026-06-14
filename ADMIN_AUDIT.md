# Admin Audit

**Audit date:** 14 June 2026  
**Entry:** Profile → Admin → `/hard/auth` → `/hard` (`AdminHubPage`)

---

## Access control

| Check | Implementation |
|-------|----------------|
| Route obscurity | `/hard`, `/hard/auth` (legacy `/admin` redirects) |
| Session | `isAdminSessionActive()` + `verifyAdminSession(supabase token)` |
| Unauthorized | Redirect to admin auth |

**Launch requirement:** Admin Supabase role / allowlist must be configured in production.

---

## Tab inventory

| Tab | Purpose | Data source | Status |
|-----|---------|-------------|--------|
| **Command** | Moderation queue, shadow ban | localStorage reports + `MOCK_PROFILES` names | ⚠️ Mock name lookup |
| **Metrics** | DAU, signals, city leaderboard | `analytics.ts` localStorage events | ⚠️ Client-only metrics |
| **Business** | Retention, funnel, safety KPIs | `retentionAnalytics`, `safetyAnalytics` | ⚠️ Client-only |
| **Users** | Browse/export app users | API when DB connected | ✓ if DB live |
| **Reports** | Report list | localStorage | ✓ ops usable |
| **Cities** | City analytics table | Derived from local events | ⚠️ |
| **Discover** | Launch experiments, seeding | `launchConfig`, `AdminSeedingTools` | ✓ |
| **City home** | Featured members per city | `fetchAdminCityMembers` API | ✓ if DB live |
| **Leads** | Waitlist leads | `launchLeads` localStorage | ✓ (form unwired on site) |
| **Verify** | Photo verification queue | localStorage queue | ✓ workflow works |
| **Pricing** | Edit premium plans | API + `AdminPricingPage` | ✓ |
| **Content** | CMS copy editor | localStorage CMS | ✓ |

---

## Required areas (audit checklist)

### Users

- **Present:** Users tab with search/filter when database connected
- **Gap:** No merge with Supabase auth user list if DB dry-run

### Reports

- **Present:** Command + Reports tabs, shadow ban actions
- **Gap:** Reported profile metadata from mock catalog

### Verification

- **Present:** Pending queue, approve/reject with optional reason
- **Works:** `notifyVerificationApproved` on approve

### Pricing

- **Present:** Full plan editor (weekly/monthly/quarterly), persists to platform settings
- **Synced:** Paystack initialize reads `premium_plans`

### Premium

- **Present:** Indirect via pricing + business dashboard revenue counters
- **Gap:** No admin view of individual premium subscribers / expiry dates in hub (may be in Users tab when DB live)

### Referrals

- **Partial:** Business dashboard shows `Referral signups` and `Referral conversion` from analytics events only
- **Missing:** No referral code management, reward grants, or fraud review
- **Blocker:** User referral rewards never increment (`recordSuccessfulReferral` uncalled)

### Safety

- **Present:** Business tab — reports, blocks, contact attempts, flagged/shadow banned counts
- **Present:** Command center moderation queue
- **Gap:** No server-side report export for legal holds

### Analytics

- **Present:** Metrics + Business tabs
- **Limitation:** All counts from client `trackEvent` storage unless DB-backed endpoints added
- **Note:** Admin business dashboard documents intent metadata limitation inline

---

## Seeding & launch tools

- `AdminSeedingTools` — assigns mock discover profiles for demos
- Discover tab — toggle social proof, premium trial experiments via `launchConfig`
- DEV-only: shadow ban demo member button

---

## CMS / content

Editable: hero, welcome copy, notification templates, growth stat **labels/values**, support hours, founding member label (legacy field).

**Fixed in audit:** Default growth stats no longer show fake 4,000+ / 18,000+ figures.

**Legacy fields still in editor:** `quickiePrice`, `quickiePriceLabel` — no live product surface.

---

## Launch blockers (admin)

1. **Metrics reflect local browser data**, not server truth — misleading in multi-device production
2. **Moderation queue names** tied to `MOCK_PROFILES`
3. **Referrals** — analytics only; no admin control of reward fulfillment
4. **Database required** for Users, city home, premium activation audit trail

---

## Non-blockers

- Leads tab works though public waitlist form is not mounted
- Admin tab horizontal scroll on small screens (see Mobile audit)

---

*Admin shell is feature-complete for ops; data fidelity depends on DATABASE_URL and moving analytics to server.*
