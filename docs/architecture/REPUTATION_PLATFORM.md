# Reputation Platform Architecture

## Design Principle

**Structured inputs only. No scoring algorithm.**

Sprint 6 builds the data foundation for a future Trust Engine. It does not implement AI scoring or derived trust scores.

## Dimensions

Nine independent reputation input channels in `passport_reputation_profile`:

1. Identity
2. Reliability
3. Safety
4. Engagement
5. Financial
6. Community
7. Verification
8. Concierge
9. Support

Each dimension stores an append-only JSON array of input records.

## Input Log

`passport_reputation_input_log` — immutable append-only log with:

- dimension
- source_system
- signal_type
- signal_id (link to passport trust signal when available)
- input_payload
- correlation_id

## Updates

Every accepted trust signal appends to the relevant dimension via `appendReputationInput()` and publishes `reputation.updated` on the trust event bus.

## API Contract

`buildReputationProfileContract(passportId)` returns:

```json
{
  "passportId": "SKL-XXXX-XXXX",
  "dimensions": {
    "identity": { "inputCount": 3, "latestInputs": [...], "score": null }
  },
  "note": "Structured inputs only — no scoring algorithm in Sprint 6"
}
```

## Future Trust Engine

Subscribes to:

- `trust.signal.accepted`
- `reputation.updated`
- `verification.completed`

Derives scores externally — not in this sprint.
