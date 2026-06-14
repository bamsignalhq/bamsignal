import { useEffect, useMemo, useState } from "react";
import { Compass } from "lucide-react";
import { BRAND } from "../constants/copy";
import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import { MOCK_PROFILES } from "../data/mockProfiles";
import { DiscoverFilters } from "../components/DiscoverFilters";
import { DiscoverCityHeader } from "../components/discover/DiscoverCityHeader";
import { DiscoverLimitsBar } from "../components/discover/DiscoverLimitsBar";
import { DiscoverPremiumNudge } from "../components/discover/DiscoverPremiumNudge";
import { DiscoverQuickFilters } from "../components/discover/DiscoverQuickFilters";
import { DiscoverTrending } from "../components/discover/DiscoverTrending";
import { ProfileCardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { PaywallModal } from "../components/PaywallModal";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { ProfileCard } from "../components/ProfileCard";
import { ReportBlockModal } from "../components/ReportBlockModal";
import { SignalRadar, profilesToRadarNodes } from "../components/SignalRadar";
import type { DiscoverMode, DiscoverProfile, Match, MatchPreferences, UserProfile } from "../types";
import type { PremiumPlan } from "../constants/plans";
import {
  computeCompatibilityPercent,
  compatibilitySubtitle,
  getProfileMatchReasons
} from "../utils/compatibility";
import { buildDiscoveryDeck, countSameCityProfiles, recordDiscoveryImpression } from "../utils/launchSeed";
import { buildDensityAwareDeck } from "../utils/cityDensity";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { trackUpgradeImpression } from "../utils/premiumConversion";
import {
  defaultDatingProfile,
  defaultMatchPreferences,
  normalizeDatingProfile,
  normalizeMatchPreferences
} from "../utils/profile";
import { blockUser, canUserSignalTarget, filterDiscoverDeck } from "../utils/safety";
import { getTrustLevel } from "../utils/trust";
import { getVerificationTier } from "../utils/verification";
import { getSignalsSentCount, incrementSignalsSent } from "../utils/streaks";
import { trackEvent } from "../utils/analytics";
import { notifySignalAccepted } from "../utils/notifyHelpers";
import { getRemainingDaily, incrementDailyCount, readDailyCount, readJson, writeJson } from "../utils/storage";
import {
  evaluateDiscoverStateChange,
  milesToKm,
  recordDiscoverStateChange,
  remainingFreeStateChanges
} from "../utils/discoverLocation";
import {
  applyDiscoverPreferences,
  applyQuickFilter,
  trendingSections,
  type DiscoverQuickFilter
} from "../utils/discoverFilters";
import { isViewerShadowBanned } from "../utils/shadowBan";
import { consumePrioritySignal, getViewerBoostSummary } from "../utils/activeBoosts";
import { persistMatchRemote, persistSignalRemote } from "../services/memberData";

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
  onMatch,
  onUpgrade,
  paymentLoading
}: DiscoverPageProps) {
  const [mode, setMode] = useState<DiscoverMode>("signals");
  const [quickFilter, setQuickFilter] = useState<DiscoverQuickFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [passedIds, setPassedIds] = useState<string[]>(() =>
    readJson<string[]>(STORAGE_KEYS.passed, [])
  );
  const [prefs, setPrefs] = useState<MatchPreferences>(() =>
    normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}))
  );
  const [radarSelected, setRadarSelected] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signalSent, setSignalSent] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const [viewer, setViewer] = useState(() =>
    normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}))
  );
  const [deckReady, setDeckReady] = useState(false);

  const { baseDeck, densityMessage } = useMemo(() => {
    const available = filterDiscoverDeck(MOCK_PROFILES, viewer, blocked, passedIds);
    const { deck, density } = buildDensityAwareDeck(available, viewer, prefs, blocked, passedIds);
    return {
      baseDeck: applyDiscoverPreferences(deck, prefs, viewer),
      densityMessage: density.message
    };
  }, [passedIds, blocked, viewer, prefs]);

  const deck = useMemo(
    () => applyQuickFilter(baseDeck, quickFilter),
    [baseDeck, quickFilter]
  );

  const trending = useMemo(() => trendingSections(baseDeck), [baseDeck]);

  const memberUser = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const boostSummary = useMemo(() => getViewerBoostSummary(memberUser), [memberUser.email, memberUser.phone]);
  const boostBanner =
    boostSummary.profileBoost || boostSummary.signalBoost || boostSummary.priorityPending;

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [toast, setToast] = useState("");

  const current =
    deck.find((p) => p.id === (focusedId ?? radarSelected)) ?? deck[0];
  const radarNodes = profilesToRadarNodes(deck.slice(0, 8));

  const remaining = getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES);
  const atLimit = !isPremium && remaining <= 0;

  const signalGate = current ? canUserSignalTarget(viewer, current, prefs) : { allowed: true as const };
  const showFirstSignalNudge =
    getSignalsSentCount() === 0 &&
    Boolean(localStorage.getItem(STORAGE_KEYS.firstSignalPromptAt)) &&
    Date.now() - Number(localStorage.getItem(STORAGE_KEYS.firstSignalPromptAt)) < 5 * 60 * 1000;

  useEffect(() => {
    markFirstDayStep("discover_opened");
  }, []);

  useEffect(() => {
    setDeckReady(false);
    const t = window.setTimeout(() => setDeckReady(true), 180);
    return () => window.clearTimeout(t);
  }, [baseDeck.length, quickFilter, prefs]);

  useEffect(() => {
    if (current?.id) recordDiscoveryImpression(current.id);
  }, [current?.id]);

  useEffect(() => {
    setCardKey((k) => k + 1);
  }, [current?.id]);

  const savePrefs = (next: MatchPreferences) => {
    setPrefs(next);
    writeJson(STORAGE_KEYS.matchPreferences, next);
  };

  const discoverState = viewer.state ?? "Lagos";
  const freeStateChangesLeft = remainingFreeStateChanges(isPremium);

  const updateDiscoverLocation = (state: string, city: string) => {
    const prevState = discoverState;
    if (state !== prevState) {
      const gate = evaluateDiscoverStateChange(prevState, state, isPremium);
      if (!gate.allowed) {
        trackEvent("paywall_seen", { source: "discover_state_change" });
        trackUpgradeImpression("discover_state_change");
        setPaywallOpen(true);
        return;
      }
      recordDiscoverStateChange();
    }
    const nextViewer = { ...viewer, state, city };
    setViewer(nextViewer);
    writeJson(STORAGE_KEYS.datingProfile, { ...nextViewer, premium: isPremium });
    setPassedIds([]);
    writeJson(STORAGE_KEYS.passed, []);
  };

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
    setRadarSelected(null);
    setFocusedId(null);
  };

  const finishSignal = (profile: DiscoverProfile, opts?: { priority?: boolean }) => {
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const suppressed = isViewerShadowBanned(user.phone, user.email);
    const priority = opts?.priority ?? false;
    persistSignalRemote(user, profile.id, priority ? "priority" : "signal");

    if (suppressed) {
      setToast(
        priority
          ? `${BRAND.prioritySignal} sent to ${profile.name}! ⚡`
          : `${BRAND.signalSent} to ${profile.name} ⚡`
      );
      setTimeout(() => setToast(""), 3000);
      advance(profile.id);
      return;
    }

    if (Math.random() > 0.55) {
      const match: Match = {
        id: `m-${profile.id}`,
        profileId: profile.id,
        name: profile.name,
        photo: profile.photo,
        city: profile.city,
        matchedAt: new Date().toISOString(),
        lastActiveAt: profile.lastActiveAt
      };
      const matches = readJson<Match[]>(STORAGE_KEYS.matches, []);
      if (!matches.some((m) => m.profileId === profile.id)) {
        writeJson(STORAGE_KEYS.matches, [...matches, match]);
        persistMatchRemote(user, match);
        const received = readJson<number>(STORAGE_KEYS.signalsReceived, 0) + 1;
        writeJson(STORAGE_KEYS.signalsReceived, received);
        trackEvent("signal_accepted", { profileId: profile.id });
        trackEvent("signal_received", { profileId: profile.id });
        markFirstDayStep("first_connection");
        notifySignalAccepted(profile.name);
        onMatch(match);
        setToast(`${BRAND.signalAccepted}! ${profile.name} signaled back ⚡`);
        setTimeout(() => setToast(""), 3000);
      }
    } else {
      setToast(
        priority
          ? `${BRAND.prioritySignal} sent to ${profile.name}! ⚡`
          : `${BRAND.signalSent} to ${profile.name} ⚡`
      );
      setTimeout(() => setToast(""), 3000);
    }
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

  const handleTrendingSelect = (profile: DiscoverProfile) => {
    setFocusedId(profile.id);
    setMode("signals");
    setProfileOpen(true);
  };

  const renderEmpty = () => {
    const sameCityCount = countSameCityProfiles(MOCK_PROFILES, viewer.city, blocked, passedIds);
    const lowCityDensity = sameCityCount < 2;
    const filteredEmpty = baseDeck.length > 0 && deck.length === 0;

    return (
      <EmptyState
        icon={Compass}
        title={
          filteredEmpty
            ? "No signals match this filter."
            : lowCityDensity
              ? `We're growing quickly in ${viewer.city || "your city"}.`
              : "No new signals nearby."
        }
        message={
          filteredEmpty
            ? "Try a different filter or expand your discovery settings."
            : lowCityDensity
              ? "Expand your distance or check back later as more people join."
              : "Expand your distance or check back later."
        }
        actionLabel={filteredEmpty ? "Clear filter" : "Expand Discovery"}
        onAction={() =>
          filteredEmpty
            ? setQuickFilter("all")
            : savePrefs({
                ...prefs,
                distanceMax: Math.max(prefs.distanceMax ?? milesToKm(15), milesToKm(50))
              })
        }
        secondaryLabel="Reset filters"
        onSecondary={() => savePrefs(defaultMatchPreferences())}
      />
    );
  };

  if (!current && mode !== "trending") {
    return (
      <div className="page discover-page discover-v2">
        <DiscoverCityHeader
          city={viewer.city}
          profiles={MOCK_PROFILES}
          blocked={blocked}
          passedIds={passedIds}
        />
        <DiscoverQuickFilters
          active={quickFilter}
          onChange={setQuickFilter}
          isPremium={isPremium}
          onAdvancedFilters={() => setFiltersOpen(true)}
        />
        {renderEmpty()}
        <DiscoverFilters
          prefs={prefs}
          onChange={savePrefs}
          discoverState={discoverState}
          discoverCity={viewer.city}
          onDiscoverLocationChange={updateDiscoverLocation}
          freeStateChangesRemaining={freeStateChangesLeft}
          isPremium={isPremium}
          onRequirePremium={() => {
            trackEvent("paywall_seen", { source: "online_now_filter" });
            setPaywallOpen(true);
          }}
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          hideTrigger
        />
      </div>
    );
  }

  const compatibility = current ? computeCompatibilityPercent(viewer, current) : 0;
  const compatSub = current ? compatibilitySubtitle(viewer, current, compatibility) : "";
  const matchReasons = current ? getProfileMatchReasons(viewer, current) : [];
  const verification = current
    ? getVerificationTier({ ...defaultDatingProfile(), verified: current.verified }, false, true)
    : getVerificationTier(defaultDatingProfile(), false, true);
  const trust = current
    ? getTrustLevel(
        { ...defaultDatingProfile(), verified: current.verified, createdAt: new Date().toISOString() },
        false,
        true,
        0
      )
    : getTrustLevel(defaultDatingProfile(), false, true, 0);

  return (
    <div className="page discover-page discover-v2">
      <DiscoverCityHeader
        city={viewer.city}
        profiles={MOCK_PROFILES}
        blocked={blocked}
        passedIds={passedIds}
      />

      <DiscoverQuickFilters
        active={quickFilter}
        onChange={setQuickFilter}
        isPremium={isPremium}
        onAdvancedFilters={() => setFiltersOpen(true)}
      />

      {densityMessage && (
        <p className="discover-density-note" role="status">
          {densityMessage}
        </p>
      )}

      <DiscoverLimitsBar isPremium={isPremium} />

      {boostBanner && (
        <p className="discover-boost-banner" role="status">
          {boostSummary.profileBoost && "Profile Boost active — you're featured at the top of local results. "}
          {boostSummary.signalBoost && "Signal Boost active — extra visibility in your city. "}
          {boostSummary.priorityPending && "Priority Signal ready — your next signal lands first."}
        </p>
      )}

      <div className="discover-mode-tabs" role="tablist" aria-label="Discover modes">
        {(["signals", "radar", "trending"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mode === tab}
            className={mode === tab ? "active" : ""}
            onClick={() => setMode(tab)}
          >
            {tab === "signals" ? "Signals" : tab === "radar" ? "Radar" : "Trending"}
          </button>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}

      {showFirstSignalNudge && mode === "signals" && (
        <div className="first-signal-nudge card" role="status">
          <strong>Nearby signals are ready</strong>
          <p>Send your first signal — it takes less than a minute.</p>
        </div>
      )}

      {mode === "radar" && (
        <div className="discover-radar-wrap">
          <h2 className="discover-radar-title">{BRAND.nearbySignals}</h2>
          <SignalRadar
            nodes={radarNodes}
            selectedId={current?.id}
            onSelect={(id) => {
              setRadarSelected(id);
              setMode("signals");
            }}
          />
        </div>
      )}

      {mode === "trending" && (
        <DiscoverTrending
          active={trending.active}
          verified={trending.verified}
          newMembers={trending.newMembers}
          onSelect={handleTrendingSelect}
        />
      )}

      {mode === "signals" && !deckReady && <ProfileCardSkeleton />}

      {mode === "signals" && deckReady && current && (
        <ProfileCard
          key={cardKey}
          profile={current}
          compatibilityPercent={compatibility}
          compatibilitySubtitle={compatSub}
          matchReasons={matchReasons}
          verification={verification.tier ? verification : undefined}
          trust={trust.level !== "none" ? trust : undefined}
          isPremium={isPremium}
          onIgnore={handleIgnore}
          onSendSignal={handleSendSignal}
          onPrioritySignal={handlePrioritySignal}
          onSafety={() => setSafetyOpen(true)}
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
          compatibilitySubtitle={compatSub}
          verification={verification.tier ? verification : undefined}
          trust={trust.level !== "none" ? trust : undefined}
        />
      )}

      {atLimit && <DiscoverPremiumNudge onUpgrade={() => setPaywallOpen(true)} />}

      <DiscoverFilters
        prefs={prefs}
        onChange={savePrefs}
        discoverState={discoverState}
        discoverCity={viewer.city}
        onDiscoverLocationChange={updateDiscoverLocation}
        freeStateChangesRemaining={freeStateChangesLeft}
        isPremium={isPremium}
        onRequirePremium={() => {
          trackUpgradeImpression("premium_filter");
          trackEvent("paywall_seen", { source: "online_now_filter" });
          setPaywallOpen(true);
        }}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        hideTrigger
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
        />
      )}
    </div>
  );
}
