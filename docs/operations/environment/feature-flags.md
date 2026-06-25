# Feature Flags

Build-time and runtime flags that control BamSignal behavior. All flags must be documented here before merge to `main`.

Implementation: `src/constants/featureFlags.ts`, `src/config/imageModeration.ts`, `.env.example`

---

## Active flags

### `VITE_ENABLE_REFERRALS_UI`

| Field | Value |
|-------|-------|
| **Default** | `false` |
| **Scope** | buildtime (`VITE_*`) |
| **Purpose** | Show referral invite widget on member home |
| **Owner** | Product |
| **Rollout** | Enable when referral campaign launches |
| **Removal** | Remove flag when referrals GA — always on or removed |

---

### `VITE_ENABLE_IMAGE_MODERATION`

| Field | Value |
|-------|-------|
| **Default** | `true` |
| **Scope** | buildtime |
| **Purpose** | Client-side moderation UX hints |
| **Owner** | Engineering |
| **Rollout** | Production on |
| **Removal** | When moderation always enforced in UI |

---

### `VITE_PHOTO_MODERATION_MODE` / `PHOTO_MODERATION_MODE`

| Field | Value |
|-------|-------|
| **Default** | `upload_first` |
| **Scope** | buildtime + runtime (server authority = `PHOTO_MODERATION_MODE`) |
| **Purpose** | Photo upload policy: `upload_first`, `review`, `strict` |
| **Owner** | Engineering |
| **Rollout** | `upload_first` in production |
| **Removal** | Consolidate to server-only when client mirror unnecessary |

**Drift rule:** Server `PHOTO_MODERATION_MODE` wins — client flag must match.

---

### `VITE_STORE_SCREENSHOTS`

| Field | Value |
|-------|-------|
| **Default** | unset / `false` |
| **Scope** | buildtime |
| **Purpose** | Enable store screenshot demo content in app shell |
| **Owner** | Engineering |
| **Rollout** | **Development only** — never production |
| **Removal** | Delete when Play screenshots finalized |

---

## Implicit environment flags

| Flag | Mechanism | Purpose |
|------|-----------|---------|
| `import.meta.env.DEV` | Vite | Dev-only logging, demo admin |
| `import.meta.env.PROD` | Vite | Service worker, production guards |
| `ADMIN_BOOTSTRAP_ENABLED` | runtime env | One-time admin setup |
| `LEGACY_SETUP_ENABLED` | runtime env | Legacy console setup route |
| `TELEGRAM_ENABLE_POLLING` | runtime env | Local Telegram polling |
| `RUN_MIGRATIONS_ON_STARTUP` | runtime env | Boot migrations |

---

## Future flags

| Flag (proposed) | Purpose | Owner | Status |
|-----------------|---------|-------|--------|
| `VITE_ENABLE_AI_WORKSPACE` | AI workspace member UI | Engineering | Not implemented |
| `VITE_ENABLE_CONCIERGE_V2` | Concierge UX experiment | Product | Not implemented |
| `ENABLE_MAINTENANCE_MODE` | Read-only maintenance | DevOps | Not implemented |

Document here before adding to `.env.example`.

---

## Rollout strategy

1. **Default off** for user-facing features (`VITE_ENABLE_*`)
2. **Staging first** — rebuild with flag on, QA sign-off
3. **Production** — Coolify rebuild with flag change (buildtime)
4. **Monitor** — error rate, support tickets 24h
5. **Remove flag** within 90 days of 100% rollout (tech debt ticket)

Runtime-only flags can toggle with container restart (no rebuild).

---

## Removal policy

| Condition | Action |
|-----------|--------|
| Flag at 100% for 30 days | Create removal PR |
| Flag unused in code | Delete env var + docs |
| Flag dev-only | Must not appear in production Coolify build args |

---

## Validation

```bash
npm run env:validate
```

Flags with `validate: boolean` or `validate: enum:*` in `shared/environmentRegistry.mjs` are checked automatically.

---

## Related

- [required-secrets.md](./required-secrets.md)
- [configuration-drift.md](./configuration-drift.md)
- [feature-flags in release checklist](../../releases/checklists/production-release-checklist.md)
