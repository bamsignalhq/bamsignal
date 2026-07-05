import { useCallback, useEffect, useState } from "react";
import {
  MemberErrorState,
  MemberLoadingState,
  MemberSheet,
  MemberSkeleton
} from "../member/MemberUxKit";
import {
  fetchWalletHome,
  purchaseThroughWallet,
  walletGateLabel,
  type WalletGateEntry,
  type WalletHomePayload
} from "../../services/walletExperience";
import { MEMBER_BUTTON_PRIMARY, MEMBER_BUTTON_SECONDARY } from "../../constants/uxDesignSystem";

type WalletExperienceSheetProps = {
  open: boolean;
  entry: WalletGateEntry | string;
  productId?: string;
  productLabel?: string;
  onClose: () => void;
  onCompleted?: () => void;
  onBuyBayGold?: (ctx: { resumeToken?: string; shortfallBayGold?: number }) => void;
};

export function WalletExperienceSheet({
  open,
  entry,
  productId,
  productLabel,
  onClose,
  onCompleted,
  onBuyBayGold
}: WalletExperienceSheetProps) {
  const [home, setHome] = useState<WalletHomePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const label = productLabel || walletGateLabel(entry);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const result = await fetchWalletHome();
    setLoading(false);
    if (!result.ok || !result.home) {
      setError(result.error || "Unable to load wallet.");
      setHome(null);
      return;
    }
    setHome(result.home);
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function handleSpend() {
    setBusy(true);
    setMessage("");
    const result = await purchaseThroughWallet({ entry, productId });
    setBusy(false);

    if (!result.gate) {
      setMessage(result.error || "Purchase failed.");
      return;
    }

    if (result.gate.step === "completed") {
      onCompleted?.();
      onClose();
      return;
    }

    if (result.gate.step === "buy_baygold" || result.gate.needsFunding) {
      setMessage(
        `Need ${result.gate.shortfallBayGold ?? 0} more BayGold. Buy BayGold to continue — purchase resumes automatically.`
      );
      onBuyBayGold?.({
        resumeToken: result.gate.resumeToken,
        shortfallBayGold: result.gate.shortfallBayGold
      });
      return;
    }

    setMessage(result.gate.error || "Purchase could not complete.");
  }

  const footer = home ? (
    <>
      <button
        type="button"
        disabled={busy}
        className={MEMBER_BUTTON_PRIMARY}
        onClick={() => void handleSpend()}
      >
        {busy ? "Processing…" : "Spend BayGold"}
      </button>
      <button type="button" className={MEMBER_BUTTON_SECONDARY} onClick={() => onBuyBayGold?.({})}>
        Buy BayGold
      </button>
    </>
  ) : null;

  return (
    <MemberSheet
      open={open}
      eyebrow="Wallet"
      title="BayGold Balance"
      subtitle={label}
      onClose={onClose}
      ariaLabel="Wallet"
      footer={footer}
    >
      {loading ? (
        <>
          <MemberLoadingState label="Loading wallet…" compact />
          <MemberSkeleton lines={4} />
        </>
      ) : error ? (
        <MemberErrorState body={error} onRetry={() => void load()} />
      ) : home ? (
        <>
          <div className="member-ux-wallet-balance">
            <p className="member-ux-wallet-balance__label">Available Balance</p>
            <p className="member-ux-wallet-balance__value">
              {home.overview.availableBayGold.toLocaleString()} BayGold
            </p>
            <div className="member-ux-wallet-meta">
              <span>Rewards earned: {home.rewardsEarned} BG</span>
              <span>Pending rewards: {home.pendingRewards.length}</span>
              <span>Pending purchases: {home.pendingPurchases.length}</span>
              <span>Notifications: {home.recentNotifications.length}</span>
            </div>
          </div>

          {home.overview.recentActivity.length > 0 ? (
            <div className="member-ux-wallet-meta" style={{ marginTop: 16 }}>
              <p className="member-ux-wallet-balance__label" style={{ gridColumn: "1 / -1" }}>
                Recent Transactions
              </p>
              {home.overview.recentActivity.slice(0, 5).map((item) => (
                <span key={item.id} style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between" }}>
                  <span>{item.label}</span>
                  <span>
                    {item.signedAmount > 0 ? "+" : ""}
                    {item.signedAmount} BG
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {message ? (
        <p className="member-ux-message" role="status">
          {message}
        </p>
      ) : null}
    </MemberSheet>
  );
}
