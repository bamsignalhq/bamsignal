# Support Workflow

## Channels

| Channel | Surface | Owner |
|---------|---------|-------|
| In-app support | Member settings → help paths | Support team |
| Admin Support Center | `/hard/support` | Support + Operations |
| Public help | `/help`, Support Center pages | Content + Support |
| Safety reports | Report/block flows → moderation | Safety team |

## Admin Support Center (`/hard/support`)

Permissions: `ManageOperations`, Support roles (see `permissions.ts`).

Typical workflow:

1. **Triage** incoming tickets — assign severity and category.
2. **Verify** member identity via admin tools (never share PINs).
3. **Resolve** or escalate to Operations / Safety / Engineering.
4. **Close** with internal note; member-facing copy must not expose admin jargon.

## Member-facing rules

- Login support: username + PIN only — never ask for email password.
- Payment issues: preserve `paymentReturnPath`; verify Paystack reference.
- Photo issues: upload-first policy unless true upload failure.

## Escalation matrix

| Issue type | Escalate to |
|------------|-------------|
| Payment not fulfilled | Operations + `payment-recovery` runbook |
| Harassment / safety | `/hard/safety`, moderation queue |
| Account lockout abuse | Security + rate-limit review |
| Bug / outage | Engineering + incident process |
| Concierge journey | Signal Concierge Operations (`/hard/concierge/operations`) |

## SLA guidance

- P1 member-visible outage: communicate via status channel when platform-wide.
- Individual tickets: target first response < 24h business hours at launch.
