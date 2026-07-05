# Messaging recovery runbook

**Scope:** Member chats, signals, message persistence, contact exchange.

---

## Symptoms

- Messages not sending or not appearing for recipient
- Signals stuck in pending
- Chat list empty but matches exist locally

---

## Health checks

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://bamsignal.com/ready
```

`/ready` database must be true — messaging is Postgres-backed.

---

## Investigation

1. Member report: match ID, approximate time, client (web/native).
2. Coolify logs: `persist_message_failed`, `member_data_error`.
3. Database:

   ```sql
   -- Recent messages for match (schema may vary by migration version)
   select * from member_messages
   where match_id = '...'
   order by created_at desc limit 20;
   ```

4. Check rate limits / abuse blocks for sender `user_id`.

---

## Scenario A — Send fails with 503

**Cause:** Database unreachable or migration incomplete.

**Recovery:** Follow [deployment-recovery.md](./deployment-recovery.md) until `/ready` → 200.

---

## Scenario B — Message saved server-side but not visible client-side

**Cause:** Client cache / offline state.

**Recovery:**

1. Ask member to pull-to-refresh or re-open chat.
2. Native: background sync may need network — check `offlineMemberCache` not stale.
3. If server has message but client never will — support documents known limitation.

---

## Scenario C — Signal not delivered

1. Check `sendSignalRemote` / signal API response.
2. Verify recipient not blocked.
3. Premium / phone verification gates per product rules.

---

## Verification

- [ ] Send test message between two test accounts
- [ ] Signal send + accept flow
- [ ] Error rate baseline in logs

**Escalation:** [support-escalation.md](./support-escalation.md)
