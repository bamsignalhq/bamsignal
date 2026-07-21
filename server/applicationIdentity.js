import { getDeploymentMetadata } from "./deployMetadata.js";

/** Static product identity — runtime fields merged via getApplicationIdentity(). */
export const APPLICATION_IDENTITY = {
  applicationName: "BamSignal",
  applicationId: "bamsignal",
  legalEntity: "Stankings Legacy Ltd",
  repository: "bamsignalhq/bamsignal",
  defaultDomain: "https://bamsignal.com",
  healthEndpoint: "/health",
  readinessEndpoint: "/ready",
  supportContact: "support@bamsignal.com",
  supabaseProjectRef: "nswiwxmavuqpuzlsascs",
  supabaseOrganization: "Stankings Group",
  supabaseEnvironment: "production"
};

/** Full application identity including runtime deployment metadata. */
export function getApplicationIdentity() {
  const deploy = getDeploymentMetadata(APPLICATION_IDENTITY.applicationId);
  return {
    ...APPLICATION_IDENTITY,
    version: deploy.version,
    environment: deploy.environment,
    platform: deploy.platform,
    provider: deploy.provider,
    commit: deploy.commit,
    buildTime: deploy.buildTime,
    nodeEnv: deploy.nodeEnv
  };
}
