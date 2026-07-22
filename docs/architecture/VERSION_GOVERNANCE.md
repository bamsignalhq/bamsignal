# Version Governance

**Status:** Active  
**Scope:** Architectural versioning for the Stankings Digital Trust Passport ecosystem

---

## Purpose

Architectural versions are **distinct from application release versions** (e.g. BamSignal `0.1.0`).

Every Stankings product targets explicit architectural contracts:

```text
Foundation v1.x   → frozen platform contracts
Platform v2.x     → implementation capabilities
Trust Engine v1.x → trust derivation
Passport API v1.x → external consumption
Consent Platform v1.x → consent management
```

---

## Version families

### Foundation v1.x — Platform contracts (frozen)

| Version | Scope | Status |
|---------|-------|--------|
| **v1.0** | Identity, Workspace, Persona, Permissions, Trust, Governance, SKL | Frozen |
| **v1.1** | Trust Evolution, Principle 11 | Frozen |
| **v1.2** | Legacy Architecture, Principle 12 | Frozen — **architecturally complete** |

Constitution version: `1.2.0` (`CONSTITUTION_VERSION`)

### Platform v2.x — Implementation capabilities

| Version | Scope | Status |
|---------|-------|--------|
| **v2.0** | Trust Signals, Ingestion, Contributor Framework, ADR (Phase 1) | In progress |
| **v2.1** | Signal persistence, contributor auth | Planned |
| **v2.2** | Event bus, async ingestion | Planned |

### Trust Engine v1.x

| Version | Scope | Status |
|---------|-------|--------|
| **v1.0** | Confidence derivation from validated signals | Planned |
| **v1.1** | Explainability generation | Planned |

### Passport API v1.x

| Version | Scope | Status |
|---------|-------|--------|
| **v1.0** | Scoped trust summaries with consent | Planned |

### Consent Platform v1.x

| Version | Scope | Status |
|---------|-------|--------|
| **v1.0** | Consent grant, revocation, audit API | Planned |

---

## Milestone types

| Type | Example | Meaning |
|------|---------|---------|
| **Architectural milestone** | Foundation v1.2 complete | Conceptual model frozen |
| **Implementation milestone** | Platform v2.0 signals shipped | Capability in production |
| **Product milestone** | BamSignal emits first signal | Product integration |

Tag architectural milestones separately from application releases:

```bash
git tag -a foundation-v1.2.0 -m "Passport Foundation complete"
git tag -a platform-v2.0.0 -m "Trust Signal standard shipped"
```

---

## Upgrade policy

### Foundation upgrades

1. Draft ADR describing change
2. Architecture review across Trust Contributors
3. Constitution version bump if principles change
4. Backward compatibility assessment for existing Passport IDs
5. Documentation and maturity registry update

**No silent constitutional drift.**

### Platform upgrades

1. ADR for significant capability changes
2. Additive contracts preferred over breaking changes
3. Maturity registry updated when capability ships
4. Deprecation period for superseded interfaces

---

## Deprecation policy

| Level | Action |
|-------|--------|
| **Deprecated interface** | Document replacement; maintain for one platform version |
| **Superseded ADR** | Mark old ADR; link to new ADR |
| **Removed capability** | ADR + migration guide + major version bump |

Never remove frozen Foundation contracts without explicit architectural review and ecosystem migration plan.

---

## Compatibility guarantees

| Contract | Guarantee |
|----------|-----------|
| `SKL-XXXX-XXXX` format | Permanent — never changes for existing IDs |
| Constitutional Principles 1–12 | Additive only — no removal without ADR |
| Passport Summary schema | Backward compatible extensions |
| Trust Signal standard | Additive signal types; existing types stable |
| Contributor registry | Additive contributors; existing IDs stable |

---

## Implementation roadmap alignment

| Phase | Architectural version | Deliverable |
|-------|----------------------|-------------|
| **A — Trust Signals** | Platform v2.0 | Signal standard, ingestion contracts |
| **B — Trust Engine** | Trust Engine v1.0 | Derivation from validated signals |
| **C — Passport Experience** | Platform v2.x | Dashboard, timelines, consent UI |
| **D — Ecosystem** | Platform v2.x | BayRight, Yike integration |
| **E — External Platform** | Passport API v1.0, Consent v1.0 | External consumers |

---

## Related documents

- [adr/README.md](./adr/README.md)
- [ADR_GUIDE.md](./ADR_GUIDE.md)
- [DIGITAL_TRUST_CONSTITUTION.md](./DIGITAL_TRUST_CONSTITUTION.md)
- [TRUST_SIGNAL_STANDARD.md](./TRUST_SIGNAL_STANDARD.md)
