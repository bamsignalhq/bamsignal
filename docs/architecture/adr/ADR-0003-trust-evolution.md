# ADR-0003: Trust Evolution Architecture

**Status:** Accepted  
**Date:** 2026  
**Version Introduced:** Foundation v1.1

---

## Decision

Introduce **Trust Evolution** as a dynamic layer above frozen identity — lifecycle stages, Trust Timeline, Journey, Milestones, and Achievements — governed by **Principle 11: Trust Can Be Earned**.

---

## Context

Foundation v1.0 established permanent identity and multi-dimensional trust. Users need a living Passport that reflects growth over time without permanent labels from isolated mistakes.

---

## Problem

A static Passport cannot represent:

- Trust earned through positive participation
- Curated narrative of growth
- Distinction between audit history and user-facing timeline
- Achievements that do not directly affect trust scores

---

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Single evolving score | Violates Principle 4 |
| Delete negative history | Violates audit and dispute requirements |
| Product-owned timelines | Fragmented; not ecosystem-visible |
| Legacy as lifecycle stage | Legacy is decades-scale — distinct concept (see ADR-0004) |

---

## Decision Made

Foundation v1.1 adds:

- Lifecycle stages (Anonymous → Distinguished — **not** Legacy)
- Trust progression event registry
- Trust Timeline (curated positive milestones)
- Passport Journey sections
- Achievement and milestone registries
- Trust Engine input contract (interfaces only)
- Principle 11 in constitution

Code: `src/passport/evolution/`

Spec: [TRUST_EVOLUTION_MODEL.md](../TRUST_EVOLUTION_MODEL.md)

---

## Architectural Consequences

**Positive:**

- Passport tells a growth story
- Historical events remain auditable; summaries stay current
- Clear separation: Audit vs Timeline vs Journey

**Negative:**

- Multiple timeline concepts require careful documentation
- UI visualization deferred to implementation phase

---

## Related Documents

- [TRUST_EVOLUTION_MODEL.md](../TRUST_EVOLUTION_MODEL.md)
- [DIGITAL_TRUST_CONSTITUTION.md](../DIGITAL_TRUST_CONSTITUTION.md) — Principle 11

---

## Future Considerations

- Trust Engine consumes progression events and timeline
- Dashboard Journey and Timeline UI (Phase C)
- ADR-0007 Trust Engine Inputs
