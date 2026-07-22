# Deployment Standard (Coolify + GitHub App + Cloudflare Access)

Gold-standard blueprint proven on **BamSignal**, replicated on **Yike**.
Use this for **BayRight**, **Stankings**, and any future app on the shared Coolify host.

See also: [PLATFORM_STANDARD.md](./docs/engineering/PLATFORM_STANDARD.md)

Do not reinvent. Follow this document exactly unless the project has a documented exception.

---

## Goals

- Push to `main` → Coolify deploys automatically via GitHub App webhook
- Coolify dashboard stays behind Cloudflare Access
- Only the minimum path is bypassed for GitHub webhooks
- Each product owns its own GitHub account/app (no shared GitHub App across products)

---

## Architecture

```
Product GitHub (dedicated App, repo-only)
        │  POST /webhooks/source/github/events
        ▼
Cloudflare Access on Coolify FQDN
  ├─ Dashboard / API  → Access policy (auth required)
  └─ Webhook path     → Bypass (Everyone) — path only
        ▼
Coolify (shared Hetzner instance)
        ▼
Docker build from repo Dockerfile → Running container
```

**Shared Coolify FQDN (canonical):** `https://control.stankings.com`  
**Compatibility alias (keep until GitHub Apps fully cut over):** `https://control.bamsignal.com`

**Migration status (2026-07-20):** Cutover is live for the control plane.

| Item | Status |
|------|--------|
| Coolify Instance URL | `https://control.stankings.com` |
| Traefik | `coolify.yaml` → stankings; `control-bamsignal-alias.yaml` → bamsignal alias; LE on both |
| Access (Stankings CF) | `control` allow founders + `coolify-github-webhooks` path bypass |
| Access (BamSignal CF) | Unchanged for `control.bamsignal.com` + same webhook path bypass |
| GitHub App webhooks | Both hosts accept webhooks (200). Prefer updating App Homepage/Callback/Setup/Webhook URLs to `control.stankings.com` when editing each app; bamsignal alias remains valid until then |

Because Coolify is one control plane, Access for each Coolify hostname lives in the **Cloudflare account that owns that DNS zone** (Stankings zone → Stankings Access; BamSignal zone → BamSignal Access).

---

## Phase checklist (every new product)

### 1. Audit first

Record before changing anything:

| Item | Notes |
|------|--------|
| GitHub account / org | Product-owned only |
| Repository | `owner/repo` |
| Coolify project / app UUID | |
| Current Source | Must not reuse another product’s GitHub App |
| Branch | Prefer `main` |
| Auto Deploy | Must end ON |
| Watch Paths | Must be empty (deploy every push to branch) |
| Cloudflare zone for app domain | Product account |
| Cloudflare zone for Coolify FQDN | Shared host owner |

### 2. Dedicated GitHub App → Coolify Source

1. Coolify → **Sources** → **+ Add**
2. Name: `{product}-coolify` (or product name if available on GitHub)
   - If the exact product slug is reserved (e.g. `yike` → `@yike`), use `{owner}-coolify`
3. Organization: set only if the app must live under a GitHub org; leave empty for a user account
4. **System Wide:** OFF
5. Register via Coolify **Register Now** (manifest flow)
6. Webhook endpoint: Coolify public URL (`https://control.stankings.com`) — **do not** include `/webhooks`
7. Install the app on GitHub with **Only select repositories** → **only** that product’s repo
8. Confirm Coolify Source shows App Id / Installation Id / webhook secret / private key

**Never** attach product A’s repo to product B’s GitHub App.

### 3. Wire the Coolify application

On the app → **Git Source**:

- Change source → new `{product}-coolify` Source (confirm dialog)
- Repository: `owner/repo`
- Branch: `main`
- Commit SHA: `HEAD`
- Confirm **Open Git App** appears (proves GitHub App linkage)

**Advanced:**

- Auto Deploy: **ON**
- Preview Deployments: optional

**General:**

- Build Pack: **Dockerfile** (or documented pack)
- Dockerfile Location: `/Dockerfile` (repo must contain it on `main`)
- Watch Paths: **empty**
- Ports: match the app (often `3000`)

### 4. Cloudflare Access (Coolify host)

On the Cloudflare account that owns the Coolify hostname:

1. Keep existing Access app that protects the Coolify dashboard (full hostname / UI)
2. Create a **separate** Access application for webhooks only:

| Field | Value |
|-------|--------|
| Application name | `coolify-github-webhooks` (or equivalent) |
| Application domain | `control.stankings.com/webhooks/source/github/events*` (alias also valid) |
| Policy | **Bypass** / **Everyone** |

Rules:

