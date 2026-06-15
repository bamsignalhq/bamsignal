# Google Play reviewer access (template)

Copy to `PLAY_REVIEW_ACCESS.md` locally after running the provision script.
**Do not commit** `PLAY_REVIEW_ACCESS.md` — it is listed in `.gitignore`.

## Generate credentials

```bash
node scripts/provision-play-reviewer.mjs
```

## Login (member app)

| Field | Value |
|-------|-------|
| Username | `playreview` |
| PIN | *(see PLAY_REVIEW_ACCESS.md after provisioning)* |
| Email | `reviewer@bamsignal.com` (internal; login uses username + PIN) |

## Play Console — App access blurb

```
BamSignal uses username + PIN login.

Username: playreview
PIN: <from PLAY_REVIEW_ACCESS.md>

The account has completed onboarding and can access Home, Discover, Likes, Messages, Profile, Safety, and Payment. No admin access.
```

## Rotate PIN

Re-run `node scripts/provision-play-reviewer.mjs` or set `PLAY_REVIEWER_PIN` before running.
