import { DATA_INTEGRITY_CERT_DOMAINS } from "../../../shared/dataIntegrityCertificationDomains.mjs";

function domainResult(id, label, partial = {}) {
  return {
    id,
    label,
    objectsScanned: 0,
    objectsRepaired: 0,
    objectsRequiringReview: 0,
    criticalIssues: [],
    warnings: [],
    passed: true,
    ...partial
  };
}

function critical(domain, id, title, detail, count = 1) {
  return {
    id,
    domainId: domain,
    title,
    detail,
    severity: "critical",
    count
  };
}

function warning(domain, id, title, detail, count = 1) {
  return {
    id,
    domainId: domain,
    title,
    detail,
    severity: "warning",
    count
  };
}

async function tableExists(pool, tableName) {
  const result = await pool.query(
    `select 1 from information_schema.tables
     where table_schema = 'public' and table_name = $1 limit 1`,
    [tableName]
  );
  return result.rowCount > 0;
}

async function countRows(pool, tableName) {
  if (!(await tableExists(pool, tableName))) return 0;
  const result = await pool.query(`select count(*)::int as count from ${tableName}`);
  return result.rows[0]?.count ?? 0;
}

export async function runDatabaseIntegrityChecks(pool) {
  const domains = [];

  const membersScanned = await countRows(pool, "app_users");
  const members = domainResult("members", "Members", { objectsScanned: membersScanned });
  if (membersScanned > 0) {
    const dupKeys = await pool.query(
      `select user_key, count(*)::int as c from app_users
       where user_key is not null and user_key <> ''
       group by user_key having count(*) > 1 limit 20`
    );
    if (dupKeys.rowCount > 0) {
      members.criticalIssues.push(
        critical("members", "dup-user-key", "Duplicate member user_key", `${dupKeys.rowCount} duplicate user_key value(s).`, dupKeys.rowCount)
      );
    }
    const missingTs = await pool.query(
      `select count(*)::int as c from app_users where created_at is null`
    );
    if (missingTs.rows[0]?.c > 0) {
      members.criticalIssues.push(
        critical("members", "missing-created-at", "Missing timestamps", `${missingTs.rows[0].c} member(s) without created_at.`, missingTs.rows[0].c)
      );
    }
  }
  domains.push(members);

  const profilesScanned = await countRows(pool, "app_member_profiles");
  const profiles = domainResult("profiles", "Profiles", { objectsScanned: profilesScanned });
  if (profilesScanned > 0) {
    const dupUsernames = await pool.query(
      `select lower(username) as u, count(*)::int as c from app_member_profiles
       where username is not null and username <> ''
       group by lower(username) having count(*) > 1 limit 20`
    );
    if (dupUsernames.rowCount > 0) {
      profiles.criticalIssues.push(
        critical("profiles", "dup-username", "Duplicate usernames", `${dupUsernames.rowCount} duplicate username(s).`, dupUsernames.rowCount)
      );
    }
    const orphanProfiles = await pool.query(
      `select count(*)::int as c from app_member_profiles p
       where p.user_key is not null and p.user_key <> ''
         and not exists (select 1 from app_users u where u.user_key = p.user_key)`
    );
    if (orphanProfiles.rows[0]?.c > 0) {
      profiles.warnings.push(
        warning("profiles", "orphan-user-key", "Profiles without app_users row", `${orphanProfiles.rows[0].c} profile(s) lack matching app_users.user_key.`, orphanProfiles.rows[0].c)
      );
    }
    const badJson = await pool.query(
      `select count(*)::int as c from app_member_profiles
       where profile is null or jsonb_typeof(profile) <> 'object'`
    );
    if (badJson.rows[0]?.c > 0) {
      profiles.criticalIssues.push(
        critical("profiles", "corrupt-profile-json", "Corrupted profile JSON", `${badJson.rows[0].c} profile JSON object(s) invalid.`, badJson.rows[0].c)
      );
    }
  }
  domains.push(profiles);

  const photosScanned = await countRows(pool, "photo_reviews");
  const photos = domainResult("photos", "Photos", { objectsScanned: photosScanned });
  if (photosScanned > 0) {
    const dangling = await pool.query(
      `select count(*)::int as c from photo_reviews
       where photo_url is null or photo_url = ''`
    );
    if (dangling.rows[0]?.c > 0) {
      photos.warnings.push(
        warning("photos", "dangling-storage", "Dangling storage references", `${dangling.rows[0].c} photo review(s) missing photo_url.`, dangling.rows[0].c)
      );
    }
  }
  domains.push(photos);

  const signalsScanned = await countRows(pool, "app_signals");
  const signals = domainResult("signals", "Signals", { objectsScanned: signalsScanned });
  if (signalsScanned > 0) {
    const orphanSignals = await pool.query(
      `select count(*)::int as c from app_signals s
       where s.user_key is not null and s.user_key <> ''
         and not exists (select 1 from app_member_profiles p where p.user_key = s.user_key)`
    );
    if (orphanSignals.rows[0]?.c > 0) {
      signals.criticalIssues.push(
        critical("signals", "orphan-signals", "Orphaned signals", `${orphanSignals.rows[0].c} signal(s) reference unknown user_key.`, orphanSignals.rows[0].c)
      );
    }
  }
  domains.push(signals);

  const matchesScanned = await countRows(pool, "app_matches");
  const matches = domainResult("matches", "Matches", { objectsScanned: matchesScanned });
  if (matchesScanned > 0) {
    const orphanMatches = await pool.query(
      `select count(*)::int as c from app_matches m
       where m.user_key is not null and m.user_key <> ''
         and not exists (select 1 from app_member_profiles p where p.user_key = m.user_key)`
    );
    if (orphanMatches.rows[0]?.c > 0) {
      matches.criticalIssues.push(
        critical("matches", "orphan-matches", "Orphaned matches", `${orphanMatches.rows[0].c} match(es) reference unknown user_key.`, orphanMatches.rows[0].c)
      );
    }
  }
  domains.push(matches);

  const chatsScanned = await countRows(pool, "app_chat_threads");
  const chats = domainResult("chats", "Chats", { objectsScanned: chatsScanned });
  if (chatsScanned > 0) {
    const brokenChats = await pool.query(
      `select count(*)::int as c from app_chat_threads t
       where not exists (
         select 1 from app_matches m
         where m.id = t.match_id and m.user_key = t.user_key
       )`
    );
    if (brokenChats.rows[0]?.c > 0) {
      chats.criticalIssues.push(
        critical("chats", "broken-chat-fk", "Broken chat foreign keys", `${brokenChats.rows[0].c} chat thread(s) without matching match.`, brokenChats.rows[0].c)
      );
    }
  }
  domains.push(chats);

  const messagesScanned = await countRows(pool, "app_messages");
  const messages = domainResult("messages", "Messages", { objectsScanned: messagesScanned });
  if (messagesScanned > 0) {
    const orphanMessages = await pool.query(
      `select count(*)::int as c from app_messages msg
       where not exists (
         select 1 from app_chat_threads t
         where t.match_id = msg.thread_id and t.user_key = msg.user_key
       )`
    );
    if (orphanMessages.rows[0]?.c > 0) {
      messages.criticalIssues.push(
        critical("messages", "orphan-messages", "Orphaned messages", `${orphanMessages.rows[0].c} message(s) without chat thread.`, orphanMessages.rows[0].c)
      );
    }
  }
  domains.push(messages);

  const notificationsScanned = await countRows(pool, "payment_events");
  const notifications = domainResult("notifications", "Notifications", { objectsScanned: notificationsScanned });
  if (notificationsScanned > 0) {
    const badPayload = await pool.query(
      `select count(*)::int as c from payment_events
       where payload is null or jsonb_typeof(payload) <> 'object'`
    );
    if (badPayload.rows[0]?.c > 0) {
      notifications.warnings.push(
        warning("notifications", "bad-payload", "Invalid notification payload JSON", `${badPayload.rows[0].c} payment_event payload(s) invalid.`, badPayload.rows[0].c)
      );
    }
  }
  domains.push(notifications);

  const paymentsScanned = await countRows(pool, "payment_fulfillments");
  const payments = domainResult("payments", "Payments", { objectsScanned: paymentsScanned });
  if (paymentsScanned > 0) {
    const dupPayments = await pool.query(
      `select paystack_reference, count(*)::int as c from payment_fulfillments
       where paystack_reference is not null and paystack_reference <> ''
       group by paystack_reference having count(*) > 1 limit 20`
    );
    if (dupPayments.rowCount > 0) {
      payments.criticalIssues.push(
        critical("payments", "dup-payment-ref", "Duplicate payments", `${dupPayments.rowCount} duplicate paystack_reference value(s).`, dupPayments.rowCount)
      );
      payments.objectsRequiringReview += dupPayments.rowCount;
    }
  }
  domains.push(payments);

  const consultationsScanned = await countRows(pool, "member_introductions");
  const consultations = domainResult("consultations", "Consultations", { objectsScanned: consultationsScanned });
  if (consultationsScanned > 0) {
    const invalidIntro = await pool.query(
      `select count(*)::int as c from member_introductions i
       where not exists (select 1 from app_member_profiles p where p.id = i.introducer_profile_id)
          or not exists (select 1 from app_member_profiles p where p.id = i.target_profile_id)
          or not exists (select 1 from app_member_profiles p where p.id = i.recipient_profile_id)`
    );
    if (invalidIntro.rows[0]?.c > 0) {
      consultations.criticalIssues.push(
        critical("consultations", "broken-intro-fk", "Broken consultation references", `${invalidIntro.rows[0].c} introduction(s) with invalid profile FK.`, invalidIntro.rows[0].c)
      );
    }
  }
  domains.push(consultations);

  const journey = domainResult("journey-ids", "Journey IDs", { objectsScanned: 0 });
  if (await tableExists(pool, "concierge_members")) {
    journey.objectsScanned = await countRows(pool, "concierge_members");
    const dupJourney = await pool.query(
      `select journey_id, count(*)::int as c from concierge_members
       where journey_id is not null and journey_id <> ''
       group by journey_id having count(*) > 1 limit 20`
    );
    if (dupJourney.rowCount > 0) {
      journey.criticalIssues.push(
        critical("journey-ids", "dup-journey-id", "Duplicate journey IDs", `${dupJourney.rowCount} duplicate journey_id value(s).`, dupJourney.rowCount)
      );
    }
  }
  domains.push(journey);

  const reportsScanned = await countRows(pool, "app_reports");
  const reports = domainResult("reports", "Reports", { objectsScanned: reportsScanned });
  if (reportsScanned > 0) {
    const orphanReports = await pool.query(
      `select count(*)::int as c from app_reports r
       where r.user_key is not null and r.user_key <> ''
         and not exists (select 1 from app_member_profiles p where p.user_key = r.user_key)`
    );
    if (orphanReports.rows[0]?.c > 0) {
      reports.warnings.push(
        warning("reports", "orphan-reports", "Reports with unknown reporter", `${orphanReports.rows[0].c} report(s) from unknown user_key.`, orphanReports.rows[0].c)
      );
    }
  }
  domains.push(reports);

  const savedScanned = await countRows(pool, "saved_profiles");
  const savedProfiles = domainResult("saved-profiles", "Saved Profiles", { objectsScanned: savedScanned });
  if (savedScanned > 0) {
    const brokenSaved = await pool.query(
      `select count(*)::int as c from saved_profiles s
       where not exists (select 1 from app_member_profiles p where p.id = s.member_id)
          or not exists (select 1 from app_member_profiles p where p.id = s.saved_member_id)`
    );
    if (brokenSaved.rows[0]?.c > 0) {
      savedProfiles.criticalIssues.push(
        critical("saved-profiles", "broken-saved-fk", "Broken saved profile references", `${brokenSaved.rows[0].c} saved profile row(s) with invalid member FK.`, brokenSaved.rows[0].c)
      );
    }
  }
  domains.push(savedProfiles);

  const premiumScanned = await countRows(pool, "app_users");
  const premium = domainResult("premium-status", "Premium Status", { objectsScanned: premiumScanned });
  if (premiumScanned > 0) {
    const invalidPremium = await pool.query(
      `select count(*)::int as c from app_users
       where is_premium = true and (premium_until is null or premium_until < now())`
    );
    if (invalidPremium.rows[0]?.c > 0) {
      premium.warnings.push(
        warning("premium-status", "stale-premium", "Expired active premium flags", `${invalidPremium.rows[0].c} user(s) marked premium with expired/null premium_until.`, invalidPremium.rows[0].c)
      );
    }
  }
  domains.push(premium);

  const subscriptionsScanned = await countRows(pool, "subscription_events");
  const subscriptions = domainResult("subscriptions", "Subscriptions", { objectsScanned: subscriptionsScanned });
  if (subscriptionsScanned > 0) {
    const badSubPayload = await pool.query(
      `select count(*)::int as c from subscription_events
       where payload is null or jsonb_typeof(payload) <> 'object'`
    );
    if (badSubPayload.rows[0]?.c > 0) {
      subscriptions.criticalIssues.push(
        critical("subscriptions", "bad-sub-json", "Corrupted subscription JSON", `${badSubPayload.rows[0].c} subscription payload(s) invalid.`, badSubPayload.rows[0].c)
      );
    }
  }
  domains.push(subscriptions);

  const settingsScanned = await countRows(pool, "platform_settings");
  const featureFlags = domainResult("feature-flags", "Feature Flags", { objectsScanned: settingsScanned });
  const remoteConfig = domainResult("remote-config", "Remote Config", { objectsScanned: settingsScanned });
  if (settingsScanned > 0) {
    const badSettings = await pool.query(
      `select count(*)::int as c from platform_settings
       where value is null or jsonb_typeof(value) not in ('object', 'array', 'string', 'number', 'boolean')`
    );
    if (badSettings.rows[0]?.c > 0) {
      featureFlags.warnings.push(
        warning("feature-flags", "bad-settings-json", "Invalid platform_settings JSON", `${badSettings.rows[0].c} settings value(s) invalid.`, badSettings.rows[0].c)
      );
      remoteConfig.warnings.push(
        warning("remote-config", "bad-settings-json", "Invalid remote config JSON", `${badSettings.rows[0].c} settings value(s) invalid.`, badSettings.rows[0].c)
      );
    }
  }
  domains.push(featureFlags, remoteConfig);

  const auditScanned = await countRows(pool, "audit_logs");
  const auditLogs = domainResult("audit-logs", "Audit Logs", { objectsScanned: auditScanned });
  if (auditScanned > 0) {
    const missingAuditTs = await pool.query(
      `select count(*)::int as c from audit_logs where created_at is null`
    );
    if (missingAuditTs.rows[0]?.c > 0) {
      auditLogs.criticalIssues.push(
        critical("audit-logs", "missing-audit-ts", "Missing audit timestamps", `${missingAuditTs.rows[0].c} audit log(s) without created_at.`, missingAuditTs.rows[0].c)
      );
    }
  }
  domains.push(auditLogs);

  for (const entry of domains) {
    entry.passed = entry.criticalIssues.length === 0;
    entry.objectsRequiringReview +=
      entry.criticalIssues.length + entry.warnings.filter((item) => item.severity === "warning").length;
  }

  return domains;
}

export async function runStaticIntegrityChecks() {
  const { readFileSync, existsSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

  function read(rel) {
    return readFileSync(join(rootPath, rel), "utf8");
  }

  const warnings = [];
  const criticalIssues = [];

  const schemaSource = read("server/services/schemaVerification.js");
  for (const domain of DATA_INTEGRITY_CERT_DOMAINS) {
    if (!schemaSource.includes(`"${domain.table}"`) && domain.table !== "concierge_members") {
      warnings.push(
        warning(domain.id, `schema-${domain.table}`, `Schema registry gap`, `${domain.table} not in REQUIRED_SCHEMA_TABLES.`)
      );
    }
  }

  if (!existsSync(join(rootPath, "src/utils/dataIntegrityEngine.ts"))) {
    criticalIssues.push(
      critical("profiles", "engine-missing", "Data integrity engine missing", "src/utils/dataIntegrityEngine.ts not found.")
    );
  }

  return {
    mode: "static",
    objectsScanned: DATA_INTEGRITY_CERT_DOMAINS.length,
    criticalIssues,
    warnings
  };
}
