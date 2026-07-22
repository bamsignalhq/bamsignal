# Stankings Digital Trust Passport — Identifier Standard

**Version:** 1.0  
**Status:** Permanent platform contract  
**Product:** Stankings Digital Trust Passport  
**Credential type:** Passport ID

---

## Philosophy

The Passport ID is the **public identifier** for a Stankings Digital Trust Passport — comparable to a vehicle registration number or company registration number.

- Users may share their Passport ID freely.
- Trust data, product details, and personal records remain **protected** behind consent and authorization.
- The ID identifies the Passport; it does not expose underlying trust or personal data.

**Product name (official):** Stankings Digital Trust Passport  
**Short form (documentation):** Passport  
**Credential type:** Passport ID  
**Never refer to it as:** Internal ID, User ID, Account ID

---

## Canonical format

```text
SKL-4A7D-9XQ2
```

Pattern:

```text
SKL-XXXX-XXXX
```

| Component | Rule |
|-----------|------|
| Prefix | `SKL` — Stankings Legacy (individual Passport namespace) |
| Segments | Two groups of four uppercase alphanumeric characters |
| Separator | Hyphen between each component |
| Case | Case-insensitive for lookup; **stored and displayed in uppercase** |

Implementation: `src/passport/id/format.ts`, `src/passport/id/generate.ts`

---

## Prefix meaning — SKL

**SKL** officially stands for:

### Stankings Legacy

The individual human Stankings Digital Trust Passport — one person, one Passport, lifelong.

---

## Namespace registry (platform contract)

Official reserved namespaces — permanent platform contract as of Foundation v1.0.

| Prefix | Passport Type | Status | Example |
|--------|---------------|--------|---------|
| **SKL** | Individual Digital Trust Passport | **Active** | `SKL-4A7D-9XQ2` |
| **SKB** | Business Digital Trust Passport | Reserved | `SKB-7Q8M-TP42` |
| **SKO** | Organization Digital Trust Passport | Reserved | `SKO-M7X4-RP82` |
| **SKG** | Government Digital Trust Passport | Reserved | `SKG-KP92-WQ84` |
| **SKA** | Autonomous Agent Digital Trust Passport | Reserved | `SKA-TM84-QP73` |

Implementation: `PASSPORT_PREFIX_REGISTRY` in `src/passport/id/prefixes.ts`

Only **SKL** may be generated in v1.0. Reserved prefixes require architectural review before activation.

---

## Character set

Newly generated IDs use a **reduced alphabet** to reduce transcription errors:

```text
23456789ABCDEFGHJKLMNPQRSTUVWXYZ
```

**Excluded from generation:** `I`, `O`, `1`, `0`

Identifier space: **32⁸ ≈ 1.1 trillion** IDs per prefix.

Parsing helpers normalize common human transcription errors when validating SKL IDs.

---

## Validation rules

| Rule | Detail |
|------|--------|
| Prefix | Must be `SKL` for individual Passports in v1.0 |
| Segment length | Exactly 4 characters each |
| Charset | Reduced alphabet (see above) |
| Lookup | Case-insensitive; normalize before compare |

Helpers:

- `isPassportId()` — validates SKL-XXXX-XXXX
- `validatePassportId()` — structured validation result
- `normalizePassportId()` — uppercase + transcription normalization
- `formatPassportId()` — display formatting
- `parsePassportId()` — prefix and segment extraction

---

## Generation

New individual Passports receive:

```text
SKL-XXXX-XXXX
```

Requirements:

- **Cryptographically secure randomness** (`crypto.getRandomValues`)
- Reduced alphabet output
- Collision guard against registry (`generateUniquePassportId`)
- **Immutable** once assigned to an identity anchor

The identity anchor maps to the ID in the registry; the ID itself carries no PII.

---

## Collision considerations

| Factor | Value |
|--------|-------|
| Space per prefix | 32⁸ ≈ 1.1 × 10¹² |
| Generation | Uniform random from secure RNG |
| Registry guard | Re-roll on collision (extremely unlikely) |
| Assignment | One anchor → one ID, forever |

---

## Display guidelines

Whenever a Passport is shown in UI or documentation:

```text
Stankings Digital Trust Passport

Passport ID
SKL-4A7D-9XQ2
```

- Use the full product name: **Stankings Digital Trust Passport**
- Label the credential: **Passport ID**
- Display uppercase formatted ID via `formatPassportId()`

---

## Future Passport types (reserved)

Individual:

```text
SKL-4A7D-9XQ2
```

Business:

```text
SKB-7Q8M-TP42
```

Organization:

```text
SKO-M7X4-RP82
```

Government:

```text
SKG-KP92-WQ84
```

Autonomous Agent:

```text
SKA-TM84-QP73
```

No implementation beyond **SKL** is required in v1.0.

---

## Development migration

Early development prototypes used a provisional `STP-*` format. That format is **retired**.

On next identity bind, any provisional `STP-*` entry in `stankings-passport-id-registry-v1` is **automatically upgraded** to a canonical `SKL-*` Passport ID for the same anchor.

---

## Future expansion strategy

1. **Activate a reserved prefix** — update `PASSPORT_PREFIX_REGISTRY` status and generation rules
2. **Version bump** — document in this file and `CONSTITUTION_VERSION` if governance impact
3. **Cross-product review** — BayRight, Yike, and future contributors must acknowledge prefix activation
4. **Never reuse prefixes** — reserved namespaces are permanent

---

## Code map

| Concern | Module |
|---------|--------|
| Namespace registry | `src/passport/id/prefixes.ts` |
| Format / validate / parse | `src/passport/id/format.ts` |
| Secure generation | `src/passport/id/generate.ts` |
| Anchor registry | `src/passport/id/registry.ts` |
| Public exports | `src/passport/id/index.ts` |
| Regression tests | `scripts/test-passport-id.mjs` |

---

## Related documents

- [DIGITAL_TRUST_CONSTITUTION.md](./DIGITAL_TRUST_CONSTITUTION.md)
- [STANKINGS_PASSPORT.md](./STANKINGS_PASSPORT.md)
- [IDENTITY_ARCHITECTURE.md](./IDENTITY_ARCHITECTURE.md)
