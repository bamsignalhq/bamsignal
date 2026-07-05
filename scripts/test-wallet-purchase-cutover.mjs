#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const app = read("src/App.tsx");
assert(app.includes("WalletExperienceSheet"), "App uses wallet sheet");
assert(!app.includes("startPlanPayment"), "legacy premium checkout removed from App");
assert(!app.includes("startBoostPayment"), "legacy boost checkout removed from App");
assert(app.includes("openWalletPurchase"), "wallet purchase opener");

const flow = read("src/services/walletPurchaseFlow.ts");
assert(flow.includes("executeWalletPurchase"), "wallet purchase execution");
assert(flow.includes("startBayGoldFunding"), "baygold funding");
assert(flow.includes("completeWalletFundingReturn"), "funding resume");

const walletApi = read("api/wallet/index.js");
assert(walletApi.includes("initialize-funding"), "wallet funding initialize");
assert(walletApi.includes("purchase-gate"), "purchase gate proxy");

const verify = read("api/paystack/verify.js");
assert(verify.includes("initialize-baygold"), "baygold initialize action");
assert(verify.includes("completeWalletFundingFulfillment"), "wallet funding verify");

const profile = read("src/pages/ProfilePage.tsx");
assert(profile.includes("WalletExperienceSheet"), "profile fast connection wallet");

const chats = read("src/pages/ChatsPage.tsx");
assert(chats.includes("WalletExperienceSheet"), "chats quickie wallet");

const fortress = read("server/services/paymentFortress.js");
assert(fortress.includes("resolveBayGoldFundingIntent"), "baygold funding intent");
assert(fortress.includes("wallet_funding"), "wallet funding metadata");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: BamSignal wallet purchase cutover static checks");
