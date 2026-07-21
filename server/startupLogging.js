import { getApplicationIdentity } from "./applicationIdentity.js";

/** Log standardized startup banner — no secrets. */
export function logStartupBanner({ port, host = "0.0.0.0" }) {
  const identity = getApplicationIdentity();
  const startedAt = new Date().toISOString();
  console.log(
    `[${identity.applicationId}] startup application=${identity.applicationName} version=${identity.version} environment=${identity.environment} platform=${identity.platform} provider=${identity.provider} commit=${identity.commit ?? "local"} port=${port} host=${host} node=${process.version} startedAt=${startedAt}`
  );
}
