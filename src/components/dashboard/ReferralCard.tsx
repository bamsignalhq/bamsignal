import { Copy, Gift, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { UserProfile } from "../../types";
import {
  getReferralState,
  recordInviteSent,
  referralProgress,
  referralShareUrl
} from "../../utils/referrals";

type ReferralCardProps = {
  user: UserProfile;
};

export function ReferralCard({ user }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const state = useMemo(() => getReferralState(user), [user.email, user.name, user.referralCode]);
  const progress = referralProgress(state);
  const shareUrl = referralShareUrl(state.code);

  const copyCode = async () => {
    recordInviteSent();
    try {
      await navigator.clipboard.writeText(`${shareUrl}\nCode: ${state.code}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="dash-referral card dash-animate">
      <header className="dash-referral__head">
        <Gift size={22} aria-hidden />
        <div>
          <h2>Invite friends</h2>
          <p>Earn rewards when friends join BamSignal.</p>
        </div>
      </header>
      <div className="dash-referral__code">
        <strong>{state.code}</strong>
        <button type="button" className="btn-secondary" onClick={copyCode}>
          <Copy size={16} />
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <div className="dash-referral__progress">
        <span>
          {progress.current}/{progress.goal} successful referrals
        </span>
        <div className="dash-referral__bar" role="progressbar" aria-valuenow={progress.current} aria-valuemin={0} aria-valuemax={progress.goal}>
          <div style={{ width: `${(progress.current / progress.goal) * 100}%` }} />
        </div>
        <p>
          {progress.remaining > 0
            ? `${progress.remaining} more for ${progress.rewardLabel}`
            : progress.pendingRewards > 0
              ? `${progress.pendingRewards} reward pending`
              : `Next reward: ${progress.rewardLabel}`}
        </p>
      </div>
      <ul className="dash-referral__stats">
        <li>
          <strong>{state.invitesSent}</strong>
          <span>Invites</span>
        </li>
        <li>
          <strong>{state.successfulReferrals}</strong>
          <span>Completed</span>
        </li>
        <li>
          <strong>{state.rewardsClaimed}</strong>
          <span>Earned</span>
        </li>
        <li>
          <strong>{progress.pendingRewards}</strong>
          <span>Pending</span>
        </li>
      </ul>
      <button type="button" className="link-btn dash-referral__share" onClick={copyCode}>
        <Share2 size={16} />
        Share your invite link
      </button>
    </section>
  );
}
