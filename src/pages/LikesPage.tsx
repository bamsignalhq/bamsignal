import { Crown, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { BRAND } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import { EmptyState } from "../components/EmptyState";
import { ReportBlockModal } from "../components/ReportBlockModal";
import { ActivityStatus } from "../components/ActivityStatus";
import { MOCK_LIKES, getDiscoverProfile } from "../data/mockProfiles";
import type { LikeEntry, Match } from "../types";
import { blockUser, filterBlockedByProfileId } from "../utils/safety";
import { trackEvent } from "../utils/analytics";
import { notifySignalAccepted } from "../utils/notifyHelpers";
import { readJson, writeJson } from "../utils/storage";

type LikesPageProps = {
  isPremium: boolean;
  onUpgrade: () => void;
  onCompleteProfile?: () => void;
  onDiscover?: () => void;
};

type Filter = "all" | "priority";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return "Today";
}

export function LikesPage({ isPremium, onUpgrade, onCompleteProfile, onDiscover }: LikesPageProps) {
  const [signals, setSignals] = useState<LikeEntry[]>(() =>
    filterBlockedByProfileId(readJson(STORAGE_KEYS.likedBy, MOCK_LIKES))
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [safetyTarget, setSafetyTarget] = useState<LikeEntry | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3000);
  };

  const filtered = useMemo(() => {
    if (filter === "priority") return signals.filter((s) => s.superLike);
    return signals;
  }, [filter, signals]);

  const priorityCount = signals.filter((s) => s.superLike).length;

  const acceptSignal = (entry: LikeEntry) => {
    const matches = readJson<Match[]>(STORAGE_KEYS.matches, []);
    if (!matches.some((m) => m.profileId === entry.profileId)) {
      writeJson(STORAGE_KEYS.matches, [
        ...matches,
        {
          id: `m-${entry.profileId}`,
          profileId: entry.profileId,
          name: entry.name,
          photo: entry.photo,
          city: entry.city,
          matchedAt: new Date().toISOString(),
          lastActiveAt: getDiscoverProfile(entry.profileId)?.lastActiveAt
        }
      ]);
    }
    const next = signals.filter((s) => s.profileId !== entry.profileId);
    setSignals(next);
    writeJson(STORAGE_KEYS.likedBy, next);
    trackEvent("signal_accepted", { profileId: entry.profileId });
    notifySignalAccepted(entry.name);
    showToast(`${BRAND.signalAccepted}! Message ${entry.name} in Messages.`);
  };

  const declineSignal = (entry: LikeEntry) => {
    const next = signals.filter((s) => s.profileId !== entry.profileId);
    setSignals(next);
    writeJson(STORAGE_KEYS.likedBy, next);
    showToast(`Signal from ${entry.name} declined.`);
  };

  const handleBlock = (entry: LikeEntry) => {
    blockUser(entry.profileId);
    declineSignal(entry);
    showToast(`${entry.name} blocked.`);
  };

  if (!signals.length) {
    return (
      <div className="page member-page likes-page">
        <header className="member-page-head">
          <div>
            <p className="member-page-head__eyebrow">Likes</p>
            <h1>Incoming signals</h1>
          </div>
        </header>
        <EmptyState
          icon={Zap}
          title="No signals yet"
          message="When someone signals you, they appear here. Complete your profile to get noticed faster."
          actionLabel="Complete profile"
          onAction={onCompleteProfile ?? onUpgrade}
          secondaryLabel="Start discovering"
          onSecondary={onDiscover ?? onUpgrade}
        />
      </div>
    );
  }

  return (
    <div className="page member-page likes-page">
      <header className="member-page-head">
        <div>
          <p className="member-page-head__eyebrow">Likes</p>
          <h1>{signals.length} signal{signals.length === 1 ? "" : "s"} waiting</h1>
          <p className="member-page-head__sub">
            {isPremium ? "Accept to start chatting in Messages." : "Upgrade to reveal who signaled you."}
          </p>
        </div>
        {!isPremium && (
          <button type="button" className="member-page-head__cta" onClick={onUpgrade}>
            <Crown size={16} /> Unlock
          </button>
        )}
      </header>

      <div className="member-filter-row">
        <button
          type="button"
          className={`member-filter-chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({signals.length})
        </button>
        <button
          type="button"
          className={`member-filter-chip ${filter === "priority" ? "active" : ""}`}
          onClick={() => setFilter("priority")}
        >
          <Sparkles size={14} /> Priority ({priorityCount})
        </button>
      </div>

      {toast && <div className="toast toast--member">{toast}</div>}

      <div className={`likes-feed ${!isPremium ? "likes-feed--locked" : ""}`}>
        {filtered.map((entry) => {
          const profile = getDiscoverProfile(entry.profileId);
          return (
            <article key={entry.profileId} className="likes-row card">
              <div className="likes-row__avatar">
                <img
                  src={entry.photo}
                  alt=""
                  className={isPremium ? "" : "blurred-photo"}
                />
                {entry.superLike && isPremium && (
                  <span className="likes-row__priority" aria-label="Priority signal">
                    ⚡
                  </span>
                )}
              </div>

              <div className="likes-row__body">
                <div className="likes-row__top">
                  <strong>{isPremium ? entry.name : "Someone nearby"}</strong>
                  <span className="likes-row__time">{timeAgo(entry.at)}</span>
                </div>
                <p className="likes-row__meta">
                  {isPremium ? entry.city : "Upgrade to reveal"}
                  {isPremium && profile?.lastActiveAt && (
                    <>
                      {" · "}
                      <ActivityStatus lastActiveAt={profile.lastActiveAt} variant="subtle" />
                    </>
                  )}
                </p>
                {entry.superLike && isPremium && (
                  <span className="likes-row__badge">{BRAND.prioritySignal}</span>
                )}
              </div>

              {isPremium ? (
                <div className="likes-row__actions">
                  <button type="button" className="likes-row__accept" onClick={() => acceptSignal(entry)}>
                    Accept
                  </button>
                  <button type="button" className="likes-row__decline" onClick={() => declineSignal(entry)}>
                    Decline
                  </button>
                  <button type="button" className="likes-row__report" onClick={() => setSafetyTarget(entry)}>
                    ···
                  </button>
                </div>
              ) : (
                <button type="button" className="likes-row__lock" onClick={onUpgrade} aria-label="Unlock">
                  <Crown size={18} />
                </button>
              )}
            </article>
          );
        })}
      </div>

      {!isPremium && (
        <section className="member-upgrade-banner card">
          <Crown size={22} />
          <div>
            <h3>See who signaled you</h3>
            <p>Reveal names, photos, and accept signals instantly.</p>
          </div>
          <button type="button" className="btn-primary btn-full" onClick={onUpgrade}>
            Unlock signal passes
          </button>
        </section>
      )}

      {safetyTarget && (
        <ReportBlockModal
          open={Boolean(safetyTarget)}
          userName={safetyTarget.name}
          profileId={safetyTarget.profileId}
          onClose={() => setSafetyTarget(null)}
          onBlock={() => handleBlock(safetyTarget)}
        />
      )}
    </div>
  );
}
