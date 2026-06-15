# City Spotlight System Report

**Date:** 2026-06-15  
**Sprint:** BamSignal City Spotlight — featured member discovery  
**Status:** Complete — production build passes

---

## Summary

The homepage “Signals around Nigeria” block is now **City Spotlight**: a featured-member discovery surface showing up to **3 real profiles per city**, with direct **Profile Detail** access, Paystack purchase flow for **City Spotlight (₦500 / 24h)**, intelligent ranking, and admin analytics.

---

## What changed

### Before
- Static city marketing cards + collage photos
- “Send Signal” CTA driving guests to signup
- No monetized featured placement product
- Generic city home API (up to 6 profiles, photo grid)

### After
- **City tabs** → **featured member cards** (name, age, verified, View Profile)
- **Profile Detail sheet** opens on tap (not Discover, not a city page)
- **City Spotlight** boost product: **₦500 · 24 hours**
- **Max 3 profiles** per city on the public section
- **Scored selection** (verification, completeness, activity, paid spotlight, premium)
- **Analytics** pipeline + admin dashboard panel

---

## New section UI

**Location:** Homepage (`LandingPage` → `CitySpotlightSection`)

| Element | Behavior |
|---------|----------|
| Header | City Spotlight · Featured members across Nigeria |
| City pills | Lagos, Abuja, PH, etc. |
| Member card | Photo, name + age, Verified badge, **View Profile** |
| Tap | Opens `ProfileDetailSheet` |
| Send Signal (in sheet) | Tracks `signal` event → guest signup flow |

**Replaced component:** `SignalsAroundNigeria` → `CitySpotlightSection`

---

## City Spotlight product

| Field | Value |
|-------|-------|
| Product ID | `city-spotlight` |
| Name | City Spotlight |
| Price | **₦500** |
| Duration | **24 hours** |
| CTA | Get City Spotlight |

### Purchase flow

1. Member buys via Boost shop / pricing modal (`startBoostPayment`)
2. Paystack metadata: `boost_id: city-spotlight`, `duration_hours: 24`
3. On verify → `activateCitySpotlightPlacement()`:
   - Uses member’s profile city
   - Inserts `placement_type = 'spotlight'` in `city_home_placements`
   - Expires after 24h
   - Records `purchase` analytics event
4. Client `activateBoost('city-spotlight')` for local discover ranking bonus (+95 score)

**Legacy:** `city-boost` (₦600 / 48h) remains for Discover visibility; spotlight is the homepage featured product.

---

## Selection rules (server)

`listCitySpotlightProfiles(city, limit=3)` scores candidates:

| Factor | Weight (approx.) |
|--------|------------------|
| `spotlight` placement (paid) | +120 |
| `featured` | +90 |
| `hot` | +70 |
| `boost` | +55 |
| Verified | +35 |
| Premium (profile flag) | +25 |
| Photos | up to +20 |
| Bio length | +12 |
| Recent activity (3d / 7d) | +18 / +10 |

Returns **top 3** per city. Rotates as scores and `updated_at` change.

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/city/spotlight?city=Lagos&limit=3` | Public featured profiles |
| POST | `/api/city/spotlight-event` | Track view / click / profile_open / signal |
| GET | `/api/admin/city-spotlight?days=30` | Admin analytics (auth required) |

Existing `/api/city/home` unchanged for other consumers.

---

## Database

### Tables used
- `app_member_profiles` — member data
- `city_home_placements` — placement types now include **`spotlight`**
- `city_spotlight_events` — **new** analytics events

### Event types
- `purchase` — Paystack spotlight activation
- `view` — section viewed with profiles
- `click` — card / View Profile clicked
- `profile_open` — detail sheet opened
- `signal` — signal CTA from spotlight profile

---

## Admin

### City Spotlight Analytics (`AdminCitySpotlightPanel`)
On Admin → Business dashboard:

- Purchases (30d)
- Section views
- Card clicks
- Profile opens
- Signals from spotlight
- Views by city table

### City home moderation
Admin Hub → City home: new **Spotlight** button sets `placement_type: spotlight`.

---

## Files added / updated

| File | Role |
|------|------|
| `src/components/visual/CitySpotlightSection.tsx` | **New** homepage section |
| `src/utils/citySpotlight.ts` | Profile mapping, events, admin fetch |
| `api/city/spotlight.js` | Public API |
| `api/city/spotlight-event.js` | Event ingestion |
| `api/admin/city-spotlight.js` | Admin analytics API |
| `server/cityHome.js` | Spotlight placement, scoring, analytics |
| `src/constants/boosts.ts` | `city-spotlight` product |
| `api/paystack/verify.js` | Paystack verify for spotlight |
| `src/components/admin/AdminCitySpotlightPanel.tsx` | Admin UI |
| `src/pages/LandingPage.tsx` | Wire new section |
| `src/data/homeLanding.ts` | Section copy |
| `src/styles/home-landing.css` | Spotlight card styles |

**Legacy (unused on homepage):** `SignalsAroundNigeria.tsx`

---

## Build verification

```
npm run build — PASS
dist/assets/index-BqsOw4Ff.js  293.42 kB │ gzip: 83.81 kB
```

---

## Remaining recommendations

1. **Deploy** — push to `main` for Coolify; run migrations via first request (`ensureCityHomeTables`).
2. **Seed spotlight** — use Admin → City home → **Spotlight** for launch cities until organic purchases grow.
3. **Member home** — optional: reuse `CitySpotlightSection` on authenticated home for cross-sell.
4. **Paystack catalog** — confirm ₦500 `city-spotlight` in Admin Pricing if overrides are used.
5. **A/B** — measure `profile_open` → signup conversion vs. old static section.
6. **Cleanup** — remove `SignalsAroundNigeria.tsx` after one release if unused.

---

## Goal status

| Goal | Status |
|------|--------|
| Real featured profiles, not marketing | Yes |
| Direct profile access | Yes — Profile Detail sheet |
| Monetizable spotlight (₦500 / 24h) | Yes |
| Max 3 per city | Yes |
| Intelligent rotation | Yes — scored query |
| Admin analytics | Yes |
| Discover ranking boost for buyers | Yes — +95 via `city-spotlight` boost |

City Spotlight turns the Nigeria cities block into a **premium, monetizable discovery surface** that showcases real members and drives both connection and revenue.
