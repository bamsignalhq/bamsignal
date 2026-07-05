import { STORAGE_KEYS } from "../constants/limits";
import {
  MARKETING_CAMPAIGN_TEMPLATES,
  type MarketingCampaignKind,
} from "../constants/marketingInfrastructure";
import { readJson, writeJson } from "./storage";
import { trackEvent } from "./analytics";

export type MarketingCampaign = {
  id: string;
  kind: MarketingCampaignKind;
  title: string;
  summary: string;
  cta: string;
  active: boolean;
  impressions: number;
  conversions: number;
};

type CampaignStore = {
  campaigns: MarketingCampaign[];
  updatedAt: string;
};

function defaultStore(): CampaignStore {
  const campaigns = MARKETING_CAMPAIGN_TEMPLATES.map((template) => ({
    ...template,
    active: template.kind === "referral",
    impressions: 0,
    conversions: 0,
  }));
  return { campaigns, updatedAt: new Date().toISOString() };
}

function loadStore(): CampaignStore {
  const stored = readJson<CampaignStore | null>(STORAGE_KEYS.marketingCampaigns, null);
  if (!stored?.campaigns?.length) return defaultStore();
  return stored;
}

function saveStore(store: CampaignStore): void {
  writeJson(STORAGE_KEYS.marketingCampaigns, store);
}

export function listMarketingCampaigns(): MarketingCampaign[] {
  return loadStore().campaigns;
}

export function getActiveMarketingCampaigns(): MarketingCampaign[] {
  return listMarketingCampaigns().filter((c) => c.active);
}

export function recordCampaignImpression(campaignId: string): void {
  const store = loadStore();
  store.campaigns = store.campaigns.map((c) =>
    c.id === campaignId ? { ...c, impressions: c.impressions + 1 } : c,
  );
  store.updatedAt = new Date().toISOString();
  saveStore(store);
  trackEvent("campaign_impression", { campaignId });
}

export function recordCampaignConversion(campaignId: string): void {
  const store = loadStore();
  store.campaigns = store.campaigns.map((c) =>
    c.id === campaignId ? { ...c, conversions: c.conversions + 1 } : c,
  );
  store.updatedAt = new Date().toISOString();
  saveStore(store);
  trackEvent("campaign_conversion", { campaignId });
}

export function campaignConversionRate(campaign: MarketingCampaign): number {
  if (!campaign.impressions) return 0;
  return Math.round((campaign.conversions / campaign.impressions) * 100);
}
