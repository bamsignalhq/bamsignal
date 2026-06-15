import { getReferralAdminMetrics } from "../../utils/referralAnalytics";
import { getBusinessMetrics } from "../../utils/retentionAnalytics";

export function AdminReferralPanel() {
  const business = getBusinessMetrics();
  const local = getReferralAdminMetrics();

  const stat = (label: string, value: string | number) => (
    <div key={label} className="card admin-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );

  return (
    <section className="admin-referrals card">
      <h3>Referral program</h3>
      <p className="match-prefs-note">
        User-facing referral UI is disabled. Tracking and rewards remain active server-side.
      </p>
      <div className="admin-stats-grid">
        {stat("Referral signups", business.referralSignups)}
        {stat("Conversion rate", `${local.referralConversionRate}%`)}
        {stat("Successful referrals (local)", local.localSuccessfulReferrals)}
        {stat("Rewards claimed (local)", local.localRewardsClaimed)}
        {stat("Invites sent (local)", local.localInvitesSent)}
      </div>
    </section>
  );
}
