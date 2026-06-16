import { useEffect, useMemo, useState } from "react";
import { Compass } from "lucide-react";
import { BRAND } from "../constants/copy";
import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import { fetchDiscoverProfiles } from "../services/discoverProfiles";
import { sendSignalRemote } from "../services/memberData";
import { DiscoverHeader } from "../components/discover/DiscoverHeader";
import { DiscoverPremiumNudge } from "../components/discover/DiscoverPremiumNudge";
import { DiscoverQuickFilters } from "../components/discover/DiscoverQuickFilters";
import { ProfileCardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { PaywallModal } from "../components/PaywallModal";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { ProfileCard } from "../components/ProfileCard";
import { ReportBlockModal } from "../components/ReportBlockModal";
import type { DiscoverProfile, Match, MatchPreferences, UserProfile } from "../types";
import type { PremiumPlan } from "../constants/plans";
import {
  computeCompatibilityPercent,
  getProfileMatchReasons
} from "../utils/compatibility";
import { recordDiscoveryImpression } from "../utils/launchSeed";
import { buildDensityAwareDeck } from "../utils/cityDensity";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { trackUpgradeImpression } from "../utils/premiumConversion";
import {
  defaultDatingProfile,
  normalizeDatingProfile,
  normalizeMatchPreferences
} from "../utils/profile";
import { blockUser, canUserSignalTarget, filterDiscoverDeck } from "../utils/safety";
import { getVerificationTier } from "../utils/verification";
import { incrementSignalsSent } from "../utils/streaks";
import { trackEvent } from "../utils/analytics";
import { getMemberCity } from "../utils/memberCity";
import { getRemainingDaily, incrementDailyCount, readDailyCount, readJson, writeJson } from "../utils/storage";
import { applyDiscoverPreferences, applyQuickFilter, type DiscoverQuickFilter } from "../utils/discoverFilters";
import { isViewerShadowBanned } from "../utils/shadowBan";
import { consumePrioritySignal } from "../utils/activeBoosts";

const SIGNAL_ANIM_MS = 700;

type DiscoverPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onMatch: (match: Match) => void;
  onUpgrade: (plan: PremiumPlan) => void;
  paymentLoading?: boolean;
};

