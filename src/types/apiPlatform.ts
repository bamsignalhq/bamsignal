import type {
  ApiDomainId,
  ApiKeyStatusId,
  ApiScopeId,
  WebhookProviderId
} from "../constants/apiPlatform";

export type ApiCatalogEntry = {
  id: string;
  catalogRef: string;
  method: string;
  path: string;
  domainId: ApiDomainId;
  version: string;
  description: string;
  authenticated: boolean;
  deprecated: boolean;
  updatedAt: string;
};

export type ApiClientRecord = {
  id: string;
  clientRef: string;
  name: string;
  environment: "production" | "staging" | "development";
  scopes: ApiScopeId[];
  active: boolean;
  createdAt: string;
  lastUsedAt?: string;
};

export type ApiKeyRecord = {
  id: string;
  keyRef: string;
  clientId: string;
  clientName: string;
  status: ApiKeyStatusId;
  scopes: ApiScopeId[];
  expiresAt?: string;
  rotatedAt?: string;
  ipRestrictions: string[];
  createdAt: string;
};

export type ApiWebhookRecord = {
  id: string;
  webhookRef: string;
  providerId: WebhookProviderId;
  endpoint: string;
  events: string[];
  active: boolean;
  lastDeliveryAt?: string;
  failureCount: number;
};

export type ApiRateLimitRecord = {
  id: string;
  limitRef: string;
  clientId?: string;
  domainId?: ApiDomainId;
  requestsPerMinute: number;
  burstLimit: number;
  active: boolean;
};

export type ApiUsageSnapshot = {
  id: string;
  domainId: ApiDomainId;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
  snapshotAt: string;
};

export type ApiPlatformSummary = {
  catalogCount: number;
  activeClients: number;
  activeKeys: number;
  activeWebhooks: number;
  rateLimitRules: number;
  totalRequests24h: number;
  totalErrors24h: number;
  deprecatedEndpoints: number;
};

export type ApiPlatformBundle = {
  generatedAt: string;
  summary: ApiPlatformSummary;
  catalog: ApiCatalogEntry[];
  clients: ApiClientRecord[];
  keys: ApiKeyRecord[];
  webhooks: ApiWebhookRecord[];
  rateLimits: ApiRateLimitRecord[];
  usage: ApiUsageSnapshot[];
};
