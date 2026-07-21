/** Ecosystem deployment metadata — identical field names across Stankings products. */
export function getDeploymentMetadata(application) {
  const version =
    process.env.APP_VERSION?.trim() ||
    process.env.npm_package_version?.trim() ||
    "0.0.0";

  return {
    application,
    version,
    environment: process.env.APP_ENV?.trim() || process.env.NODE_ENV || "unknown",
    platform: process.env.DEPLOY_PLATFORM?.trim() || "coolify",
    provider: process.env.DEPLOY_PROVIDER?.trim() || "hetzner",
    commit:
      process.env.GIT_COMMIT_SHA?.trim() ||
      process.env.COOLIFY_SOURCE_COMMIT?.trim() ||
      null,
    buildTime: process.env.BUILD_TIME?.trim() || null,
    nodeEnv: process.env.NODE_ENV || "unknown"
  };
}

export function getUptimeSeconds() {
  return Math.floor(process.uptime());
}

/** Standard health envelope (no secrets). Product-specific fields go in `diagnostics`. */
export function buildStandardHealthPayload(input) {
  const {
    application,
    status = "ok",
    database = "unknown",
    diagnostics = undefined,
    extra = {}
  } = input;
  const deploy = getDeploymentMetadata(application);
  const payload = {
    status,
    application: deploy.application,
    version: deploy.version,
    environment: deploy.environment,
    platform: deploy.platform,
    provider: deploy.provider,
    commit: deploy.commit,
    buildTime: deploy.buildTime,
    uptime: getUptimeSeconds(),
    database,
    timestamp: new Date().toISOString(),
    ...extra
  };
  if (diagnostics && Object.keys(diagnostics).length > 0) {
    payload.diagnostics = diagnostics;
  }
  return payload;
}
