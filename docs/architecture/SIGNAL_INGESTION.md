# Stankings Digital Trust Passport — Signal Ingestion

**Version:** Platform v2.0 (Phase 1)  
**Status:** Pipeline contracts — interfaces only  
**Foundation:** Frozen at v1.2

---

## Overview

Signal ingestion is the production pipeline through which Trust Contributors emit evidence into the Passport platform. This sprint defines **contracts only** — no database, queues, API routes, or workers.

Implementation: `src/passport/ingestion/`

---

## Pipeline stages

```mermaid
flowchart TB
  R[1. Receive] --> V[2. Validate]
  V --> C[3. Consent Check]
  C --> N[4. Normalize]
  N --> A[5. Audit Reference]
  A --> D[6. Deduplicate]
  D --> P[7. Persist]
  P --> E[8. Publish Event]
  E --> F[9. Future Trust Engine]

  style F fill:#f9f9f9,stroke:#999,stroke-dasharray: 5 5
```

| Stage | Order | Description |
|-------|-------|-------------|
| **Receive** | 1 | Accept submission from authenticated contributor |
| **Validate** | 2 | Schema, signature, contributor, evidence, reference, expiration, version |
| **Consent Check** | 3 | Verify active consent — no signal without consent |
| **Normalize** | 4 | Map to canonical `TrustSignal` — never store raw payloads |
| **Audit Reference** | 5 | Append audit timeline reference |
| **Deduplicate** | 6 | Idempotency key and replay detection |
| **Persist** | 7 | Store normalized signal reference |
| **Publish Event** | 8 | Emit `signal_created` or related event |
| **Future Trust Engine** | 9 | Validated signals available for derivation |

Implementation: `SIGNAL_INGESTION_PIPELINE` in `src/passport/ingestion/pipeline.ts`

---

## Consent flow

```mermaid
flowchart TB
  SUB[Signal Submission] --> GATE{Consent Gate}
  GATE -->|Active consent| PASS[Continue pipeline]
  GATE -->|Missing| REJECT[Reject — consent_missing]
  GATE -->|Revoked| REJECT2[Reject — consent_revoked]
  GATE -->|Override| HR{Human override documented?}
  HR -->|Yes| PASS
  HR -->|No| REJECT3[Reject — human_override_required]
  PASS --> NORM[Normalize]
```

Requirements: `SIGNAL_CONSENT_GATE_REQUIREMENTS` in `src/passport/signals/consentGate.ts`

---

## Validation flow

```mermaid
flowchart LR
  subgraph Validators["Validation Pipeline"]
    SCH[Schema]
    SIG[Signature]
    CON[Contributor]
    CNS[Consent]
    EVI[Evidence]
    REF[Reference]
    EXP[Expiration]
    VER[Version]
  end

  SUB[Submission] --> SCH --> SIG --> CON --> CNS --> EVI --> REF --> EXP --> VER
  VER --> REPORT[ValidationReport]
```

Each validator returns `SignalValidationResult`. Composite `SignalValidationReport` determines pipeline continuation.

---

## Idempotency and deduplication

```mermaid
sequenceDiagram
  participant C as Contributor
  participant I as Ingestion
  participant ID as Idempotency Store
  participant P as Persist

  C->>I: Submit signal + idempotencyKey
  I->>ID: checkDuplicate()
  alt New signal
    ID-->>I: accept_new
    I->>P: persist
    I->>ID: recordAccepted()
  else Duplicate
    ID-->>I: return_existing
    I-->>C: existing signalId
  else Conflict
    ID-->>I: reject_conflict
    I-->>C: rejection
  end
```

Metadata: `SignalIdempotencyMetadata` — `idempotencyKey`, `contributorEventId`, `correlationId`

---

## Ingestion context

```typescript
// Contract shape — see src/passport/ingestion/pipeline.ts
type SignalIngestionContext = {
  submission: TrustSignalSubmission;
  idempotency: SignalIdempotencyMetadata;
  receivedAt: string;
  correlationId: string;
};
```

Result: `SignalIngestionResult` — success with `ValidatedTrustSignal` or failure with `failedStage`.

---

## Future Trust Engine flow

```mermaid
flowchart TB
  subgraph Ingestion["Ingestion Pipeline"]
    VS[Validated Signals]
    PR[Provenance Records]
  end

  subgraph Inputs["TrustEngineInputBundle"]
    VS --> BUNDLE
    PR --> BUNDLE
    CON[Consent State] --> BUNDLE
    AUD[Audit References] --> BUNDLE
    HR[Human Reviews] --> BUNDLE
    TL[Timeline] --> BUNDLE
    JN[Journey] --> BUNDLE
    LEG[Legacy Snapshot] --> BUNDLE
  end

  BUNDLE --> TE[Future Trust Engine]
  TE --> DERIVED[Derived Trust Summary]

  style TE fill:#f9f9f9,stroke:#999,stroke-dasharray: 5 5
```

**Never:** raw contributor payloads, direct database records, unvalidated signals.

Contract: `TrustEngineInputBundle` in `src/passport/evolution/trustEngineContract.ts`

---

## Event publishing

After successful persist, ingestion publishes events:

| Event | When |
|-------|------|
| `signal_created` | New validated signal |
| `signal_updated` | Signal metadata updated |
| `signal_revoked` | Signal withdrawn |
| `human_review_requested` | Review required |
| `trust_recomputed` | Future — after engine derivation |

Interfaces: `PassportSignalEventPublisher`, `PassportSignalEventSubscriber`

---

## What is NOT in this phase

| Excluded | Reason |
|----------|--------|
| Database tables | Implementation Phase A.2 |
| Supabase migrations | Implementation |
| API routes | Implementation |
| Cron / workers | Implementation |
| Redis / Kafka | Implementation |
| Trust calculations | Trust Engine Phase B |
| AI / ML | Prohibited by constitution |

---

## Code map

| Concern | Module |
|---------|--------|
| Pipeline stages | `src/passport/ingestion/pipeline.ts` |
| Public exports | `src/passport/ingestion/index.ts` |
| Validation | `src/passport/signals/validation.ts` |
| Consent gate | `src/passport/signals/consentGate.ts` |
| Idempotency | `src/passport/signals/idempotency.ts` |
| Events | `src/passport/signals/events.ts` |

---

## Maturity

| Capability | Maturity |
|------------|----------|
| Signal Ingestion | Beta (server implemented) |

Implementation guide: [SIGNAL_IMPLEMENTATION.md](./SIGNAL_IMPLEMENTATION.md)

---

## Related documents

- [TRUST_SIGNAL_STANDARD.md](./TRUST_SIGNAL_STANDARD.md)
- [VERSION_GOVERNANCE.md](./VERSION_GOVERNANCE.md)
- [DIGITAL_TRUST_CONSTITUTION.md](./DIGITAL_TRUST_CONSTITUTION.md)

---

## Future implementation roadmap

1. **Platform v2.1** — Contributor authentication, signal persistence
2. **Platform v2.2** — Async ingestion queue, event bus
3. **Trust Engine v1.0** — Derivation from validated signals
4. **Passport API v1.0** — External scoped summaries
