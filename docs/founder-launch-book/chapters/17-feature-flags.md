# Feature Flags

BamSignal uses **two flag systems** — do not confuse them.

## 1. Build-time flags (`VITE_*`)

Documented in `docs/operations/environment/feature-flags.md` and `src/constants/featureFlags.ts`.

| Flag | Default | Notes |
|------|---------|-------|
| `VITE_ENABLE_REFERRALS_UI` | false | Referral widget — enable at campaign launch |
| `VITE_ENABLE_IMAGE_MODERATION` | true | Client moderation UX |
| `PHOTO_MODERATION_MODE` | upload_first | Server wins over client |
| `VITE_STORE_SCREENSHOTS` | false | **Never production** |

Changes require rebuild + redeploy (Coolify build args).

## 2. Enterprise Feature Flag Platform (runtime API)

| Item | Location |
|------|----------|
| Admin UI | `/hard/feature-flags` |
| Public API | `GET /api/feature-flags` |
| Server seed | `server/services/featureFlagPlatform.js` |

Key product flags include: `trusted_member`, `signal_concierge`, `voice_vibe`, `communities`, `events`, `ai_matching`, `executive_dashboard`.

### Operations

1. Review flag in admin UI before enabling rollout.
2. Prefer percentage / city scoping over global enable for risky features.
3. Audit trail stored in `feature_flag_audits` table.
4. Post-deploy: confirm `smoke:production` feature-flags check passes.

### Certification

```bash
npm run certify:drift    # env + flag drift
npm run smoke:production # API returns flags array
```

## Governance

- New flags must be documented before merge to `main`.
- Removing a flag requires cleanup of dead code paths.
- Never enable `future_experiments` in production without founder approval.
