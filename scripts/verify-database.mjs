#!/usr/bin/env node
import dotenv from "dotenv";
import {
  fetchMemberBundle,
  findAppUserIdentity,
  getDatabaseStatus,
  initDatabase,
  persistMatch,
  persistMessage,
  persistReport,
  persistSignal,
  upsertAppUserIdentity
} from "../server/db.js";

dotenv.config();

const testEmail = `qa-${Date.now()}@bamsignal.com`;
const testPhone = "08099990001";

async function main() {
  const init = await initDatabase();
  const status = getDatabaseStatus();

  console.log(`Database status: ${status}`);
  if (!init.ok) {
    console.error("Database verification failed:", init.reason || "unknown");
    process.exit(1);
  }

  const user = await upsertAppUserIdentity({
    email: testEmail,
    phone: testPhone,
    name: "QA Verify"
  });
  if (!user?.id) throw new Error("User persistence failed");

  const signal = await persistSignal({
    email: testEmail,
    phone: testPhone,
    targetProfileId: "profile-qa-1",
    signalType: "signal"
  });
  if (!signal?.id) throw new Error("Signal persistence failed");

  const match = await persistMatch({
    email: testEmail,
    phone: testPhone,
    match: {
      id: "m-profile-qa-1",
      profileId: "profile-qa-1",
      name: "QA Match",
      photo: "/showcase/hero-lagos-young-professionals-01.webp",
      matchedAt: new Date().toISOString(),
      city: "Lagos"
    }
  });
  if (!match?.id) throw new Error("Match persistence failed");

  const message = await persistMessage({
    email: testEmail,
    phone: testPhone,
    threadId: match.id,
    message: {
      id: `msg-${Date.now()}`,
      from: "me",
      text: "QA persistence check",
      at: new Date().toISOString()
    }
  });
  if (!message?.id) throw new Error("Message persistence failed");

  const report = await persistReport({
    email: testEmail,
    phone: testPhone,
    report: {
      profileId: "profile-qa-1",
      reason: "other",
      details: "QA verify",
      at: new Date().toISOString()
    }
  });
  if (!report?.id) throw new Error("Report persistence failed");

  const bundle = await fetchMemberBundle({ email: testEmail, phone: testPhone });
  const storedUser = await findAppUserIdentity({ email: testEmail, phone: testPhone });

  console.log("Verified:");
  console.log(`- Users: ${storedUser?.email === testEmail ? "ok" : "fail"}`);
  console.log(`- Signals: ${bundle?.signalsSent >= 1 ? "ok" : "fail"}`);
  console.log(`- Matches: ${bundle?.matches?.length >= 1 ? "ok" : "fail"}`);
  console.log(`- Messages: ${Object.keys(bundle?.chats || {}).length >= 1 ? "ok" : "fail"}`);
  console.log(`- Reports: ${bundle?.reports?.length >= 1 ? "ok" : "fail"}`);
  console.log("Database connected successfully");
}

main().catch((error) => {
  console.error("[verify-database]", error.message || error);
  process.exit(1);
});