export function DiscoverPage({
  isPremium,
  plans,
  onMatch: _onMatch,
  onUpgrade,
  paymentLoading
}: DiscoverPageProps) {
  void _onMatch;

  const [quickFilter, setQuickFilter] = useState<DiscoverQuickFilter>("all");
  const [passedIds, setPassedIds] = useState<string[]>(() =>
    readJson<string[]>(STORAGE_KEYS.passed, [])
  );
  const [prefs] = useState<MatchPreferences>(() =>
    normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}))
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [signalSent, setSignalSent] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const [viewer] = useState(() =>
    normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}))
  );
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState<DiscoverProfile[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProfilesLoading(true);
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const city = viewer.city || getMemberCity() || "";
    void fetchDiscoverProfiles(user, city, [...blocked, ...passedIds])
      .then((profiles) => {
        if (cancelled) return;
        setAllProfiles(profiles);
      })
      .finally(() => {
        if (!cancelled) setProfilesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewer.city, blocked.length, passedIds.length]);

  const baseDeck = useMemo(() => {
    const available = filterDiscoverDeck(allProfiles, viewer, blocked, passedIds);
    const { deck } = buildDensityAwareDeck(available, viewer, prefs, blocked, passedIds);
    return applyDiscoverPreferences(deck, prefs, viewer);
  }, [passedIds, blocked, viewer, prefs, allProfiles]);

  const deck = useMemo(
    () => applyQuickFilter(baseDeck, quickFilter),
    [baseDeck, quickFilter]
  );

  const memberUser = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const current = deck[0];
  const remaining = getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES);
  const atLimit = !isPremium && remaining <= 0;
  const signalGate = current ? canUserSignalTarget(viewer, current, prefs) : { allowed: true as const };

  useEffect(() => {
    markFirstDayStep("discover_opened");
  }, []);

  useEffect(() => {
    if (current?.id) recordDiscoveryImpression(current.id);
  }, [current?.id]);

  useEffect(() => {
    setCardKey((k) => k + 1);
  }, [current?.id]);

  const canSignal = () => {
    if (isPremium) return true;
    if (readDailyCount(STORAGE_KEYS.dailySwipes) >= FREE_DAILY_SWIPES) {
      trackEvent("paywall_seen", { source: "discover_swipes" });
      trackUpgradeImpression("signal_limit");
      setPaywallOpen(true);
      return false;
    }
    return true;
  };

  const useSwipe = () => {
    if (!isPremium) incrementDailyCount(STORAGE_KEYS.dailySwipes);
  };

  const advance = (profileId: string) => {
    const nextPassed = [...passedIds, profileId];
    setPassedIds(nextPassed);
    writeJson(STORAGE_KEYS.passed, nextPassed);
  };

  const finishSignal = async (profile: DiscoverProfile, opts?: { priority?: boolean }) => {
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const priority = opts?.priority ?? false;
    const sent = await sendSignalRemote(user, profile.id, priority ? "priority" : "signal");

    if (!sent) {
      setToast("Could not send signal. Check your connection and try again.");
      setTimeout(() => setToast(""), 3500);
      advance(profile.id);
      return;
    }

    setToast(
      priority
        ? `${BRAND.prioritySignal} sent to ${profile.name}!`
        : `${BRAND.signalSent} to ${profile.name}`
    );
    setTimeout(() => setToast(""), 3000);
    advance(profile.id);
  };

  const handleIgnore = () => {
    if (!current) return;
    if (!atLimit) useSwipe();
    advance(current.id);
  };

  const handleSendSignal = () => {
    if (!current || !canSignal() || signalSent) return;
    if (!signalGate.allowed) {
      setToast(signalGate.reason);
      setTimeout(() => setToast(""), 3500);
      return;
    }
    setSignalSent(true);
    useSwipe();
    incrementSignalsSent();
    markFirstDayStep("first_signal");
    const profile = current;
    const priority = consumePrioritySignal();
    trackEvent("signal_sent", { profileId: current.id, priority: priority ? "true" : "false" });
    setTimeout(() => {
      setSignalSent(false);
      finishSignal(profile, { priority });
    }, SIGNAL_ANIM_MS);
  };

  const handlePrioritySignal = () => {
    if (!current || !canSignal() || !signalGate.allowed || signalSent) return;
    setSignalSent(true);
    useSwipe();
    incrementSignalsSent();
    markFirstDayStep("first_signal");
    trackEvent("signal_sent", { profileId: current.id, priority: "true" });
    const profile = current;
    const usedBoost = consumePrioritySignal();
    setTimeout(() => {
      setSignalSent(false);
      finishSignal(profile, { priority: usedBoost || isPremium });
    }, SIGNAL_ANIM_MS);
  };

  const handleBlock = () => {
    if (!current) return;
    blockUser(current.id);
    advance(current.id);
    setToast(`${current.name} blocked. They won't appear in your discovery.`);
    setTimeout(() => setToast(""), 3000);
  };

  const renderEmpty = () => {
    const filteredEmpty = baseDeck.length > 0 && deck.length === 0;

    return (
      <EmptyState
        icon={Compass}
        title={filteredEmpty ? "No matches for this filter" : "No profiles to discover"}
        message={filteredEmpty ? "Try another filter." : "Check back soon for more people."}
        actionLabel={filteredEmpty ? "Clear filter" : undefined}
        onAction={filteredEmpty ? () => setQuickFilter("all") : undefined}
      />
    );
  };

  const compatibility = current ? computeCompatibilityPercent(viewer, current) : 0;
  const matchReasons = current ? getProfileMatchReasons(viewer, current) : [];
  const verification = current
    ? getVerificationTier({ ...defaultDatingProfile(), verified: current.verified }, false, true)
    : getVerificationTier(defaultDatingProfile(), false, true);

  return (
    <div className="page discover-page discover-v2 discover-v2--clean">
      <DiscoverHeader />
      <DiscoverQuickFilters active={quickFilter} onChange={setQuickFilter} />

      {toast && <div className="toast">{toast}</div>}

      {profilesLoading && <ProfileCardSkeleton />}

      {!profilesLoading && !current && renderEmpty()}

      {!profilesLoading && current && (
        <ProfileCard
          key={cardKey}
          profile={current}
          verification={verification.tier ? verification : undefined}
          isPremium={isPremium}
          onIgnore={handleIgnore}
          onSendSignal={handleSendSignal}
          onPrioritySignal={handlePrioritySignal}
          onReport={() => setSafetyOpen(true)}
          onBlock={handleBlock}
          onViewProfile={() => {
            markFirstDayStep("compat_viewed");
            setProfileOpen(true);
          }}
          signalBlockedReason={!signalGate.allowed ? signalGate.reason : undefined}
          signalSent={signalSent}
          entering
        />
      )}

      {current && (
        <ProfileDetailSheet
          profile={current}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          matchReasons={matchReasons}
          compatibilityPercent={compatibility}
          verification={verification.tier ? verification : undefined}
          onSendSignal={handleSendSignal}
          onPass={handleIgnore}
          onPrioritySignal={handlePrioritySignal}
          onReport={() => setSafetyOpen(true)}
          onBlock={handleBlock}
          isPremium={isPremium}
          signalSent={signalSent}
          viewer={memberUser}
        />
      )}

      {atLimit && <DiscoverPremiumNudge onUpgrade={() => setPaywallOpen(true)} />}

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        plans={plans}
        onSelectPlan={(plan) => {
          onUpgrade(plan);
          setPaywallOpen(false);
        }}
        loading={paymentLoading}
      />

      {current && (
        <ReportBlockModal
          open={safetyOpen}
          userName={current.name}
          profileId={current.id}
          onClose={() => setSafetyOpen(false)}
          onBlock={handleBlock}
        />
      )}
    </div>
  );
}
