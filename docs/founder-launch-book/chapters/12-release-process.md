# Release Process

## Release types

| Type | Branch | Approval |
|------|--------|----------|
| Standard web | `main` | Release engineer + certification gates |
| Hotfix | `main` (revert-forward) | Founder for P1 |
| Android | `main` + Play Console | Release engineer + asset verification |
| Schema | `main` + migrations | DBA review + backup |

## Standard web release flow

1. **Freeze** scope — no unrelated commits.
2. **Test** locally: `npm run build`, `npm run test`, `npm run test:server-import`.
3. **Certify** (as applicable):
   - `npm run certify:rc` — aggregate gate
   - `npm run certify:security`, `certify:dependencies`, `certify:accessibility`
   - `npm run smoke:production` after deploy
4. **Document** using `docs/releases/templates/release-template.md`.
5. **Push** to `main` → Coolify deploy.
6. **Verify** health + smoke + manual member paths (login, discover, payment return).
7. **Record** release in `docs/releases/history/`.

## Certification commands (reference)

```bash
npm run certify:launch
npm run certify:performance
npm run certify:security
npm run certify:reliability
npm run certify:dependencies
npm run certify:drift
npm run certify:accessibility
npm run certify:founder
npm run certify:rc
```

## Go / no-go

Founder Launch Certification (`npm run certify:founder`) aggregates subsystem scores for board-level decision. RC certification blocks on critical failures.

## Rollback criteria

Rollback immediately if:

- `/ready` fails > 5 minutes post-deploy
- Payment webhook processing broken
- Auth completely blocked
- Data corruption suspected

See **Rollback Procedure**.
