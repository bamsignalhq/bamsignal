# ADR-0004: Legacy Architecture

**Status:** Accepted  
**Date:** 2026  
**Version Introduced:** Foundation v1.2

---

## Decision

Introduce **Legacy** as the final permanent layer of the Passport architecture — distinct from Lifecycle, Trust Timeline, and Achievements — governed by **Principle 12: Legacy Is Built**.

---

## Context

After decades of trustworthy participation, users build more than trust — they build **Legacy**. Legacy represents stewardship and sustained contribution, not status, score, or lifecycle stage.

---

## Problem

Without a Legacy layer:

- Long-horizon contribution has no architectural home
- Legacy would be conflated with trust scores or lifecycle stages
- SKL (Stankings Legacy) namespace philosophy lacks structural expression
- Decades-scale narrative cannot be separated from year-scale trust evolution

---

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Legacy as lifecycle stage | Lifecycle is months-to-years; Legacy is decades |
| Legacy as trust dimension | Violates Principle 4; Legacy is not a score |
| Legacy as achievement badge | Achievements do not carry decades-scale weight |
| Purchasable Legacy status | Violates Principle 12 |

---

## Decision Made

Foundation v1.2 adds:

- Principle 12 — Legacy Is Built
- Legacy Contributions (11 dimensions — not trust dimensions)
- Legacy Badges (recognition, not achievements)
- Legacy Timeline (decades-scale narrative)
- Legacy API contracts (interfaces only)
- Lifecycle ends at **Distinguished** — Legacy is separate

Code: `src/passport/legacy/`

Spec: [LEGACY_ARCHITECTURE.md](../LEGACY_ARCHITECTURE.md)

---

## Architectural Consequences

**Positive:**

- Complete architecture stack through Legacy
- Clear prohibitions: no purchase, inheritance, or direct calculation
- Foundation architecturally complete for implementation phases

**Negative:**

- Legacy emergence logic deferred to server-side future work
- Human review mandatory for recognition — operational cost

---

## Related Documents

- [LEGACY_ARCHITECTURE.md](../LEGACY_ARCHITECTURE.md)
- [PASSPORT_IDENTIFIER_STANDARD.md](../PASSPORT_IDENTIFIER_STANDARD.md)
- [DIGITAL_TRUST_CONSTITUTION.md](../DIGITAL_TRUST_CONSTITUTION.md) — Principle 12

---

## Future Considerations

- Legacy emergence from validated signals over decades
- Legacy Timeline UI (Phase C)
- Cross-reference with Trust Engine inputs (never direct calculation)
