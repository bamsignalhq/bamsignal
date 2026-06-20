import type { UserProfile } from "../types";
import { boostActiveLabel } from "../utils/memberEntitlements";
import { getSoonestActiveBoost } from "../utils/activeBoosts";

type BoostActiveBannerProps = {
  user: Pick<UserProfile, "email" | "phone" | "username">;
  refreshKey?: number;
};

export function BoostActiveBanner({ user, refreshKey = 0 }: BoostActiveBannerProps) {
  void refreshKey;
  const boost = getSoonestActiveBoost(user);
  if (!boost?.expiresAt) return null;

  return (
    <p className="compliance-sync-banner compliance-sync-banner--boost" role="status">
      {boostActiveLabel(boost.productId, boost.expiresAt)}
    </p>
  );
}
