# Phase 3 — Membership, Billing & Commercial Architecture

**Status:** Phase 3A foundation shipped. Phase 3B privacy complete. Phase 3C entitlement capability layer shipped. Phase 3D membership commerce engine shipped (see `phase3d-membership-commerce.md`). Phase 3E remains.

**Date:** 2026-07-19

---

## 1. Final membership architecture

Three **independent** experience products (not upgrades of each other):

| Product | Motivation | Free / entry | Paid |
|---|---|---|---|
| **Discover Membership** | “I want to find someone myself.” | Free: 5 Signals/day, basic Discover/search/messaging | Weekly ₦999 · Monthly ₦2,999 |
| **Discreet Membership** | “I want to date privately.” | N/A (paid experience) | Monthly ₦9,999 |
| **Signal Concierge™** | “I want BamSignal to help me find the right person.” | Consultation fee (admin-priced) | Packages from catalog (₦99,999–₦1M+) |

**Entitlement back-compat:** Discover still activates via `app_users.is_premium` + `premium_until`. Existing Signal Pass / Premium holders are grandfathered until expiry. New sales use Discover naming and new prices. Quarterly is **retired for new sales** (hidden; still matchable for historical payments).

**Routes (canonical):** `/dating` · `/discreet-mode` · `/signal-concierge`  
**Alias:** `/professional-matchmaking` → `/signal-concierge`

---

## 2. Commercial architecture

- **Discover** = self-serve subscription (Paystack init → verify → `premium_until`).
- **Discreet** = separate product type (`discreet`) with catalog pricing; checkout product resolution exists; **enforcement + fulfillment** land in 3B.
- **Concierge** = service business: consultation fee + package catalog + (3D) consultant invoices on journeys.
- Products must never be presented as a single ladder (Basic → Premium → VIP).

---

## 3. Pricing architecture

| Source of truth | Purpose |
|---|---|
| `membership_products` / `membership_plans` | Discover + Discreet plan rows |
| `concierge_packages` | Concierge package CRUD |
| `platform_settings.premium_plans` | Mirror for legacy checkout path |
| `platform_settings.discreet_plans` | Mirror for Discreet |
| `platform_settings.consultation_fee_ngn` | Live consultation fee |
| `platform_settings.subscription_catalog` | Features + visibility + Fast Connection |

**Rule:** No live checkout price may be trusted from the client. Server resolves via `paymentCatalog` / `membershipCatalog`.

Default seeds (migration `0050`): Discover 999/2999; Discreet 9999; Concierge Essential/Signature/Legacy/Global; consultation ₦100,000 (editable).

---

## 4. Admin pricing manager

`/hard/pricing` → `AdminPricingPage` now covers:

- Discover Membership plans + features
- Discreet Membership plan + features
- Signal Concierge packages + consultation fee
- Fast Connection + boosts (unchanged)

API actions on `/api/auth/identity`:

- `pricing` / `pricing-save`
- `subscription-catalog` / `subscription-catalog-save`
- `concierge-packages` / `concierge-packages-save`

---

## 5. Consultant invoicing workflow

**Schema ready** in `0050` (`concierge_invoices`, line items, timeline JSON).

**Workflow (3D):** create/edit invoice → attach notes/docs → send → member Paystack → partial/full payment → receipt → journey update → consultant notify. Invoice numbers unique; payments never deleted; refunds append audit.

**Not shipped in 3A:** invoice UI, Paystack invoice init, consultant console actions.

---

## 6. Dashboard separation review

| Experience | Member shell |
|---|---|
| Discover / Discreet | Discover, Signals, Likes, Messages, Boosts, recommendations |
| Discreet (active) | Same shell + “Discreet Membership Active” + privacy controls (3B) |
| Concierge-active | **Must not** show Discover/Signals/Likes/Boosts/Nearby/Swipe — Concierge journey shell (3E) |

3A does **not** change member nav (UI freeze + avoid breaking Concierge).

---

## 7. UX review (3A scope)

Updated to reduce “feature upgrade” framing:

- Paywall / Premium Center → **Discover Membership** + “find someone myself”
- Homepage Discreet card → **Discreet Membership** intent copy
- Purchase emails → Discover / Discreet naming
- Admin pricing header → experience products

**Remaining UX debt (later):** every residual “Signal Pass” / “Premium” string in settings pills, recommendations registry, marketing seeds; Concierge-only shell; Discreet status badge in member app.

---

## 8. Database schema (0050)

- `membership_products`, `membership_plans`
- `concierge_packages`
- `pricing_promotions` (stub)
- `member_experience_memberships` (stub for multi-experience)
- `concierge_invoices`, `concierge_invoice_line_items`
- `payment_risk_assessments` (stub for 3E)

---

## 9. Billing schema notes

- Discover fulfillment: existing payment fulfillments + `premium_until`
- Discreet: product type `discreet` + `member_experience_memberships` (3B)
- Concierge consultation: existing consultation payment gateway (amount now settings-backed)
- Invoices: append-only status machine on `concierge_invoices`
- Risk: `payment_risk_assessments` decision allow/review/block

---

## 10. Paystack integration review

**Intact:** premium initialize/verify, consultation fee, boosts, Fast Connection.

**3A changes:**

- Discover amounts from catalog (defaults 999/2999)
- New checkout rejects retired quarterly
- Consultation fee amount loaded from `consultation_fee_ngn`
- Discreet product resolution available for initialize when `productType=discreet`

**Still required:** channels for NG + international cards already via Paystack; present methods by context without inventing a second gateway.

---

## 11. Payment risk review

**Today:** HMAC webhook, amount match, init throttle, fortress fulfillments.

**3A:** `payment_risk_assessments` table seeded for logging.

**3E:** multi-signal scoring (IP/geo, VPN, device, account/tx history), block/hold, admin review queue, immutable audit of blocked attempts.

---

## 12. Migration plan

| Phase | Ship |
|---|---|
| **3A (this)** | Schema + seeds; Discover rename + new prices; catalog authority; admin Concierge/Discreet editors; consultation fee from settings |
| **3B** | Discreet entitlement + feed exclusion enforcement (checkout UI deferred) |
| **3C** | Concierge package purchase authority (Paystack for packages, not hardcoded) |
| **3D** | Consultant invoicing end-to-end |
| **3E** | Payment risk engine + Concierge member shell separation |

**Ops:** apply `migrations/0050_experience_membership_billing.sql` on production before relying on table-backed prices (mirrors still work via `platform_settings` defaults).

**Compatibility:** do not break Signal Concierge consultation Paystack; grandfather existing premium_until holders; keep internal id `signal_pass` in catalog for back-compat while display name is Discover Membership.
