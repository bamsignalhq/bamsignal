# Enterprise Consistency & Technical Debt Audit

**Date:** 2026-06-28  
**Scope:** Configuration, error handling, logging, retries, health, security, performance, dependencies, documentation  
**Constraint:** Audit + surgical P0/P1 consolidation only — no feature changes, no architecture redesign

---

## Executive summary

| Area | Status | Notes |
|------|--------|-------|
| Configuration | Partial | `shared/operationalConstants.mjs` added; many TTL/throttle literals remain local |
| Error handling | Strong | All audited API handlers use unified `{ ok, error, errorCode, requestId }` envelope |
| Logging | Strong | Structured observability with redaction, request IDs, alert debounce |
| Retries/timeouts | Strong | Paystack, Resend, Sendchamp share `withBoundedRetry` + operational constants |
| Health/metrics | Strong | Service Registry backs `/ready`; admin dashboards use authenticated `/ready?details=1` |
| Security | Strong | No hard-coded prod secrets; sanitization tested |
| Performance | Acceptable | `axios` unused; TensorFlow/heic2any dominate bundle |
| Dependencies | 1 unused | `axios` in package.json, zero imports |
| Documentation | Stale | `health-checks.md`, `startup-lifecycle.md` pre-registry (updated this commit) |

---

## 1. Configuration audit

### Duplicated values found

| Category | Locations | Values | Centralized? |
|----------|-----------|--------|--------------|
| Provider HTTP timeout | `paystackClient.js`, `sendchamp.js` | 20s / 15s | Yes |
| Retry backoff | `retryPolicy.js` | 3 attempts, 500ms base, 8s max | Yes |
| Sendchamp retry | `sendchamp.js` | 3 attempts via `withBoundedRetry` | Yes |
| Email OTP TTL | `signupOtp.js`, `pinReset.js`, `accountSecurity.js` | 10 min | Documented only |
| WhatsApp OTP TTL | `sendchamp.js`, `whatsappVerification.js` | 30 min | Partial |
| Pin auth throttle | `pinAuthThrottle.js`, `adminActionPinThrottle.js` | 15 min window | Documented only |
| Remote config cache | `remoteConfig.js`, `configurationPlatform.ts` | 60s | Documented only |
| Member API timeout | `memberData.ts` | 8s | Documented only |

### Action taken

- Created **`shared/operationalConstants.mjs`**
- Wired **`paystackClient.js`**, **`sendchamp.js`**, **`retryPolicy.js`**

---

## 2. Error handling audit

Target shape: `{ ok, error, errorCode, requestId }`

- **33/33** audited `api/` handlers use `sendLoggedApiError` / `sendApiError` (or shared webhook/contact helpers)
- **`errorCode`** standardized on all P1-audited handlers (remote-config, feature-flags, paystack verify/webhook, diagnostics, contact, whatsapp webhook, verify submissions)

---

## 3. Logging audit

**Strengths:** `observability.js` structured JSON, redaction, alert debounce, `test-raw-error-hardening.mjs`

**Gaps:** pin-login debug `console.log` lines in production path

---

## 4. Retry and timeout audit

| Integration | Timeout | Retry |
|-------------|---------|-------|
| Paystack | 20s | 3x exponential via `withBoundedRetry` |
| Sendchamp | 15s | 3x exponential via `withBoundedRetry` (429/5xx + network) |
| Resend email | fetch default | 3x via `withBoundedRetry` |
| Database | pg pool | none |

Sendchamp retries HTTP 429/5xx and transient network errors via shared retry policy.

---

## 5. Health and metrics audit

| Consumer | Source | Aligned? |
|----------|--------|----------|
| `/ready` | Service Registry | Yes |
| `/health` | Liveness | Yes |
| Admin Observability / Platform Health / System Health | `/ready?details=1` (admin bearer) | **Yes** |

**Action:** `src/utils/fetchAdminHealthSnapshot.ts` fetches authenticated registry snapshot from `/ready?details=1`.

---

## 6. Security audit

No P0 issues: no prod secrets in code, diagnostics gated, log redaction tested.

---

## 7. Performance audit

- Unused `axios` (P3)
- Large bundles: heic2any, TensorFlow (P2)
- Admin health fetch deduplicated (P3, done)

---

## 8. Dependency audit

| Package | Status |
|---------|--------|
| `axios` | Unused — remove post-launch |
| All others | Active |

---

## 9. Documentation audit

Updated in this commit: `health-checks.md`, `startup-lifecycle.md`

---

## 10. Technical debt backlog

### P0 — Release blockers

None.

### P1 — Reliability

| ID | Item | Risk | Fix | Effort | When |
|----|------|------|-----|--------|------|
| P1-01 | Admin dashboards fetch `/health` not registry/`/ready` | Ops blind during launch | Admin-authenticated health API | **Fixed** | Done |
| P1-02 | 9 API handlers lack unified error envelope | Support triage harder | Migrate to `sendLoggedApiError` | **Fixed** | Done |
| P1-03 | Sendchamp retry skips HTTP 429/5xx | WhatsApp OTP flakes | Use `withBoundedRetry` | **Fixed** | Done |
| P1-04 | Outdated health-checks doc | Wrong alert config | **Fixed** | — | Done |
| P1-05 | Duplicate firebase health in detailed `/ready` | Noisy diagnostics | Registry-only payload | **Fixed** | Done |

### P2 — Performance

| ID | Item | Fix | Effort |
|----|------|-----|--------|
| P2-01 | heic2any + TensorFlow bundle | Lazy-load tuning | 8h |
| P2-02 | OTP TTL literals in 6+ files | Import operationalConstants | 2h |
| P2-03 | Throttle windows duplicated | Import shared constants | 2h |

### P3 — Maintainability

| ID | Item | Fix |
|----|------|-----|
| P3-01 | Unused axios | Remove dependency |
| P3-02 | errorCode not global | Extend sendApiError |
| P3-03 | Server routes bypass error helper | Wrap concierge/meeting routes |
| P3-04 | pin-login console.log | Remove or gate |
| P3-06 | Observability uses seed queue data | Wire registry snapshots |

### P4 — Nice-to-have

UI animation stagger tokens, OpenTelemetry, Redis cache.

---

## Verification

```bash
npm run test:consistency-audit
npm run test:service-registry
npm run test:server-import
npm run build
```

## Launch recommendation

**GO** — no P0 or P1 consistency blockers remain. Member paths, `/ready` probes, admin dashboards, API errors, and Sendchamp retries are aligned.
