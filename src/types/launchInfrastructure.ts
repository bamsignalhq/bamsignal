export type LaunchInfraArtifactId =
  | "docker"
  | "coolify"
  | "supabase"
  | "build-scripts"
  | "sitemap"
  | "robots"
  | "manifest"
  | "icons"
  | "favicons"
  | "pwa"
  | "caching"
  | "headers"
  | "compression"
  | "seo"
  | "deep-links"
  | "app-links"
  | "asset-links"
  | "apple-association"
  | "service-worker";

export type LaunchInfraStatusId = "ready" | "warning" | "critical";

export type LaunchInfraArtifactResult = {
  id: LaunchInfraArtifactId;
  label: string;
  status: LaunchInfraStatusId;
  score: number;
  summary: string;
};

export type LaunchInfraCheck = {
  id: string;
  checkRef: string;
  artifactId: LaunchInfraArtifactId;
  label: string;
  passed: boolean;
  detail: string;
};

export type LaunchInfrastructureReport = {
  generatedAt: string;
  overallStatus: LaunchInfraStatusId;
  overallScore: number;
  artifacts: LaunchInfraArtifactResult[];
  checklist: LaunchInfraCheck[];
  fixesApplied: string[];
  readyCount: number;
  warningCount: number;
  criticalCount: number;
};
