import { Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { ProfileCardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { FastConnectionLimitModal } from "../components/profile/FastConnectionLimitModal";
import { FastConnectionRenewalSheet } from "../components/profile/FastConnectionRenewalSheet";
import { ERROR_COPY } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { completePendingPayment, startFastConnectionRenewalPayment } from "../services/payments";
import {
  fetchFastConnectionPool,
  fetchFastConnectionSignalStatus,
  sendFastConnectionSignalRemote
} from "../services/fastConnectionPool";
import type { DiscoverProfile, UserProfile } from "../types";
import { applyQuickieIntentAfterPayment } from "../utils/fastConnectionIntent";
import { fastSignalsStatusLabel, type FastSignalStatus } from "../utils/fastSignals";
import { fastConnectionActiveLabel } from "../utils/quickie";
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
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [signalSent, setSignalSent] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [cardKey, setCardKey] = useState(0);

  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const statusLabel = signalStatus.passActive ? fastConnectionActiveLabel() : null;

  const deck = useMemo(
    () => filterDiscoverDeck(profiles, viewer, blocked, passedIds),
    [profiles, viewer, blocked, passedIds]
  );
  const current = deck[0];

  const loadStatus = useCallback(async () => {
    const status = await fetchFastConnectionSignalStatus(user);
    setSignalStatus(status);
    if (!status.passActive) {
      setRenewalOpen(true);
      setProfiles([]);
      setLoading(false);
      return false;
    }
    setRenewalOpen(false);
    return true;
  }, [user]);

  const loadPool = useCallback(async () => {
    setLoading(true);
    const active = await loadStatus();
    if (!active) return;

    const exclude = [...blocked, ...passedIds];
    const result = await fetchFastConnectionPool(user, exclude);
    if (!result.passActive) {
      setRenewalOpen(true);
      setProfiles([]);
      setLoading(false);
      return;
    }
    setProfiles(result.profiles);
    setLocationTier(result.locationTier);
    setLoading(false);
  }, [blocked, loadStatus, passedIds, user]);

  useEffect(() => {
    void loadPool();
  }, [loadPool]);

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

  const handleRenew = async () => {
    if (renewalLoading) return;
    setRenewalLoading(true);
    try {
      const result = await startFastConnectionRenewalPayment(user);
      if (!result.ok) {
        if (!result.cancelled) {
          showToast(result.error || "Payment could not start.");
        }
        return;
      }
      if (result.needsVerify) {
        const verified = await completePendingPayment(user);
        if (verified.ok) {
          applyQuickieIntentAfterPayment(user, verified.quickiePassUntil);
          setRenewalOpen(false);
          await loadPool();
          return;
        }
        if (!verified.pending) {
          showToast(verified.error || "Fast Connection was not activated.");
        }
      }
    } finally {
      setRenewalLoading(false);
    }
  };

  const handleIgnore = () => {
    if (!current) return;
    advance(current.id);
  };

  const handleSendSignal = async () => {
    if (!current || signalSent || !signalStatus.passActive) return;
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

      if (!result.status.passActive) {
        setRenewalOpen(true);
        return;
      }

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
    signalStatus.passActive && locationTier === "city"
      ? `Showing Fast Connection members in ${viewer.city || "your city"}.`
      : signalStatus.passActive && locationTier === "state"
        ? `Showing Fast Connection members in ${viewer.state || "your state"}.`
        : null;

  const signalsLabel = signalStatus.passActive
    ? fastSignalsStatusLabel(signalStatus.remaining, signalStatus.dailyLimit, signalStatus.usedToday)
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
          {signalsLabel ? <p className="fast-connection-page__signals-left">{signalsLabel}</p> : null}
          {locationHint ? <p className="fast-connection-page__location-hint">{locationHint}</p> : null}
        </div>
      </header>

      {toast ? (
        <p className="profile-mod-toast" role="status">
          {toast}
        </p>
      ) : null}

      {signalStatus.passActive && loading ? <ProfileCardSkeleton /> : null}

      {signalStatus.passActive && !loading && !current ? (
        <EmptyState
          icon={Zap}
          title="No Fast Connection matches nearby yet."
          message="Check back later as more people join."
          actionLabel="Back to Home"
          onAction={onHome}
        />
      ) : null}

      {signalStatus.passActive && !loading && current ? (
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

      <FastConnectionRenewalSheet
        open={renewalOpen}
        onClose={() => {
          setRenewalOpen(false);
          onHome();
        }}
        onRenew={() => void handleRenew()}
        loading={renewalLoading}
      />

      <FastConnectionLimitModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        onUpgradePremium={onOpenPremium}
      />
    </div>
  );
}
