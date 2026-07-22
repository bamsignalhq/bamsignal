# Feature Flag Platform — Runtime Configuration

Sprint 5 adds centralized **runtime configuration** for operational control. This complements the existing product feature flag platform (`feature_flags` table, admin UI).

## Runtime Keys

Stored in `ops_runtime_configuration`:

| Key | Purpose |
|-----|---------|
| signup | Member signup availability |
| messaging | Messaging availability |
| payments | Payment processing |
| notifications | Push/in-app notifications |
| matching | Discover and matching |
| concierge | Concierge program |
| maintenance_mode | Platform maintenance |
| emergency_banner | Emergency banner display |
| beta_features | Beta rollout gate |

## Audit

Every change writes to:

- `ops_runtime_configuration_audit` (append-only)
- `ops_immutable_audit_log`
- Admin event bus (`feature.updated`, `configuration.updated`)

## Evaluation

`isRuntimeFeatureEnabled(key, context)` supports rollout percentage with deterministic member hashing.

## Admin API

```
POST /api/operations/admin?action=runtime-config
POST /api/operations/admin?action=update-runtime-config
```

## Relationship to Product Flags

| System | Table | Use |
|--------|-------|-----|
| Product flags | `feature_flags` | Product experiments, UI gates |
| Runtime config | `ops_runtime_configuration` | Ops kill switches, maintenance |

Do not duplicate keys between systems without documentation.
