# Launch Infrastructure Report

Generated from the Launch Infrastructure Verification™ registry (`src/constants/launchInfrastructure.ts`).  
**Dashboard:** `/hard/launch-infrastructure`  
**Verify:** `npm run test:launch-infrastructure` · `npm run test:android-app-links` · `npm run seo:validate`

---

## Summary

| Status | Count | Meaning |
|--------|-------|---------|
| **Ready** | 17 | Artifact verified in repo and served correctly |
| **Warning** | 2 | Expected gaps — proxy compression, Apple Team ID placeholder |
| **Critical** | 0 | No blocking infrastructure failures |

**Overall:** Ready with warnings — Coolify/Docker is canonical deploy; iOS Universal Links need real Apple Team ID before App Store verify.

---

## Ready

| Artifact | Status | Notes |
|----------|--------|-------|
| **Docker** | Ready | Multi-stage build, `HEALTHCHECK` on `/ready`, smoke import in image |
| **Vercel** | Ready | `vercel.json` marked legacy — Coolify is production |
| **Supabase** | Ready | `migrations/` + `supabase/migrations`; runtime via `DATABASE_URL` |
| **Build Scripts** | Ready | `npm run build` → sitemap, cache version, tsc, vite |
| **Sitemap** | Ready | `generate-sitemap.mjs` + Signal Concierge public paths |
| **Robots** | Ready | Member/admin/consultant paths disallowed |
| **Manifest** | Ready | `start_url` `/`, `scope` `/`, icons 192+512 |
| **Icons** | Ready | `public/icons/icon-192.webp`, `icon-512.webp` |
| **Favicons** | Ready | `favicon.webp` + `apple-touch-icon.webp` in `index.html` |
| **PWA** | Ready | Standalone manifest, theme-color, apple-mobile-web-app meta |
| **Caching** | Ready | Immutable `/assets/*`; HTML no-cache; SW cache bump on build |
| **Headers** | Ready | `securityHeadersMiddleware` on all responses |
| **SEO** | Ready | `npm run seo:validate`; canonical + og tags |
| **Deep Links** | Ready | `com.bamsignal.com://payment-success` + `https://bamsignal.com/payment/success` |
| **App Links** | Ready | Android `autoVerify` intent filter for `/payment/success` |
| **Asset Links** | Ready | `assetlinks.json` with `com.bamsignal.com` SHA-256 fingerprint |
| **Service Worker** | Ready | Network-only navigations; stale cache purge on activate |

### Key files

| File | Purpose |
|------|---------|
| `Dockerfile` | Production image — VITE build args only, runtime secrets at start |
| `public/sitemap.xml` | Generated — public SEO routes only |
| `public/robots.txt` | Generated — disallows member/admin paths |
| `public/manifest.webmanifest` | PWA install surface |
| `public/.well-known/assetlinks.json` | Android App Links verification |
| `public/.well-known/apple-app-site-association` | iOS Universal Links |
| `public/sw.js` | Service worker — cache version synced on build |
| `server/app.js` | Serves `.well-known` from `dist/` |

---

## Warning

| Artifact | Status | Action |
|----------|--------|--------|
| **Compression** | Warning | Gzip/Brotli at Coolify reverse proxy — not duplicated in Express (by design) |
| **Apple Association** | Warning | Replace `TEAMID` in `apple-app-site-association` `appIDs` with Apple Developer Team ID |

### Apple Team ID

Current AASA entry:

```json
"appIDs": ["TEAMID.com.bamsignal.app"]
```

Replace `TEAMID` with your 10-character Apple Developer Team ID before submitting iOS for Universal Links verification. iOS entitlements already include `applinks:bamsignal.com`.

---

## Critical

No critical infrastructure failures at code level.

---

## Fixes applied (this pass)

1. Added `apple-app-site-association` for iOS Universal Links (`/payment/success*`)
2. Express serves `/.well-known/apple-app-site-association` and `assetlinks.json` from dist
3. iOS associated-domains entitlement: `applinks:bamsignal.com`
4. Sitemap includes `/signal-concierge/privacy` and `/signal-concierge/faq`
5. `robots.txt` disallows `/consultant` and `/subscription`
6. `manifest.webmanifest` `start_url` and `scope` set to `/`
7. `vercel.json` marked legacy — Coolify/Docker is canonical deploy

---

## Verification commands

```bash
npm run build
npm run test:launch-infrastructure
npm run test:android-app-links
npm run test:server-import
npm run seo:validate
```
