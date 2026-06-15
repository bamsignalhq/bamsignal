# BamSignal — Google Play reviewer account

> **Action required:** Run provisioning on production (Coolify shell or machine with `DATABASE_URL`) to set the live PIN:
>
> ```bash
> node scripts/provision-play-reviewer.mjs
> ```
>
> This overwrites this file with the generated PIN. Credentials are also written to `PLAY_REVIEW_ACCESS.md` (gitignored — paste into Play Console only).

## Intended credentials

| Field | Value |
|-------|-------|
| **Username** | `playreview` |
| **Email (confirmed)** | `reviewer@bamsignal.com` |
| **PIN** | *Generated on provision — 6 digits* |
| **Phone** | `08099998888` (marked verified in profile) |

Login: **username + 6-digit PIN** on the BamSignal app (no Google Sign-In).

## Profile completeness (after provision)

| Item | Status |
|------|--------|
| Photos (2+) | ✓ showcase Lagos photos |
| Cover photo | ✓ |
| Bio | ✓ |
| Interests | Music, Food, Travel, Movies |
| Email verified | ✓ |
| Phone verified | ✓ |
| Onboarding | Complete |
| City | Lagos (discoverable) |

## Play Console — App access (template)

Replace `{PIN}` after running the provision script:

```
BamSignal uses username + PIN login (no Google Sign-In).

Username: playreview
PIN: {PIN}

After login, the account has completed onboarding with photos, bio, and interests. Discover, Likes, Messages, Profile, Safety, and Premium payment screens are accessible. Standard member account — no admin access.
```

## Re-provision / rotate PIN

```bash
node scripts/provision-play-reviewer.mjs
# or fixed PIN for testing:
PLAY_REVIEWER_PIN=482913 node scripts/provision-play-reviewer.mjs
```

Requires `DATABASE_URL` and optionally `SUPABASE_SERVICE_ROLE_KEY`.
