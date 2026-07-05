# Notification recovery runbook

**Scope:** Transactional email (Resend), push (FCM), WhatsApp (SendChamp), HQ Notification Platform.

---

## Readiness

`/ready` includes `signupEmail` — if false, signup and purchase emails may fail.

```bash
curl -s -H "x-diagnostics-secret: $DIAGNOSTICS_SECRET" \
  "https://bamsignal.com/ready?details=1" | jq .signupEmail
```

---

## Email (Resend)

### Symptoms

- Signup OTP not received
- Purchase confirmation missing
- `email_send_failed` in logs

### Recovery

1. Verify `RESEND_API_KEY` in Coolify (name only in docs).
2. Resend dashboard → API logs for bounces/blocks.
3. Check `payment_events` / fulfillment `email_sent_at` for purchase emails.
4. Replay: safe to resend OTP via app resend (rate limited).

---

## Push notifications

1. Verify FCM credentials and native app build.
2. Check `push_registration_failed` logs.
3. Member may need re-enable in device settings.

---

## HQ platform notifications

Wallet purchases and BayGold events may notify via Stankings Platform:

- `POST /api/platform/bamsignal/notify`
- Requires platform integration enabled

If platform notify skipped, BamSignal local fulfillment still applies — check both paths.

---

## Alert thresholds

See [docs/operations/monitoring/alerts.md](../operations/monitoring/alerts.md) — Notification section.

---

## Verification

- [ ] `/ready` signupEmail true
- [ ] Test signup OTP to founder test inbox
- [ ] Test purchase confirmation after wallet spend

**Related:** [incident-response.md](./incident-response.md)
