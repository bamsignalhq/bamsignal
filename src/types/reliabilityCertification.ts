export type ReliabilityScenarioId =
  | "supabase-unavailable"
  | "paystack-unavailable"
  | "sendchamp-unavailable"
  | "resend-unavailable"
  | "storage-unavailable"
  | "network-timeout"
  | "slow-api"
  | "database-reconnect"
  | "expired-jwt"
  | "invalid-refresh-token";

export type ReliabilityVerificationDimension =
  | "gracefulDegradation"
  | "retry"
  | "fallback"
  | "recovery"
  | "logging"
  | "alertGeneration";

export type ReliabilityScenarioResult = {
  id: ReliabilityScenarioId;
  label: string;
  simulated: boolean;
  passed: boolean;
  recoveryTimeMs: number | null;
  recoverySuccess: boolean;
  verification: Record<ReliabilityVerificationDimension, boolean>;
  detail: string;
};

export type ReliabilityCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  reliabilityScore: number;
  passed: boolean;
  recoveryTimeMs: {
    average: number | null;
    max: number | null;
  };
  recoverySuccess: number;
  recoveryFailures: string[];
  scenarios: ReliabilityScenarioResult[];
};

export type ReliabilityCertificationRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: "critical" | "high" | "medium";
};

export type ReliabilityCertificationReport = ReliabilityCertificationSnapshot & {
  summaryLine: string;
  recommendations: ReliabilityCertificationRecommendation[];
  source: "store" | "cli";
};
