import { useEffect, useMemo, useRef, useState } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { BRAND, ERROR_COPY } from "../constants/copy";
import {
  DISCOVER_EMPTY_HEADLINE,
  DISCOVER_EMPTY_SUBTEXT,
  DISCOVER_FEED_BATCH
} from "../constants/discoverExperience";
import type { DiscoverRelationshipFilter } from "../constants/discoverExperience";
import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import { fetchDiscoverProfiles, searchMemberProfiles } from "../services/discoverProfiles";
import { sendSignalRemote } from "../services/memberData";
import { DiscoverHeader } from "../components/discover/DiscoverHeader";
import { DiscoverFiltersBar } from "../components/discover/DiscoverFiltersBar";
import { SignalLimitModal } from "../components/premium/SignalLimitModal";
import { ProfileCardSkeleton } from "../components/Skeleton";
import { PaywallModal } from "../components/PaywallModal";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { ProfileStoryCard } from "../components/discover/ProfileStoryCard";
import { DiscoverSafetyCard } from "../components/discover/DiscoverSafetyCard";
import { DiscoverFilters } from "../components/DiscoverFilters";
import { ReportBlockModal } from "../components/ReportBlockModal";
import type { DiscoverProfile, Match, MatchPreferences, UserProfile } from "../types";
import type { PremiumPlan } from "../constants/plans";
import { recordDiscoveryImpression } from "../utils/launchSeed";
import { buildDensityAwareDeck } from "../utils/cityDensity";
import { rankDiscoverProfiles } from "../utils/buildDiscoverRanking";
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
import {
  applyDiscoverPreferences,
  applyDiscoverRelationshipFilter,
  countActiveDiscoverFilters
} from "../utils/discoverFilters";
import { isViewerShadowBanned } from "../utils/shadowBan";
import { checkSignalBurst } from "../utils/suspicionDetection";
import { reportModerationFlagRemote } from "../services/memberTrust";
import { consumePrioritySignal } from "../utils/activeBoosts";
import { navigateToPath } from "../constants/routes";
import { ProfileReminderCard } from "../components/profile/ProfileReminderCard";
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

  const [quickFilter, setQuickFilter] = useState<DiscoverRelationshipFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [passedIds, setPassedIds] = useState<string[]>(() =>
    readJson<string[]>(STORAGE_KEYS.passed, [])
  );
  const { profile: viewer, prefs, setPrefs } = useMemberProfileListener();
  const [detailProfile, setDetailProfile] = useState<DiscoverProfile | null>(null);
  const [signalSentId, setSignalSentId] = useState<string | null>(null);
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const profilesLoadedOnce = useRef(false);
  const [allProfiles, setAllProfiles] = useState<DiscoverProfile[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [signalLimitOpen, setSignalLimitOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [discoverReminderVisible, setDiscoverReminderVisible] = useState(true);
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
    const preferred = applyDiscoverPreferences(deck, prefs, viewer);
    return rankDiscoverProfiles(preferred, viewer);
  }, [passedIds, blocked, viewer, prefs, allProfiles]);

  const deck = useMemo(
    () => applyDiscoverRelationshipFilter(baseDeck, quickFilter, viewer),
    [baseDeck, quickFilter, viewer]
  );

  const visibleFeed = useMemo(() => deck.slice(0, DISCOVER_FEED_BATCH), [deck]);

  const memberCity = viewer.city || getMemberCity() || "Lagos";
  const cityLabel = prefs.cities?.[0] || memberCity;
  const stateLabel = prefs.states?.[0] || viewer.state || "";
  const browseLocation = stateLabel ? `${cityLabel}, ${stateLabel}` : `${cityLabel}, Nigeria`;
  const remaining = getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES);
  const atLimit = !isPremium && remaining <= 0;

  useEffect(() => {
    markFirstDayStep("discover_opened");
  }, []);

  useEffect(() => {
    for (const profile of visibleFeed) {
      recordDiscoveryImpression(profile.id);
    }
  }, [visibleFeed]);

  useAndroidBack(() => {
    if (filtersOpen) {
      setFiltersOpen(false);
      return true;
    }
    if (safetyOpen) {
      setSafetyOpen(false);
      return true;
    }
    if (detailProfile) {
      setDetailProfile(null);
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
    if (detailProfile?.id === profileId) setDetailProfile(null);
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

  const handleIgnore = (profile: DiscoverProfile) => {
    if (!atLimit) useSwipe();
    advance(profile.id);
  };

  const handleSendSignal = (profile: DiscoverProfile) => {
    const signalGate = canUserSignalTarget(viewer, profile, prefs);
    if (!canSignal() || signalSentId === profile.id) return;
    if (!signalGate.allowed) {
      setToast(signalGate.reason);
      setTimeout(() => setToast(""), 3500);
      return;
    }
    setSignalSentId(profile.id);
    useSwipe();
    incrementSignalsSent();
    markFirstDayStep("first_signal");
    const priority = consumePrioritySignal();
    trackEvent("signal_sent", { profileId: profile.id, priority: priority ? "true" : "false" });
    setTimeout(() => {
      setSignalSentId(null);
      finishSignal(profile, { priority });
    }, SIGNAL_ANIM_MS);
  };

  const handlePrioritySignal = (profile: DiscoverProfile) => {
    const signalGate = canUserSignalTarget(viewer, profile, prefs);
    if (!canSignal() || !signalGate.allowed || signalSentId === profile.id) return;
    setSignalSentId(profile.id);
    useSwipe();
    incrementSignalsSent();
    markFirstDayStep("first_signal");
    trackEvent("signal_sent", { profileId: profile.id, priority: "true" });
    const usedBoost = consumePrioritySignal();
    setTimeout(() => {
      setSignalSentId(null);
      finishSignal(profile, { priority: usedBoost || isPremium });
    }, SIGNAL_ANIM_MS);
  };

  const handleBlock = (profile: DiscoverProfile) => {
    blockUser(profile.id);
    advance(profile.id);
    setToast(`${profile.name} blocked. They won't appear in your discovery.`);
    setTimeout(() => setToast(""), 3000);
  };

  const handleBlockAndReport = (
    profile: DiscoverProfile,
    reason: import("../types").ReportReason,
    details?: string
  ) => {
    blockAndReportUser(profile.id, reason, details);
    advance(profile.id);
    setDetailProfile(null);
    setSafetyOpen(false);
    setToast(`${profile.name} blocked and reported.`);
    setTimeout(() => setToast(""), 3500);
  };

  const handleSaveToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  };

  const memberUser = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });

  const renderEmpty = () => {
    const filteredEmpty = baseDeck.length > 0 && deck.length === 0;

    return (
      <div className="discover-page__empty">
        <h2>{filteredEmpty ? "No matches for this filter yet" : DISCOVER_EMPTY_HEADLINE}</h2>
        <p>{filteredEmpty ? "Try another filter or widen your preferences." : DISCOVER_EMPTY_SUBTEXT}</p>
        {filteredEmpty ? (
          <button type="button" className="btn-primary" onClick={() => setQuickFilter("all")}>
            Show all
          </button>
        ) : null}
      </div>
    );
  };

  const verificationFor = (profile: DiscoverProfile) =>
    getVerificationTier({ ...defaultDatingProfile(), verified: profile.verified }, false, true);

  return (
    <div className="page discover-page discover-page--premium member-content-pad">
      <DiscoverHeader
        cityLabel={browseLocation}
        filterCount={countActiveDiscoverFilters(prefs)}
        onOpenFilters={() => setFiltersOpen(true)}
      />
      <DiscoverFiltersBar active={quickFilter} onChange={setQuickFilter} />

      {discoverReminderVisible ? (
        <ProfileReminderCard
          profile={viewer}
          phoneVerified={Boolean(memberUser.phoneVerified)}
          isPremium={isPremium}
          variant="discover"
          onContinue={() => navigateToPath("/voice-vibe")}
          onDismiss={() => setDiscoverReminderVisible(false)}
        />
      ) : null}

      {passedIds.length > 0 ? (
        <button type="button" className="discover-undo-btn" onClick={handleUndoPass}>
          Undo
        </button>
      ) : null}

      {toast ? <p className="save-profile-toast" role="status">{toast}</p> : null}

      {profilesLoading && <ProfileCardSkeleton />}

      {!profilesLoading && visibleFeed.length === 0 && renderEmpty()}

      {!profilesLoading && visibleFeed.length > 0 ? (
        <div className="discover-page__feed">
          {visibleFeed.map((profile, index) => {
            const signalGate = canUserSignalTarget(viewer, profile, prefs);
            const verification = verificationFor(profile);
            return (
              <ProfileStoryCard
                key={profile.id}
                profile={profile}
                verification={verification.tier ? verification : undefined}
                staggerIndex={index}
                onPass={() => handleIgnore(profile)}
                onSaveToast={handleSaveToast}
                onSignal={() => handleSendSignal(profile)}
                onViewProfile={() => {
                  markFirstDayStep("compat_viewed");
                  setDetailProfile(profile);
                }}
                signalBlockedReason={!signalGate.allowed ? signalGate.reason : undefined}
                signalSent={signalSentId === profile.id}
              />
            );
          })}
          <DiscoverSafetyCard onClick={onOpenSafety} />
        </div>
      ) : null}

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

      {detailProfile ? (
        <ProfileDetailSheet
          profile={detailProfile}
          open={Boolean(detailProfile)}
          onClose={() => setDetailProfile(null)}
          verification={verificationFor(detailProfile).tier ? verificationFor(detailProfile) : undefined}
          onSendSignal={() => handleSendSignal(detailProfile)}
          onPass={() => handleIgnore(detailProfile)}
          onPrioritySignal={() => handlePrioritySignal(detailProfile)}
          onReport={() => setSafetyOpen(true)}
          onBlock={() => handleBlock(detailProfile)}
          onBlockAndReport={() => setSafetyOpen(true)}
          isPremium={isPremium}
          signalSent={signalSentId === detailProfile.id}
          viewer={memberUser}
        />
      ) : null}

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

      {detailProfile ? (
        <ReportBlockModal
          open={safetyOpen}
          userName={detailProfile.name}
          profileId={detailProfile.id}
          onClose={() => setSafetyOpen(false)}
          onBlock={() => handleBlock(detailProfile)}
          onBlockAndReport={(reason, details) => handleBlockAndReport(detailProfile, reason, details)}
        />
      ) : null}
    </div>
  );
}
