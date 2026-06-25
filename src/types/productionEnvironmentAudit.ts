export type ProductionEnvIntegrationId =
  | "supabase"
  | "paystack"
  | "resend"
  | "sendchamp"
  | "google-calendar"
  | "google-meet"
  | "zoom"
  | "storage"
  | "jwt"
  | "secrets"
  | "deep-links"
  | "android"
  | "ios"
  | "pwa"
  | "vapid"
  | "cron-jobs"
  | "webhooks";

export type ProductionEnvStatusId = "ready" | "warning" | "critical";

export type ProductionEnvVariable = {
  name: string;
  integrationId: ProductionEnvIntegrationId;
  scope: "buildtime" | "runtime" | "both";
  required: "critical" | "warning" | "optional";
  aliases?: string[];
  referencedIn: string[];
  notes?: string;
};

export type ProductionEnvIntegrationResult = {
  id: ProductionEnvIntegrationId;
  label: string;
  status: ProductionEnvStatusId;
  score: number;
  summary: string;
  variableCount: number;
  criticalCount: number;
  warningCount: number;
};

export type ProductionEnvCheck = {
  id: string;
  checkRef: string;
  integrationId: ProductionEnvIntegrationId;
  label: string;
  passed: boolean;
  detail: string;
};

export type ProductionEnvDuplicateGroup = {
  id: string;
  label: string;
  variables: string[];
  canonical: string;
  status: ProductionEnvStatusId;
  summary: string;
};

export type ProductionEnvFinding = {
  id: string;
  kind: "placeholder" | "duplicate" | "unused" | "missing" | "dev-secret";
  status: ProductionEnvStatusId;
  label: string;
  detail: string;
};

export type ProductionEnvironmentReport = {
  generatedAt: string;
  overallStatus: ProductionEnvStatusId;
  overallScore: number;
  integrations: ProductionEnvIntegrationResult[];
  checklist: ProductionEnvCheck[];
  duplicates: ProductionEnvDuplicateGroup[];
  findings: ProductionEnvFinding[];
  registryVariableCount: number;
  envExampleVariableCount: number;
  readyCount: number;
  warningCount: number;
  criticalCount: number;
};
