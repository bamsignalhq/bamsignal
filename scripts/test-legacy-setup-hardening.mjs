#!/usr/bin/env node
/**
 * Static + smoke checks for /api/hard/setup header-only secret hardening.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`legacy setup hardening test failed: ${message}`);
  process.exit(1);
}

const setupApiSource = readFileSync(join(rootPath, "api/hard/setup.js"), "utf8");
const setupAccessSource = readFileSync(
  join(rootPath, "server/services/consoleSetupAccess.js"),
  "utf8"
);
const setupServiceSource = readFileSync(
  join(rootPath, "server/services/consoleSetup.js"),
  "utf8"
);
const consoleSetupClientSource = readFileSync(
  join(rootPath, "src/services/consoleSetup.ts"),
  "utf8"
);

assertCheck(
  setupAccessSource.includes("LEGACY_SETUP_ENABLED") &&
    setupAccessSource.includes("LEGACY_SETUP_SECRET") &&
    setupAccessSource.includes("x-setup-secret") &&
    setupAccessSource.includes("validateSetupHeader") &&
    setupAccessSource.includes("isSetupEnabled") &&
    !setupAccessSource.includes("CRON_SECRET"),
  "consoleSetupAccess must use dedicated enable flag and header-only secret"
);

assertCheck(
  setupApiSource.includes("requireLegacySetupEnabled") &&
    setupApiSource.includes("validateSetupHeader") &&
    setupApiSource.includes("hasForbiddenSetupSecretChannel") &&
    setupApiSource.includes("sendLegacySetupAccessDenied") &&
    !setupApiSource.includes("req.query.secret") &&
    !setupApiSource.includes("x-bamsignal-secret") &&
    !setupApiSource.includes("body.setupSecret") &&
    !setupApiSource.includes("Invalid setup secret"),
  "hard setup API must reject non-header secrets and return generic errors"
);

assertCheck(
  !setupServiceSource.includes("setupSecret") &&
    !setupServiceSource.includes("CRON_SECRET") &&
    !setupServiceSource.includes("already exists"),
  "console setup service must not accept body secrets or reveal setup state"
);

assertCheck(
  consoleSetupClientSource.includes('"x-setup-secret"') &&
    consoleSetupClientSource.includes("const { setupSecret, ...body } = input"),
  "console setup client must send secret via header only"
);

const {
  isSetupEnabled,
  validateSetupHeader,
  hasForbiddenSetupSecretChannel
} = await import("../server/services/consoleSetupAccess.js");

process.env.LEGACY_SETUP_ENABLED = "false";
assertCheck(!isSetupEnabled(), "legacy setup must default to disabled");

process.env.LEGACY_SETUP_ENABLED = "true";
process.env.LEGACY_SETUP_SECRET = "legacy-setup-test-secret";
assertCheck(
  validateSetupHeader({ headers: { "x-setup-secret": "legacy-setup-test-secret" } }).ok,
  "matching x-setup-secret header must authorize"
);
assertCheck(
  !validateSetupHeader({ headers: { "x-setup-secret": "wrong-secret" } }).ok,
  "wrong x-setup-secret header must not authorize"
);
assertCheck(
  hasForbiddenSetupSecretChannel({ query: { secret: "legacy-setup-test-secret" } }),
  "query secret channel must be detected"
);
assertCheck(
  hasForbiddenSetupSecretChannel({ body: { setupSecret: "legacy-setup-test-secret" } }),
  "body setupSecret channel must be detected"
);
assertCheck(
  hasForbiddenSetupSecretChannel({ headers: { "x-bamsignal-secret": "legacy-setup-test-secret" } }),
  "legacy x-bamsignal-secret header must be rejected"
);

const port = Number(process.env.SMOKE_PORT || process.env.LEGACY_SETUP_SMOKE_PORT || 39456);
process.env.PORT = String(port);
delete process.env.LEGACY_SETUP_ENABLED;
delete process.env.LEGACY_SETUP_SECRET;

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
  throw new Error("server did not become ready for legacy setup smoke");
}

async function callSetup(baseUrl, options = {}) {
  const { action = "status", query = "", headers = {}, body, method = "GET" } = options;
  const url = `${baseUrl}/api/hard/setup?action=${action}${query}`;
  const init = { method, headers: { ...headers } };
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

  const disabledResponse = await callSetup(baseUrl);
  assertCheck(
    disabledResponse.status === 404,
    `disabled setup must fail closed with 404 (got ${disabledResponse.status})`
  );

  process.env.LEGACY_SETUP_ENABLED = "true";
  process.env.LEGACY_SETUP_SECRET = "legacy-setup-test-secret";

  const querySecretResponse = await callSetup(baseUrl, {
    query: "&secret=legacy-setup-test-secret"
  });
  assertCheck(
    querySecretResponse.status === 404,
    `query secret must be rejected (got ${querySecretResponse.status})`
  );

  const bodySecretResponse = await callSetup(baseUrl, {
    method: "POST",
    action: "create",
    body: {
      email: "ops@bamsignal.com",
      password: "password123",
      confirmPassword: "password123",
      setupSecret: "legacy-setup-test-secret"
    }
  });
  assertCheck(
    bodySecretResponse.status === 404,
    `body secret must be rejected (got ${bodySecretResponse.status})`
  );

  const wrongHeaderResponse = await callSetup(baseUrl, {
    method: "POST",
    action: "create",
    headers: { "x-setup-secret": "wrong-secret" },
    body: {
      email: "ops@bamsignal.com",
      password: "password123",
      confirmPassword: "password123"
    }
  });
  assertCheck(
    wrongHeaderResponse.status === 404,
    `wrong header secret must be rejected (got ${wrongHeaderResponse.status})`
  );

  const hiddenStatusResponse = await callSetup(baseUrl, { action: "status" });
  const hiddenStatusPayload = await hiddenStatusResponse.json();
  assertCheck(
    hiddenStatusResponse.status === 200 &&
      hiddenStatusPayload?.ok === true &&
      hiddenStatusPayload?.needsSetup === undefined,
    "status without header must not reveal setup state"
  );

  const statusResponse = await callSetup(baseUrl, {
    action: "status",
    headers: { "x-setup-secret": "legacy-setup-test-secret" }
  });
  const statusPayload = await statusResponse.json();
  assertCheck(
    statusResponse.status === 200 &&
      statusPayload?.ok === true &&
      typeof statusPayload?.needsSetup === "boolean",
    "status with valid header secret must succeed"
  );

  console.log("legacy setup hardening tests ok");
  process.exit(0);
} catch (error) {
  console.error("legacy setup hardening tests failed:", error);
  process.exit(1);
}
