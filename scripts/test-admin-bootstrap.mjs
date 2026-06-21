/**
 * Static + smoke checks for POST /api/admin/bootstrap authorization hardening.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`admin bootstrap test failed: ${message}`);
  process.exit(1);
}

const bootstrapApiSource = readFileSync(join(rootPath, "api/admin/bootstrap.js"), "utf8");
const bootstrapAccessSource = readFileSync(
  join(rootPath, "server/services/adminBootstrapAccess.js"),
  "utf8"
);
const bootstrapServiceSource = readFileSync(
  join(rootPath, "server/services/adminBootstrap.js"),
  "utf8"
);

assertCheck(
  bootstrapAccessSource.includes("ADMIN_BOOTSTRAP_SECRET") &&
    bootstrapAccessSource.includes('process.env.ADMIN_BOOTSTRAP_ENABLED') &&
    bootstrapAccessSource.includes('headers?.[ADMIN_BOOTSTRAP_SECRET_HEADER]') &&
    !bootstrapAccessSource.includes("CRON_SECRET") &&
    !bootstrapAccessSource.includes("DIAGNOSTICS_SECRET"),
  "adminBootstrapAccess must use dedicated secret and enable flag only"
);

assertCheck(
  bootstrapAccessSource.includes("admin_bootstrap_attempt") &&
    bootstrapAccessSource.includes("admin_bootstrap_denied") &&
    bootstrapAccessSource.includes("admin_bootstrap_success"),
  "adminBootstrapAccess must emit bootstrap observability events"
);

assertCheck(
  bootstrapApiSource.includes("requireAdminBootstrapAccess(req)") &&
    bootstrapApiSource.includes("sendAdminBootstrapAccessDenied") &&
    bootstrapApiSource.includes("logAdminBootstrapSuccess") &&
    !bootstrapApiSource.includes("CRON_SECRET") &&
    !bootstrapApiSource.includes("DIAGNOSTICS_SECRET") &&
    !bootstrapApiSource.includes("req.query.secret") &&
    !bootstrapApiSource.includes("body.secret") &&
    !bootstrapApiSource.includes("authorization") &&
    !bootstrapApiSource.includes("x-bamsignal-secret") &&
    !bootstrapApiSource.includes("result.password") &&
    !bootstrapApiSource.match(/res\.status\(200\)\.json\([\s\S]*password/),
  "bootstrap API must accept header secret only and never return passwords"
);

assertCheck(
  !bootstrapServiceSource.includes("password: generated") &&
    !/ok:\s*true,[\s\S]*password:/.test(bootstrapServiceSource),
  "bootstrap service must not return password in success payload"
);

const { isAdminBootstrapEnabled, hasAdminBootstrapSecret } = await import(
  "../server/services/adminBootstrapAccess.js"
);

process.env.ADMIN_BOOTSTRAP_ENABLED = "false";
assertCheck(!isAdminBootstrapEnabled(), "bootstrap must default to disabled");

process.env.ADMIN_BOOTSTRAP_ENABLED = "true";
process.env.ADMIN_BOOTSTRAP_SECRET = "bootstrap-test-secret";
assertCheck(
  hasAdminBootstrapSecret({ headers: { "x-admin-bootstrap-secret": "bootstrap-test-secret" } }),
  "matching x-admin-bootstrap-secret must authorize"
);
assertCheck(
  !hasAdminBootstrapSecret({ headers: { "x-admin-bootstrap-secret": "wrong-secret" } }),
  "wrong x-admin-bootstrap-secret must not authorize"
);
assertCheck(
  !hasAdminBootstrapSecret({ headers: { authorization: "Bearer bootstrap-test-secret" } }),
  "Authorization bearer must not authorize bootstrap"
);
assertCheck(
  !hasAdminBootstrapSecret({ headers: { "x-bamsignal-secret": "bootstrap-test-secret" } }),
  "legacy x-bamsignal-secret header must not authorize bootstrap"
);

const port = Number(process.env.SMOKE_PORT || process.env.ADMIN_BOOTSTRAP_SMOKE_PORT || 39454);
process.env.PORT = String(port);
delete process.env.ADMIN_BOOTSTRAP_ENABLED;
delete process.env.ADMIN_BOOTSTRAP_SECRET;

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
  throw new Error("server did not become ready for admin bootstrap smoke");
}

async function postBootstrap(baseUrl, options = {}) {
  const { query = "", headers = {}, body } = options;
  const url = `${baseUrl}/api/admin/bootstrap${query}`;
  const init = { method: "POST", headers: { ...headers } };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  return fetch(url, init);
}

try {
  await import("../server/production.js");
  const baseUrl = `http://127.0.0.1:${port}`;

  await waitForServer(baseUrl);

  const disabledResponse = await postBootstrap(baseUrl);
  assertCheck(
    disabledResponse.status === 404,
    `bootstrap when disabled must return 404 (got ${disabledResponse.status})`
  );
  const disabledPayload = await disabledResponse.json();
  assertCheck(
    disabledPayload?.error === "not_found",
    "bootstrap when disabled must return not_found"
  );

  process.env.ADMIN_BOOTSTRAP_ENABLED = "true";
  process.env.ADMIN_BOOTSTRAP_SECRET = "bootstrap-test-secret";
  process.env.SUPABASE_URL = process.env.SUPABASE_URL || "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJtestbootstrapfakekey1234567890";

  const originalFetch = globalThis.fetch;

  const querySecretResponse = await postBootstrap(baseUrl, {
    query: "?secret=bootstrap-test-secret"
  });
  assertCheck(
    querySecretResponse.status === 404,
    `query secret must be rejected (got ${querySecretResponse.status})`
  );

  const bodySecretResponse = await postBootstrap(baseUrl, {
    body: { secret: "bootstrap-test-secret" }
  });
  assertCheck(
    bodySecretResponse.status === 404,
    `body secret must be rejected (got ${bodySecretResponse.status})`
  );

  const authSecretResponse = await postBootstrap(baseUrl, {
    headers: { authorization: "Bearer bootstrap-test-secret" }
  });
  assertCheck(
    authSecretResponse.status === 404,
    `Authorization header must be rejected (got ${authSecretResponse.status})`
  );

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("/auth/v1/admin/users")) {
      if (init?.method === "POST") {
        return new Response(JSON.stringify({ id: "bootstrap-user-id" }), { status: 200 });
      }
      if (init?.method === "PUT") {
        return new Response(JSON.stringify({ id: "bootstrap-user-id" }), { status: 200 });
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    }
    return originalFetch(input, init);
  };

  const authorizedResponse = await postBootstrap(baseUrl, {
    headers: { "x-admin-bootstrap-secret": "bootstrap-test-secret" },
    body: { email: "ops@bamsignal.com", password: "known-bootstrap-password" }
  });

  globalThis.fetch = originalFetch;

  assertCheck(
    authorizedResponse.status === 200,
    `header secret must authorize bootstrap (got ${authorizedResponse.status})`
  );
  const authorizedPayload = await authorizedResponse.json();
  assertCheck(authorizedPayload?.ok === true, "authorized bootstrap must return ok:true");
  assertCheck(
    !("password" in authorizedPayload),
    "authorized bootstrap must not return password"
  );
  assertCheck(
    !JSON.stringify(authorizedPayload).includes("known-bootstrap-password"),
    "authorized bootstrap response must not leak password"
  );

  console.log("admin bootstrap tests ok");
  process.exit(0);
} catch (error) {
  console.error("admin bootstrap tests failed:", error);
  process.exit(1);
}
