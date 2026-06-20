import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { Compass } from "lucide-react";
import { BRAND, ERROR_COPY, SUCCESS_COPY } from "../constants/copy";
import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import { fetchDiscoverProfiles, searchMemberProfiles } from "../services/discoverProfiles";
import { sendSignalRemote } from "../services/memberData";
import { DiscoverHeader } from "../components/discover/DiscoverHeader";
import { DiscoverQuickFilters } from "../components/discover/DiscoverQuickFilters";
import { SignalLimitModal } from "../components/premium/SignalLimitModal";
import { ProfileCardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { PaywallModal } from "../components/PaywallModal";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { DiscoverProfileCard } from "../components/discover/DiscoverProfileCard";
import { DiscoverSafetyCard } from "../components/discover/DiscoverSafetyCard";
import { DiscoverFilters } from "../components/DiscoverFilters";
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
import { blockAndReportUser, blockUser, canUserSignalTarget, filterDiscoverDeck } from "../utils/safety";
import { pushPassedProfile, canUndoPass, undoLastPass } from "../utils/undoPass";
import { getVerificationTier } from "../utils/verification";
import { incrementSignalsSent } from "../utils/streaks";
import { trackEvent } from "../utils/analytics";
import { getMemberCity } from "../utils/memberCity";
import { resolveSearchLocationFromPrefs } from "../utils/searchLocationPrefs";
import { getRemainingDaily, incrementDailyCount, readDailyCount, readJson, writeJson } from "../utils/storage";
import { applyDiscoverPreferences, applyQuickFilter, countActiveDiscoverFilters, type DiscoverQuickFilter } from "../utils/discoverFilters";
import { isViewerShadowBanned } from "../utils/shadowBan";
import { checkSignalBurst } from "../utils/suspicionDetection";
import { reportModerationFlagRemote } from "../services/memberTrust";
import { consumePrioritySignal } from "../utils/activeBoosts";
import { useAndroidBack } from "../hooks/useAndroidBack";

const SIGNAL_ANIM_MS = 700;

type DiscoverPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onMatch: (match: Match) => void;
  onUpgrade: (plan: PremiumPlan) => void;
  onStartPremiumCheckout: () => void;
  paymentLoading?: boolean;
  onOpenSafety?: () => void;
};

