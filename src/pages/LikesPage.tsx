import { Crown, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BRAND, BUTTON_COPY, MONETIZATION_COPY, SUCCESS_COPY } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import { EmptyState } from "../components/EmptyState";
import { ReportBlockModal } from "../components/ReportBlockModal";
import { ActivityStatus } from "../components/ActivityStatus";
import { getCachedMemberProfile } from "../services/discoverProfiles";
import {
  acceptSignalRemote,
  declineSignalRemote,
  fetchIncomingSignalsRemote
} from "../services/memberData";
import type { LikeEntry } from "../types";
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
  const user = readJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const [signals, setSignals] = useState<LikeEntry[]>(() =>
    filterBlockedByProfileId(readJson(STORAGE_KEYS.likedBy, []))
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [safetyTarget, setSafetyTarget] = useState<LikeEntry | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    void fetchIncomingSignalsRemote(user).then((incoming) => {
      setSignals(filterBlockedByProfileId(incoming));
    });
  }, [user.email, user.phone]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3000);
  };

  const filtered = useMemo(() => {
    if (filter === "priority") return signals.filter((s) => s.superLike);
    return signals;
  }, [filter, signals]);

  const priorityCount = signals.filter((s) => s.superLike).length;

  const acceptSignal = async (entry: LikeEntry) => {
    if (!entry.id) {
      showToast("Could not accept this signal.");
      return;
    }
    const match = await acceptSignalRemote(user, entry.id);
    if (!match) {
      showToast("Could not accept signal. Try again.");
      return;
    }
    const next = signals.filter((s) => s.id !== entry.id && s.profileId !== entry.profileId);
    setSignals(next);
    writeJson(STORAGE_KEYS.likedBy, next);
    trackEvent("signal_accepted", { profileId: entry.profileId });
    notifySignalAccepted(entry.name);
    showToast(`${BRAND.matchCreated} ${BRAND.matchCreatedSub}`);
  };

  const declineSignal = async (entry: LikeEntry) => {
    if (entry.id) await declineSignalRemote(user, entry.id);
    const next = signals.filter((s) => s.id !== entry.id && s.profileId !== entry.profileId);
    setSignals(next);
    writeJson(STORAGE_KEYS.likedBy, next);
    showToast(`Signal from ${entry.name} declined.`);
  };

  const handleBlock = (entry: LikeEntry) => {
    blockUser(entry.profileId);
    void declineSignal(entry);
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
          title={SUCCESS_COPY.emptyPremiumState}
          message="When someone signals you, they'll appear here."
          actionLabel={BUTTON_COPY.explore}
          onAction={onDiscover ?? onUpgrade}
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
            {isPremium
              ? "Accept a signal to start a conversation."
              : "Signal Pass shows you who's interested."}
          </p>
        </div>
        {!isPremium && (
          <button type="button" className="member-page-head__cta" onClick={onUpgrade}>
            <Crown size={16} /> {MONETIZATION_COPY.seeEveryone}
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
          const profile = getCachedMemberProfile(entry.profileId);
          return (
            <article key={entry.id || entry.profileId} className="likes-row card">
              <div className="likes-row__avatar">
                <img
                  src={entry.photo}
                  alt=""
                  className={isPremium ? "" : "blurred-photo"}
                />
                {entry.superLike && isPremium && (
                  <span className="likes-row__priority" aria-label="Priority introduction">
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
                  {isPremium ? entry.city : MONETIZATION_COPY.lockedFeature}
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
                  <button type="button" className="likes-row__accept" onClick={() => void acceptSignal(entry)}>
                    Accept
                  </button>
                  <button type="button" className="likes-row__decline" onClick={() => void declineSignal(entry)}>
                    Decline
                  </button>
                  <button type="button" className="likes-row__report" onClick={() => setSafetyTarget(entry)}>
                    ···
                  </button>
                </div>
              ) : (
                <button type="button" className="likes-row__lock" onClick={onUpgrade} aria-label={MONETIZATION_COPY.seeEveryone}>
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
            <h3>People interested in you</h3>
            <p>{SUCCESS_COPY.emptyPremiumState}</p>
          </div>
          <button type="button" className="btn-primary btn-full" onClick={onUpgrade}>
            {MONETIZATION_COPY.seeEveryone}
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
