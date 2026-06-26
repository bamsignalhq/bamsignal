# Infrastructure

## Production hosting

| Component | Provider | URL / access |
|-----------|----------|--------------|
| Application | Coolify (self-hosted) | https://control.bamsignal.com |
| Public site | Coolify → Docker | https://bamsignal.com |
| Database | Supabase Postgres | Dashboard + `DATABASE_URL` |
| Object storage | Supabase Storage | Profile/cover photos, voice |
| Payments | Paystack | Dashboard + webhooks |
| Email | Resend | Transactional + signup |
| SMS/WhatsApp OTP | SendChamp (optional) | Verification flows |
| Push (optional) | Firebase | `VITE_FIREBASE_*` + service account |
| Source control | GitHub | `github.com/bamsignalhq/bamsignal` |

**Do not use Vercel** — `.vercel/` is legacy.

## Container model

- **Image:** multi-stage `Dockerfile`
  - Builder: `npm run build` + source integrity smoke
  - Runner: `node server/production.js` on port 3000
- **Health:** Docker `HEALTHCHECK` hits `GET /ready` (not `/health` alone).
- **Static assets:** `dist/` served by Express; service worker at `public/sw.js` with `CACHE_VERSION`.

## Network expectations

- TLS terminates at Coolify / reverse proxy.
- `www.bamsignal.com` redirects to apex.
- Paystack webhooks must reach production (`/api/paystack/webhook` and aliases).

## External dependencies (readiness)

`/ready` requires all of:

1. Database connected (`DATABASE_URL`)
2. Paystack secret configured
3. Signup email path (Resend + Supabase service role)
4. Photo storage configured

Until ready, Coolify may mark the container unhealthy — this is intentional.
