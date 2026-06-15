import { AdminReferralPanel } from "./AdminReferralPanel";
import { AdminCitySpotlightPanel } from "./AdminCitySpotlightPanel";
import { getBusinessMetrics, getRetentionMetrics } from "../../utils/retentionAnalytics";
import { getSafetyMetrics, getTrustMetrics } from "../../utils/safetyAnalytics";
import { countEventToday } from "../../utils/analytics";
import { usersByCity } from "../../utils/cityAnalytics";
import { pendingCount } from "../../utils/verificationQueue";

export function AdminBusinessDashboard() {
  const business = getBusinessMetrics();
  const retention = getRetentionMetrics();
  const safety = getSafetyMetrics();
  const trust = getTrustMetrics();
  const cities = usersByCity();

  const intentCounts = {
    Relationship: countEventToday("signal_sent"),
    Friendship: 0,
    Networking: 0
  };

  const stat = (label: string, value: string | number) => (
    <div key={label} className="card admin-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="admin-business">
      <h3 className="admin-section-title">Launch metrics</h3>
      <section className="admin-stats-grid admin-stats-grid--highlight">
        {stat("DAU", retention.dau)}
        {stat("WAU", retention.wau)}
        {stat("MAU", retention.mau)}
        {stat("Signals sent (today)", business.signalsSentToday)}
        {stat("Signals accepted (today)", business.signalsAcceptedToday)}
        {stat("Messages (today)", business.messagesSentToday)}
        {stat("Premium revenue (today)", business.premiumRevenueToday)}
        {stat("Referral signups", business.referralSignups)}
        {stat("Verifications pending", pendingCount())}
        {stat("Reports (today)", safety.reportsToday)}
      </section>

      <h3 className="admin-section-title">Retention</h3>
      <section className="admin-stats-grid">
        {stat("Day 1 retention", `${retention.day1Retention}%`)}
        {stat("Day 7 retention", `${retention.day7Retention}%`)}
        {stat("Day 30 retention", `${retention.day30Retention}%`)}
        {stat("Profile completion", `${retention.profileCompletionRate}%`)}
        {stat("Verification rate", `${retention.verificationRate}%`)}
        {stat("Premium conversion", `${retention.premiumConversionRate}%`)}
        {stat("Referral conversion", `${retention.referralConversionRate}%`)}
      </section>

      <h3 className="admin-section-title">Premium funnel</h3>
      <section className="admin-stats-grid">
        {stat("Upgrade impressions", business.upgradeImpressions)}
        {stat("Upgrade clicks", business.upgradeClicks)}
        {stat("Purchases", business.premiumRevenueEvents)}
      </section>

      <h3 className="admin-section-title">Safety & trust</h3>
      <section className="admin-stats-grid">
        {stat("Reports (7d)", safety.reportsLast7d)}
        {stat("Blocks (7d)", safety.blocksLast7d)}
        {stat("Contact share attempts", safety.contactAttemptsToday)}
        {stat("Flagged profiles", safety.flaggedProfiles)}
        {stat("Shadow banned", safety.shadowBanned)}
        {stat("Verified today", trust.verifiedToday)}
      </section>

      <h3 className="admin-section-title">Top cities</h3>
      <section className="admin-city-table card">
        {Object.entries(cities)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([city, count]) => (
            <div key={city} className="admin-city-row">
              <span>{city}</span>
              <strong>{count}</strong>
            </div>
          ))}
        {!Object.keys(cities).length && <p className="admin-empty">No city data yet.</p>}
      </section>

      <p className="match-prefs-note admin-business__note">
        Top intent types use signal_sent events until intent metadata is persisted server-side.
        Relationship signals today: {intentCounts.Relationship}
      </p>

      <AdminCitySpotlightPanel />

      <AdminReferralPanel />
    </div>
  );
}
