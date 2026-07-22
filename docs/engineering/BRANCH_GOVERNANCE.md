# Branch Governance

Recommended GitHub repository settings for BamSignal production development.

**Scope:** Documentation only — configure in GitHub repository settings.

---

## Protected `main` branch

Enable branch protection on `main`:

| Setting | Recommendation |
|---------|----------------|
| Require pull request before merging | **On** |
| Required approving reviews | **1** |
| Dismiss stale pull request approvals when new commits are pushed | **On** |
| Require status checks to pass before merging | **On** |
| Required status checks | `PR Checks / fast-gates` (from `.github/workflows/pr-checks.yml`) |
| Require branches to be up to date before merging | **On** (when team size allows) |
| Require linear history | **On** |
| Include administrators | **Off** (recommended for production repos) |
| Allow force pushes | **Off** |
| Allow deletions | **Off** |

---

## Pull request workflow

1. Create feature branch from `main`
2. Open PR — `PR Checks` workflow runs:
   - `npm ci`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
   - `npm run test:server-import`
3. Obtain **one required review**
4. Merge with linear history (squash or rebase — no merge commits on `main`)

Production certification (`npm run certify:production`) is **not** run on every PR — run before launch cutover and after infrastructure changes.

---

## Status checks

| Check | When | Purpose |
|-------|------|---------|
| `PR Checks / fast-gates` | Every PR | Fast failure on lint, typecheck, build, server import |
| `Platform Governance CI` | PR + main push | Migrations, Supabase identity, extended gates |
| Manual `certify:production` | Pre-launch | Full production certification report |

---

## Force push policy

**Never force push to `main`.** If history repair is required, use a documented incident process and coordinate with repository admins.

---

## Related documents

- [DEPLOYMENT_STANDARD.md](../../DEPLOYMENT_STANDARD.md)
- [LAUNCH.md](../../LAUNCH.md)
- [SECURITY.md](../../SECURITY.md)
