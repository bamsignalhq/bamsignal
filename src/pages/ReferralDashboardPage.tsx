import { ArrowLeft, Gift, Link2, Megaphone, Share2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "../types";
import {
  MARKETING_CAMPAIGN_TEMPLATES,
  MARKETING_CONTENT_HUBS,
  MARKETING_INFRASTRUCTURE_MISSION,
  MARKETING_SHARE_ACTIONS,
  REFERRAL_REWARD_RULES,
} from "../constants/marketingInfrastructure";
import { ReferralCard } from "../components/dashboard/ReferralCard";
import { NativeShareProfileButton } from "../components/NativeShareProfileButton";
import {
  campaignConversionRate,
  getActiveMarketingCampaigns,
  listMarketingCampaigns,
  recordCampaignImpression,
} from "../utils/marketingCampaignEngine";
import { getReferralDashboardSnapshot } from "../utils/marketingReferralDashboard";
import { getMarketingSeoCatalog } from "../utils/marketingSeoCatalog";
import {
  shareMemberProfile,
  shareMemberReferral,
  shareSuccessStory,
} from "../utils/marketingSharing";
import { STORAGE_KEYS } from "../constants/limits";

type ReferralDashboardPageProps = {
  user: UserProfile;
  onBack: () => void;
};

export function ReferralDashboardPage({ user, onBack }: ReferralDashboardPageProps) {
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const snapshot = useMemo(() => getReferralDashboardSnapshot(user), [user]);
  const campaigns = useMemo(() => listMarketingCampaigns(), []);
  const activeCampaigns = useMemo(() => getActiveMarketingCampaigns(), []);
  const seoCatalog = useMemo(() => getMarketingSeoCatalog(), []);
  const memberProfileId = useMemo(
    () => (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEYS.memberProfileId) || undefined : undefined),
    []
  );

  const runShare = async (kind: "profile" | "referral" | "success_story") => {
    let ok = false;
    if (kind === "profile") {
      ok = await shareMemberProfile(user.name, memberProfileId);
    } else if (kind === "referral") {
      ok = await shareMemberReferral(snapshot.code);
    } else {
      ok = await shareSuccessStory("We found each other on BamSignal.");
    }
    setShareStatus(ok ? "Shared" : "Copy link from your code above if share is unavailable");
    window.setTimeout(() => setShareStatus(null), 2500);
  };

  useEffect(() => {
    for (const campaign of activeCampaigns) {
      recordCampaignImpression(campaign.id);
    }
  }, [activeCampaigns]);

  return (
    <div className="page referral-dashboard-page">
      <header className="referral-dashboard-page__head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1>Referral Dashboard</h1>
          <p>{MARKETING_INFRASTRUCTURE_MISSION}</p>
        </div>
      </header>

      <ReferralCard user={user} />

      <section className="card referral-dashboard-page__panel">
        <header className="referral-dashboard-page__section-head">
          <Gift size={20} aria-hidden />
          <div>
            <h2>Your referral link</h2>
            <p>Share this link — friends join with your code automatically.</p>
          </div>
        </header>
        <p className="referral-dashboard-page__link">
          <Link2 size={16} aria-hidden />
          <a href={snapshot.link}>{snapshot.link}</a>
        </p>
        <p className="referral-dashboard-page__reward">
          Reward: {REFERRAL_REWARD_RULES.rewardLabel} every {REFERRAL_REWARD_RULES.goal} successful
          referrals
        </p>
      </section>

      <section className="card referral-dashboard-page__panel">
        <header className="referral-dashboard-page__section-head">
          <Share2 size={20} aria-hidden />
          <div>
            <h2>Share</h2>
            <p>Profile, referral invite, or success story.</p>
          </div>
        </header>
        <div className="referral-dashboard-page__share-grid">
          {MARKETING_SHARE_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="btn-secondary referral-dashboard-page__share-btn"
              onClick={() => void runShare(action.id)}
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="referral-dashboard-page__profile-share">
          <NativeShareProfileButton profileName={user.name} profileId={memberProfileId} />
        </div>
        {shareStatus ? <p className="referral-dashboard-page__status">{shareStatus}</p> : null}
      </section>

      <section className="card referral-dashboard-page__panel">
        <header className="referral-dashboard-page__section-head">
          <Megaphone size={20} aria-hidden />
          <div>
            <h2>Campaigns</h2>
            <p>Launch, weekend, holiday, and referral waves.</p>
          </div>
        </header>
        <ul className="referral-dashboard-page__campaigns">
          {campaigns.map((campaign) => {
            const template = MARKETING_CAMPAIGN_TEMPLATES.find((t) => t.id === campaign.id);
            return (
              <li key={campaign.id}>
                <strong>{campaign.title}</strong>
                <span className={campaign.active ? "tag tag--active" : "tag"}>
                  {campaign.active ? "Active" : "Scheduled"}
                </span>
                <p>{template?.summary ?? campaign.summary}</p>
                <p className="referral-dashboard-page__muted">
                  {campaign.impressions} impressions · {campaign.conversions} conversions ·{" "}
                  {campaignConversionRate(campaign)}% rate
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card referral-dashboard-page__panel">
        <header className="referral-dashboard-page__section-head">
          <Sparkles size={20} aria-hidden />
          <div>
            <h2>Content &amp; SEO</h2>
            <p>{seoCatalog.publicPageCount} public pages indexed for growth.</p>
          </div>
        </header>
        <ul className="referral-dashboard-page__hubs">
          {MARKETING_CONTENT_HUBS.map((hub) => (
            <li key={hub.id}>
              <a href={hub.path}>{hub.label}</a>
              <span>{hub.summary}</span>
            </li>
          ))}
        </ul>
        <ul className="referral-dashboard-page__seo-capabilities">
          {seoCatalog.capabilities.map((cap) => (
            <li key={cap}>{cap}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
