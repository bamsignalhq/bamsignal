# Push Readiness — `5e2ebe8`

**Sprint:** 1.2  
**Branch:** `feat/platform-freeze`  
**Recovery commit:** `5e2ebe8216ae0b1ef2d4c1bc7a85dfec81a7f512`  
**Date:** 2026-07-21

---

## Is `5e2ebe8` itself push-safe?

**Yes — as a commit object.** It contains only:

- Restored `migrations/0022`–`0037`
- Sprint 1.0/1.1 `audit/` forensic docs

No secrets, no `supabase/.temp`, no build artifacts, no DB mutations.

Pushing **only** commits already on the branch does not upload unstaged local files.

---

## Working tree (must not accidentally stage)

### Modified (leave out of recovery push unless intentional)

| Path | Recommendation |
|------|----------------|
| `docs/engineering/PROJECT_IDENTITY.md` | **Belongs** in a platform-freeze / guardrail commit (Supabase ref docs) — separate from recovery if desired |
| `package.json` | **Belongs** with verify script npm wrappers — separate commit |
| `server/applicationIdentity.js` | **Belongs** with identity guardrails — separate commit |
| `public/sitemap.xml` | **Do not commit** (generated) |
| `public/sw.js` | **Do not commit** unless cache version intentionally shipped |
| `src/buildInfo.ts` | **Do not commit** (generated build stamp) |

### Untracked

| Path | Recommendation |
|------|----------------|
| `scripts/verify-supabase-project.mjs` | **Should ship** (guardrail) — not in `5e2ebe8`; commit before or after push as cleanup |
| `supabase/config.toml` | **Should ship** (project_id pin) |
| `.cursor/rules/supabase-migration-safety.mdc` | **Should ship** (agent guard) |
| `.githooks/pre-commit` | **Should ship** if hooks are part of freeze |
| `supabase/.temp/` | **Remain local / gitignore** — do **not** push |
| `audit/*.md` from Sprint 1.2 (new) | **Commit before freeze** so certification travels with branch |
| `audit/_dep_scan.json` | Optional helper — commit or delete; prefer omit |

---

## What belongs on the remote for “recovery complete”

Minimum:

1. `5e2ebe8` (already committed)
2. Sprint 1.2 audit docs (this sprint’s markdown) — **not yet committed**

Recommended companion (platform freeze, can be separate commit):

- verify script + `package.json` scripts
- `supabase/config.toml`
- identity doc/code updates
- cursor rule / pre-commit

---

## Blockers to “push now” without cleanup

1. Sprint 1.2 certification docs exist only as untracked/modified working tree files until committed.
2. Guardrail files that the team already relies on locally are still untracked — branch on remote would lack them.
3. Risk of accidentally staging generated `sitemap` / `sw` / `buildInfo` if someone `git add -A`.

---

## Recommendation

| Action | Now? |
|--------|------|
| Push `5e2ebe8` alone immediately | Prefer **wait** |
| Commit Sprint 1.2 `audit/*` certification set | **Yes** (next human approve) |
| Commit guardrails as separate commit | **Yes** (recommended) |
| Add `supabase/.temp/` to `.gitignore` if missing | **Yes** |
| Then push `feat/platform-freeze` | After above |

---

## Push readiness verdict

See `audit/SPRINT_1_2_CERTIFICATION.md`.