- **Do** bypass only `/webhooks/source/github/events*`
- **Do not** bypass the whole hostname
- **Do not** bypass `/api/v1/deploy`
- **Do not** weaken dashboard Access

Verify:

```bash
# Webhook path reachable without Access login
curl -sS -o /dev/null -w "%{http_code}\n" -X POST \
  "https://control.stankings.com/webhooks/source/github/events" \
  -H "Content-Type: application/json" -d '{}'
# Expect: 200 (or Coolify-handled non-302)

# Dashboard still protected
curl -sS -o /dev/null -w "%{http_code}\n" "https://control.stankings.com/"
# Expect: 302 (Access login)
```

Access for Coolify must live in the Cloudflare account that owns the Coolify hostname’s DNS zone (Stankings zone for `control.stankings.com`; BamSignal zone for the compatibility alias).

### 5. Repo must be Coolify-buildable

Coolify Dockerfile builds fail if `Dockerfile` is missing from the tracked branch.

Minimum:

- `Dockerfile` on `main`
- `.dockerignore` excluding `.env*`, `node_modules`, `.next` / `dist`, etc.
- Health endpoint that Coolify / edge can probe (`/health`, `/ready`, or product-specific public health)

### 6. Verification (required)

1. Harmless commit on `main` (README comment is enough)
2. Push
3. Coolify Deployments: new row with commit SHA, trigger **Webhook**
4. Build **Success**, app **Running** / **Healthy**
5. Hit production health endpoint — expect OK and preferably matching commit SHA

If build fails: fix root cause (missing Dockerfile, build env, typecheck, etc.) and re-push. Do not stop at “webhook works but deploy fails.”

---

## Reference implementations

### BamSignal

| Item | Value |
|------|--------|
| GitHub | `bamsignalhq/bamsignal` |
| GitHub App / Coolify Source | `bamsignal` (org Bamsignal) |
| Branch | `main` |
| Auto Deploy | ON |
| Watch Paths | empty |
| Coolify FQDN | `control.stankings.com` (alias `control.bamsignal.com`) |
| Access webhook bypass | `control.stankings.com/webhooks/source/github/events*` (and bamsignal alias) |
| Health | `GET /health`, `GET /ready` |

### Yike

| Item | Value |
|------|--------|
| GitHub | `yikeltd/yike` |
| GitHub App / Coolify Source | `yikeltd-coolify` (personal `yikeltd`, repo-only) |
| Branch | `main` |
| Auto Deploy | ON |
| Watch Paths | empty |
| Coolify app UUID | `pzg437ooc1jn7l6tglnw4pqu` |
| Access webhook bypass | Same shared Coolify bypass on `control.stankings.com` (and bamsignal alias) |
| Health | `GET /health`, `GET /api/public-health` |

---

## Security non-negotiables

1. Least privilege: GitHub App → one repo only
2. Never expose the Coolify dashboard
3. Never broaden Cloudflare bypass beyond the exact webhook path
4. Never reuse another product’s GitHub App
5. Never modify unrelated Coolify apps while setting up a new one
6. Runtime secrets stay runtime (Buildtime OFF); only public build args at build time

---

## Production certification (Sprint 1.1+)

Before launch cutover or after infrastructure changes:

```bash
npm run certify:production
```

Produces `certification/production/reports/latest.md` and `latest.json` covering migrations, environment validation, build, server import, source integrity, diagnostics, readiness, hardening tests, and fortress suite.

**PR CI** (fast gates only): `.github/workflows/pr-checks.yml` — lint, typecheck, build, server import.

**Branch protection:** see [docs/engineering/BRANCH_GOVERNANCE.md](./docs/engineering/BRANCH_GOVERNANCE.md).

---

## Common failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Push does nothing | Access blocking webhook; wrong Source; Auto Deploy off; Watch Paths filter | Bypass path; wire Source; enable Auto Deploy; clear Watch Paths |
| Webhook 302 | No path bypass (or wrong path) | Bypass `/webhooks/source/github/events*` only |
| Deploy fails in seconds | Missing `Dockerfile` on branch | Commit Dockerfile + `.dockerignore` |
| App Running but wrong domain | Coolify Domains not set to product FQDN | Add domain + DNS; do not confuse sslip.io with production |
| Name reserved on GitHub App create | Slug taken (e.g. `yike`) | Use `{owner}-coolify` |

---

## Rollout order for remaining products

1. **BayRight** — new Source + App under BayRight GitHub; wire Coolify app; verify webhook deploy
2. **Stankings** — already has `stankings-coolify`; audit parity (Auto Deploy, Watch Paths, webhook, Dockerfile), then verify with a harmless push

After each product: update the “Reference implementations” table in this file.
