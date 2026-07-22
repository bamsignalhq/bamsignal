# ADR-0002: SKL Passport Identifier

**Status:** Accepted  
**Date:** 2026  
**Version Introduced:** Foundation v1.0

---

## Decision

Adopt **`SKL-XXXX-XXXX`** as the immutable individual Passport identifier format, where **`SKL` = Stankings Legacy**.

---

## Context

Every human receives exactly one Passport ID, bound forever to an identity anchor. The identifier must be cryptographically random, human-readable, and namespace-extensible for future Passport types (business, organization, government, agent).

---

## Problem

Passport IDs must be:

- Unique and immutable
- Distinct from product-specific user IDs
- Extensible without breaking existing IDs
- Meaningful at the ecosystem level (Legacy philosophy)

---

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| UUID only | Not human-friendly; no namespace semantics |
| Product-prefixed IDs (BS-, BR-) | Tied to single product; violates ecosystem-first |
| Sequential numeric IDs | Predictable; privacy and enumeration risk |
| Email/phone as ID | Mutable; not identity-anchored |

---

## Decision Made

- Format: `SKL-XXXX-XXXX` (4+4 alphanumeric, secure alphabet)
- Prefix registry: SKL active; SKB, SKO, SKG, SKA reserved
- Provisional dev `STP-*` auto-upgrades to `SKL-*` on bind
- Immutable once bound — never reassigned

Code: `src/passport/id/`, `PASSPORT_PREFIX_REGISTRY`

Spec: [PASSPORT_IDENTIFIER_STANDARD.md](../PASSPORT_IDENTIFIER_STANDARD.md)

---

## Architectural Consequences

**Positive:**

- Namespace encodes lifelong Legacy vision
- Reserved prefixes enable future Passport types without migration
- Single canonical ID across all products

**Negative:**

- Prefix semantics require documentation discipline
- Cross-namespace linking (SKL ↔ SKB) is future work

---

## Related Documents

- [PASSPORT_IDENTIFIER_STANDARD.md](../PASSPORT_IDENTIFIER_STANDARD.md)
- [LEGACY_ARCHITECTURE.md](../LEGACY_ARCHITECTURE.md)

---

## Future Considerations

- Business Passport (SKB) linking to individual SKL
- Organization Passport (SKO) institutional identifiers
- Government Passport (SKG) authorized attestation namespaces
