/**
 * Static + smoke checks for /api/member/data server-side auth.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startProductionServer } from "../shared/startProductionServer.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`member data auth test failed: ${message}`);
  process.exit(1);
}

const memberDataSource = readFileSync(join(rootPath, "api/member/data.js"), "utf8");
const memberAuthSource = readFileSync(join(rootPath, "server/services/memberAuth.js"), "utf8");
const memberDataClient = readFileSync(join(rootPath, "src/services/memberData.ts"), "utf8");
const discoverClient = readFileSync(join(rootPath, "src/services/discoverProfiles.ts"), "utf8");
const contactClient = readFileSync(join(rootPath, "src/services/contactExchange.ts"), "utf8");
const trustClient = readFileSync(join(rootPath, "src/services/memberTrust.ts"), "utf8");
const premiumClient = readFileSync(join(rootPath, "src/services/premiumStatus.ts"), "utf8");
const memberApiAuthClient = readFileSync(join(rootPath, "src/utils/memberApiAuth.ts"), "utf8");

assertCheck(
  memberAuthSource.includes("export const PUBLIC_MEMBER_DATA_ACTIONS") &&
    memberAuthSource.includes("export async function requireMemberAuth") &&
    memberAuthSource.includes('error: "not_authorized"') &&
    memberAuthSource.includes("hasBodyIdentityMismatch"),
  "memberAuth helper must define public actions, requireMemberAuth, and mismatch rejection"
);

assertCheck(
  memberDataSource.includes("requireMemberAuth(req, body)") &&
    memberDataSource.includes("PUBLIC_MEMBER_DATA_ACTIONS") &&
    !memberDataSource.includes("resolveRequestIdentity"),
  "member data handler must use requireMemberAuth and not resolve body identity"
);

assertCheck(
  memberDataSource.includes('action === "pull"') &&
    memberDataSource.indexOf("requireMemberAuth(req, body)") <
      memberDataSource.indexOf('action === "pull"'),
  "pull must run after requireMemberAuth"
);

assertCheck(
  memberDataSource.includes('action === "profile-by-id"') &&
    memberDataSource.indexOf('action === "profile-by-id"') <
      memberDataSource.indexOf("requireMemberAuth(req, body)"),
  "profile-by-id must stay public (before auth gate)"
);

assertCheck(
  memberDataSource.includes('action === "subscription-catalog"') &&
    memberDataSource.indexOf('action === "subscription-catalog"') <
      memberDataSource.indexOf("requireMemberAuth(req, body)"),
  "subscription-catalog must stay public (before auth gate)"
);

for (const [label, source] of [
  ["memberData.ts", memberDataClient],
  ["discoverProfiles.ts", discoverClient],
  ["contactExchange.ts", contactClient],
  ["memberTrust.ts", trustClient],
  ["premiumStatus.ts", premiumClient]
]) {
  assertCheck(
    source.includes("memberApiHeaders"),
    `${label} must attach bearer token via memberApiHeaders`
  );
}

assertCheck(
  memberApiAuthClient.includes("supabase.auth.getSession") &&
    memberApiAuthClient.includes('headers.Authorization = `Bearer ${token}`'),
  "memberApiAuth must read Supabase session access_token"
);

const { hasBodyIdentityMismatch } = await import("../server/services/memberAuth.js");
assertCheck(
  hasBodyIdentityMismatch({ email: "other@example.com" }, { email: "member@example.com" }),
  "mismatched body email must be detected"
);
assertCheck(
  !hasBodyIdentityMismatch({ email: "member@example.com" }, { email: "member@example.com" }),
  "matching body email must be allowed for legacy compatibility"
);

const port = Number(process.env.SMOKE_PORT || process.env.MEMBER_AUTH_SMOKE_PORT || 39452);
process.env.PORT = String(port);

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not become ready for member data auth smoke");
}

try {
  await startProductionServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);

  const protectedResponse = await fetch(`${baseUrl}/api/member/data?action=pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "attacker@example.com", phone: "8000000000" })
  });
  assertCheck(
    protectedResponse.status === 401,
    `pull without Authorization must return 401 (got ${protectedResponse.status})`
  );
  const protectedPayload = await protectedResponse.json();
  assertCheck(
    protectedPayload?.error === "not_authorized",
    "pull without Authorization must return generic not_authorized error"
  );

  const unknownResponse = await fetch(`${baseUrl}/api/member/data?action=__unknown_action__`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  assertCheck(
    unknownResponse.status === 401,
    `unknown protected action without token must return 401 (got ${unknownResponse.status})`
  );

  const publicResponse = await fetch(`${baseUrl}/api/member/data?action=subscription-catalog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  assertCheck(
    publicResponse.status === 200,
    `subscription-catalog must work without token (got ${publicResponse.status})`
  );

  console.log("member data auth tests ok");
  process.exit(0);
} catch (error) {
  console.error("member data auth tests failed:", error);
  process.exit(1);
}
