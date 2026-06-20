import { Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { ProfileCardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { FastConnectionLimitModal } from "../components/profile/FastConnectionLimitModal";
import { ERROR_COPY } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import {
  fetchFastConnectionPool,
  fetchFastConnectionSignalStatus,
  sendFastConnectionSignalRemote
} from "../services/fastConnectionPool";
import type { DiscoverProfile, UserProfile } from "../types";
import { fastSignalsLeftLabel, type FastSignalStatus } from "../utils/fastSignals";
import { fastConnectionActiveLabel, isQuickiePassActive } from "../utils/quickie";
import { resolveMemberPlanBadge } from "../utils/memberBadge";
import { filterDiscoverDeck } from "../utils/safety";
import { readJson, writeJson } from "../utils/storage";
import { getVerificationTier } from "../utils/verification";
import { defaultDatingProfile } from "../utils/profile";

const SIGNAL_ANIM_MS = 420;

type FastConnectionPageProps = {
  user: UserProfile;
  isPremium: boolean;
  onHome: () => void;
  onOpenPremium: () => void;
};

export function FastConnectionPage({ user, isPremium, onHome, onOpenPremium }: FastConnectionPageProps) {
  const { profile: viewer } = useMemberProfileListener();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [locationTier, setLocationTier] = useState<"city" | "state" | "none">("none");
  const [passedIds, setPassedIds] = useState<string[]>(() =>
    readJson<string[]>(STORAGE_KEYS.fastConnectionPassed, [])
  );
  const [signalStatus, setSignalStatus] = useState<FastSignalStatus>({
    passActive: false,
    usedToday: 0,
    dailyLimit: 30,
    remaining: 0,
    resetAt: null
  });
  const [signalSent, setSignalSent] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [cardKey, setCardKey] = useState(0);

  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const statusLabel = fastConnectionActiveLabel();

  const deck = useMemo(
    () => filterDiscoverDeck(profiles, viewer, blocked, passedIds),
    [profiles, viewer, blocked, passedIds]
  );
  const current = deck[0];

  const loadPool = useCallback(async () => {
    setLoading(true);
    const exclude = [...blocked, ...passedIds];
    const result = await fetchFastConnectionPool(user, exclude);
    if (!result.passActive) {
      onHome();
      return;
    }
    setProfiles(result.profiles);
    setLocationTier(result.locationTier);
    setLoading(false);
  }, [blocked, onHome, passedIds, user]);

  const loadStatus = useCallback(async () => {
    const status = await fetchFastConnectionSignalStatus(user);
    setSignalStatus(status);
    if (!status.passActive && !isQuickiePassActive()) {
      onHome();
    }
  }, [onHome, user]);

  useEffect(() => {
    if (!isQuickiePassActive()) {
      onHome();
      return;
    }
    void loadPool();
    void loadStatus();
  }, [loadPool, loadStatus, onHome]);

  const advance = (profileId: string) => {
    const next = passedIds.includes(profileId) ? passedIds : [...passedIds, profileId];
    writeJson(STORAGE_KEYS.fastConnectionPassed, next);
    setPassedIds(next);
    setCardKey((value) => value + 1);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const handleIgnore = () => {
    if (!current) return;
    advance(current.id);
  };

  const handleSendSignal = async () => {
    if (!current || signalSent) return;
    if (signalStatus.remaining <= 0) {
      setLimitOpen(true);
      return;
    }

    setSignalSent(true);
    const profile = current;
    window.setTimeout(async () => {
      const result = await sendFastConnectionSignalRemote(user, profile.id);
      setSignalStatus(result.status);
      setSignalSent(false);

      if (result.limitReached) {
        setLimitOpen(true);
        return;
      }

      if (!result.ok) {
        showToast(result.error || ERROR_COPY.signalFailed);
        advance(profile.id);
        return;
      }

      showToast("Fast Signal sent");
      advance(profile.id);
    }, SIGNAL_ANIM_MS);
  };

  const verification = current
    ? getVerificationTier({ ...defaultDatingProfile(), verified: current.verified }, isPremium, true)
    : undefined;

  const locationHint =
    locationTier === "city"
      ? `Showing Fast Connection members in ${viewer.city || "your city"}.`
      : locationTier === "state"
        ? `Showing Fast Connection members in ${viewer.state || "your state"}.`
        : null;

  return (
    <div className="page fast-connection-page member-content-pad">
      <header className="fast-connection-page__head">
        <div className="fast-connection-sheet__icon" aria-hidden>
          <Zap size={24} />
        </div>
        <div className="fast-connection-page__title-block">
          <h1>Fast Connection</h1>
          {statusLabel ? <p className="profile-fast-connection-status">{statusLabel}</p> : null}
          {signalStatus.passActive ? (
            <p className="fast-connection-page__signals-left">{fastSignalsLeftLabel(signalStatus.remaining)}</p>
          ) : null}
          {locationHint ? <p className="fast-connection-page__location-hint">{locationHint}</p> : null}
        </div>
      </header>

      {toast ? (
        <p className="profile-mod-toast" role="status">
          {toast}
        </p>
      ) : null}

      {loading ? <ProfileCardSkeleton /> : null}

      {!loading && !current ? (
        <EmptyState
          icon={Zap}
          title="No Fast Connection matches nearby yet."
          message="Check back later as more people join."
          actionLabel="Back to Home"
          onAction={onHome}
        />
      ) : null}

      {!loading && current ? (
        <ProfileCard
          key={cardKey}
          profile={current}
          verification={verification?.tier ? verification : undefined}
          memberBadge={resolveMemberPlanBadge(current)}
          onIgnore={handleIgnore}
          onSendSignal={() => void handleSendSignal()}
          signalSent={signalSent}
          entering
        />
      ) : null}

      <FastConnectionLimitModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        onUpgradePremium={onOpenPremium}
      />
    </div>
  );
}
