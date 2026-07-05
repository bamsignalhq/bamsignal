import { useCallback, useEffect, useState } from "react";
import {
  fetchWalletHome,
  purchaseThroughWallet,
  walletGateLabel,
  type WalletGateEntry,
  type WalletHomePayload
} from "../services/walletExperience";

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
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const label = productLabel || walletGateLabel(entry);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const result = await fetchWalletHome();
    setLoading(false);
    if (!result.ok || !result.home) {
      setMessage(result.error || "Unable to load wallet.");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[color:var(--bs-gold,#D4A64A)]/40 bg-[color:var(--bs-ink,#070707)] p-5 shadow-2xl"
        role="dialog"
        aria-label="Wallet"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-[color:var(--bs-gold,#D4A64A)]">Wallet</p>
            <h2 className="text-xl font-semibold text-white">BayGold Balance</h2>
            <p className="mt-1 text-sm text-white/70">{label}</p>
          </div>
          <button type="button" className="text-sm text-white/60 hover:text-white" onClick={onClose}>
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-white/70">Loading wallet…</p>
        ) : home ? (
          <>
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/60">Available Balance</p>
              <p className="text-3xl font-semibold text-[color:var(--bs-gold,#D4A64A)]">
                {home.overview.availableBayGold.toLocaleString()} BayGold
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
                <span>Rewards earned: {home.rewardsEarned} BG</span>
                <span>Pending rewards: {home.pendingRewards.length}</span>
                <span>Pending purchases: {home.pendingPurchases.length}</span>
                <span>Notifications: {home.recentNotifications.length}</span>
              </div>
            </div>

            {home.overview.recentActivity.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-white/80">Recent Transactions</p>
                <ul className="space-y-1 text-xs text-white/70">
                  {home.overview.recentActivity.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex justify-between rounded border border-white/10 px-2 py-1">
                      <span>{item.label}</span>
                      <span>{item.signedAmount > 0 ? "+" : ""}{item.signedAmount} BG</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                className="rounded-lg bg-[color:var(--bs-gold,#D4A64A)] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
                onClick={() => void handleSpend()}
              >
                Spend BayGold
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80"
                onClick={() => onBuyBayGold?.({})}
              >
                Buy BayGold
              </button>
              <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80" onClick={onClose}>
                History
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/70">{message || "Wallet unavailable."}</p>
        )}

        {message ? <p className="mt-3 text-xs text-white/70">{message}</p> : null}
      </div>
    </div>
  );
}
