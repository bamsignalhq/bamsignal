# Architecture Overview

BamSignal is a Nigerian-first social discovery platform delivered as a **single deployable unit**: a Vite-built React SPA plus an Express API in one Docker container.

## High-level diagram

```
Members / Public web ──► https://bamsignal.com
                              │
                    ┌─────────┴─────────┐
                    │  Express (Node)   │
                    │  server/app.js    │
                    ├─────────┬─────────┤
                    │  SPA    │  API    │
                    │  dist/  │ /api/*  │
                    └────┬────┴────┬────┘
                         │         │
              PostgreSQL (Supabase) │ Paystack, Resend, SendChamp, Firebase
```

## Core layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Public marketing | `src/pages`, SEO routes | Homepage, blog, cities, legal — no member restore |
| Member app | `/home`, `/discover`, `/chats`, etc. | Username + PIN auth, compact fintech UI |
| Onboarding | `/onboarding` only | Incomplete users routed here; never inside `/home` |
| Admin / Hard console | `/hard/*` | Operations, certification, executive dashboards |
| Consultant portal | `/consultant/*` | Matchmaker and concierge workflows |
| API | `api/`, `server/routes/` | Auth, member data, payments, diagnostics |
| Android | `android/`, Capacitor | WebView shell over synced `dist/` assets |

## Auth model

- **Login UI:** username + PIN only (never email/password in member login).
- **Signup:** may collect email/phone for verification; PIN is the credential.
- **Sessions:** server-validated member tokens; public routes must not trigger member restore.

## Routing locks (do not break)

- Public routes (`/`, `/blog`, `/premium`, etc.) never show onboarding or member shell.
- Completed users → `/home`; incomplete → `/onboarding`.
- Paystack returns preserve `paymentReturnPath` — never dump users on public homepage after payment.

## Key entrypoints

| File | Role |
|------|------|
| `server/production.js` | Process entry (Docker, Coolify, `npm start`) |
| `server/app.js` | Canonical route mounting |
| `src/main.tsx` | Client bootstrap |
| `Dockerfile` | Build + healthcheck |