export function DiscoverPage({
  isPremium,
  plans,
  onMatch: _onMatch,
  onUpgrade,
  onStartPremiumCheckout,
  paymentLoading,
  onOpenSafety
}: DiscoverPageProps) {
  void _onMatch;

  const [quickFilter, setQuickFilter] = useState<DiscoverQuickFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [passedIds, setPassedIds] = useState<string[]>(() =>
    readJson<string[]>(STORAGE_KEYS.passed, [])
  );
  const { profile: viewer, prefs, setPrefs } = useMemberProfileListener();
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readJson<string[]>(STORAGE_KEYS.savedDiscoverProfiles, [])
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [signalSent, setSignalSent] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const profilesLoadedOnce = useRef(false);
  const [allProfiles, setAllProfiles] = useState<DiscoverProfile[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [signalLimitOpen, setSignalLimitOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!profilesLoadedOnce.current) setProfilesLoading(true);
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const search = resolveSearchLocationFromPrefs(prefs);
    const fallbackCity = viewer.city || getMemberCity() || "";

    void (async () => {
      let profiles: DiscoverProfile[] = [];
      if (search.state || search.cities.length > 0) {
        profiles = await searchMemberProfiles(user, {
          state: search.state,
          cities: search.cities,
          city: search.primaryCity,
          excludeProfileIds: [...blocked, ...passedIds],
          limit: 72
        });
      } else if (fallbackCity) {
        profiles = await fetchDiscoverProfiles(user, fallbackCity, [...blocked, ...passedIds]);
      }
      if (cancelled) return;
      setAllProfiles(profiles);
      profilesLoadedOnce.current = true;
      if (!cancelled) setProfilesLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [viewer.city, viewer.bio, viewer.interests, blocked.length, passedIds.length, prefs.states, prefs.cities, prefs.religions, prefs.ethnicities, prefs.lifestyles, prefs.relationshipIntentions]);

  const baseDeck = useMemo(() => {
    const available = filterDiscoverDeck(allProfiles, viewer, blocked, passedIds);
    const { deck } = buildDensityAwareDeck(available, viewer, prefs, blocked, passedIds);
    return applyDiscoverPreferences(deck, prefs, viewer);
  }, [passedIds, blocked, viewer, prefs, allProfiles]);

  const deck = useMemo(
    () => applyQuickFilter(baseDeck, quickFilter),
    [baseDeck, quickFilter]
  );

  const memberCity = viewer.city || getMemberCity() || "Lagos";
  const cityLabel = prefs.cities?.[0] || memberCity;
  const stateLabel = prefs.states?.[0] || viewer.state || "";
  const browseLocation = stateLabel ? `${cityLabel}, ${stateLabel}` : `${cityLabel}, Nigeria`;
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

  useAndroidBack(() => {
    if (filtersOpen) {
      setFiltersOpen(false);
      return true;
    }
    if (safetyOpen) {
      setSafetyOpen(false);
      return true;
    }
    if (profileOpen) {
      setProfileOpen(false);
      return true;
    }
    if (signalLimitOpen) {
      setSignalLimitOpen(false);
      return true;
    }
    if (paywallOpen) {
      setPaywallOpen(false);
      return true;
    }
    return false;
  });

  const canSignal = () => {
    if (isPremium) return true;
    if (readDailyCount(STORAGE_KEYS.dailySwipes) >= FREE_DAILY_SWIPES) {
      trackEvent("paywall_seen", { source: "discover_swipes" });
      trackUpgradeImpression("signal_limit");
      setSignalLimitOpen(true);
      return false;
    }
    return true;
  };

  const useSwipe = () => {
    if (!isPremium) incrementDailyCount(STORAGE_KEYS.dailySwipes);
  };

  const advance = (profileId: string) => {
    pushPassedProfile(profileId);
    setPassedIds(readJson<string[]>(STORAGE_KEYS.passed, []));
    setCardKey((k) => k + 1);
  };

  const handleUndoPass = () => {
    if (!canUndoPass(isPremium)) {
      setToast("Signal Pass gives you unlimited undo.");
      setTimeout(() => setToast(""), 3500);
      trackUpgradeImpression("signal_limit");
      setPaywallOpen(true);
      return;
    }
    const restoredId = undoLastPass(isPremium);
    if (!restoredId) return;
    setPassedIds(readJson<string[]>(STORAGE_KEYS.passed, []));
    setCardKey((k) => k + 1);
    setToast("Undo");
    setTimeout(() => setToast(""), 2500);
  };

  const finishSignal = async (profile: DiscoverProfile, opts?: { priority?: boolean }) => {
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const priority = opts?.priority ?? false;
    const sent = await sendSignalRemote(user, profile.id, priority ? "priority" : "signal");

    if (!sent.ok) {
      setToast(sent.error || ERROR_COPY.signalFailed);
      setTimeout(() => setToast(""), 3500);
      advance(profile.id);
      return;
    }

    const burst = checkSignalBurst();
    if (burst && "count" in burst) {
      void reportModerationFlagRemote(user, burst.reason, { count: burst.count }, profile.id);
    }

    setToast(
      priority ? `${BRAND.prioritySignal} sent` : BRAND.signalSent
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

  const handleBlockAndReport = (reason: import("../types").ReportReason, details?: string) => {
    if (!current) return;
    blockAndReportUser(current.id, reason, details);
    advance(current.id);
    setProfileOpen(false);
    setSafetyOpen(false);
    setToast(`${current.name} blocked and reported.`);
    setTimeout(() => setToast(""), 3500);
  };

  const handleSave = () => {
    if (!current) return;
    const alreadySaved = savedIds.includes(current.id);
    const next = alreadySaved
      ? savedIds.filter((id) => id !== current.id)
      : [...savedIds, current.id];
    setSavedIds(next);
    writeJson(STORAGE_KEYS.savedDiscoverProfiles, next);
    setToast(alreadySaved ? "Removed from saved" : "Saved for later");
    setTimeout(() => setToast(""), 2500);
  };

  const memberUser = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });

  const renderEmpty = () => {
    const filteredEmpty = baseDeck.length > 0 && deck.length === 0;

    return (
      <EmptyState
        icon={Compass}
        title={filteredEmpty ? SUCCESS_COPY.discoverFilterEmpty : SUCCESS_COPY.discoverEmpty}
        message={filteredEmpty ? SUCCESS_COPY.discoverFilterEmptyHint : SUCCESS_COPY.discoverEmptyHint}
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
    <div className="page discover-page discover-page--premium member-content-pad">
      <DiscoverHeader
        cityLabel={browseLocation}
        filterCount={countActiveDiscoverFilters(prefs)}
        onOpenFilters={() => setFiltersOpen(true)}
      />
      <DiscoverQuickFilters active={quickFilter} onChange={setQuickFilter} />
      {passedIds.length > 0 ? (
        <button type="button" className="discover-undo-btn" onClick={handleUndoPass}>
          Undo
        </button>
      ) : null}

      {toast && <div className="toast">{toast}</div>}

      {profilesLoading && <ProfileCardSkeleton />}

      {!profilesLoading && !current && renderEmpty()}

      {!profilesLoading && current && (
        <>
          <DiscoverProfileCard
            key={cardKey}
            profile={current}
            verification={verification.tier ? verification : undefined}
            saved={savedIds.includes(current.id)}
            onIgnore={handleIgnore}
            onSave={handleSave}
            onSendSignal={handleSendSignal}
            onViewProfile={() => {
              markFirstDayStep("compat_viewed");
              setProfileOpen(true);
            }}
            signalBlockedReason={!signalGate.allowed ? signalGate.reason : undefined}
            signalSent={signalSent}
            entering
          />
          <DiscoverSafetyCard onClick={onOpenSafety} />
        </>
      )}

      <DiscoverFilters
        prefs={prefs}
        onChange={(next) => {
          setPrefs(next);
          writeJson(STORAGE_KEYS.matchPreferences, next);
        }}
        discoverState={stateLabel || prefs.states?.[0] || ""}
        discoverCity={cityLabel}
        onDiscoverLocationChange={(state, city) => {
          const next = {
            ...prefs,
            states: state ? [state] : [],
            cities: city ? [city] : []
          };
          setPrefs(next);
          writeJson(STORAGE_KEYS.matchPreferences, next);
        }}
        isPremium={isPremium}
        onRequirePremium={() => setPaywallOpen(true)}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        hideTrigger
      />

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
          onBlockAndReport={() => setSafetyOpen(true)}
          isPremium={isPremium}
          signalSent={signalSent}
          viewer={memberUser}
        />
      )}

      <SignalLimitModal
        open={signalLimitOpen}
        onClose={() => setSignalLimitOpen(false)}
        onGetSignalPass={() => {
          setSignalLimitOpen(false);
          onStartPremiumCheckout();
        }}
        loading={paymentLoading}
      />

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
          onBlockAndReport={handleBlockAndReport}
        />
      )}
    </div>
  );
}
