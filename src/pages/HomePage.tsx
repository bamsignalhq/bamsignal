import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Crown, Gift, ShieldCheck } from "lucide-react";
import { DashboardActivityFeed } from "../components/dashboard/DashboardActivityFeed";
import { FirstDayJourneyCard } from "../components/dashboard/FirstDayJourneyCard";
import { StreakBanner } from "../components/dashboard/StreakBanner";
import { DashboardDailyLimits } from "../components/dashboard/DashboardDailyLimits";
import { DashboardDiscoverCta } from "../components/dashboard/DashboardDiscoverCta";
import { DashboardMomentumBar } from "../components/dashboard/DashboardMomentumBar";
import { DashboardNearbySignals } from "../components/dashboard/DashboardNearbySignals";
import { DashboardNextSteps } from "../components/dashboard/DashboardNextSteps";
import { DashboardProfileStrengthCard } from "../components/dashboard/DashboardProfileStrengthCard";
import { ProfileViewsSheet } from "../components/dashboard/ProfileViewsSheet";
import { ReferralCard } from "../components/dashboard/ReferralCard";
import { greetingForHour } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import type { DiscoverProfile, LikeEntry, UserProfile } from "../types";
import { fetchDiscoverProfiles } from "../services/discoverProfiles";
import { buildDashboardFeed } from "../utils/dashboardFeed";
import { buildDiscoveryDeck } from "../utils/launchSeed";
import { getMatchPreferences, getDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { calculateProfileStrength } from "../utils/profileStrength";
import { getProfileViews, getProfileViewsToday, syncProfileViewsFromSignals } from "../utils/profileViews";
import { filterBlockedById } from "../utils/safety";
import { getSignalsSentCount, getStreak } from "../utils/streaks";
import { readJson } from "../utils/storage";
import { trackUpgradeImpression } from "../utils/premiumConversion";
import { syncFirstDayFromProfile } from "../utils/firstDayJourney";
import { isPremiumTrialActive, premiumTrialHoursRemaining } from "../utils/premiumTrial";

type HomePageProps = {
  user: UserProfile;
  userName: string;
  isPremium: boolean;
  onDiscover: () => void;
  onOpenPricing: () => void;
  onOpenPremium: () => void;
  onOpenProfile: () => void;
  onOpenLikes: () => void;
  onOpenVisitors: () => void;
  onOpenSafety: () => void;
};

function isNewMember(signalsSent: number, profileViews: number, signalsReceived: number): boolean {
  return signalsSent === 0 && profileViews === 0 && signalsReceived === 0;
}

export function HomePage({
  user,
  userName,
  isPremium,
  onDiscover,
  onOpenPricing,
  onOpenPremium,
  onOpenProfile,
  onOpenLikes,
  onOpenVisitors,
  onOpenSafety
}: HomePageProps) {
  const [profileViewsOpen, setProfileViewsOpen] = useState(false);
  const [viewsSnapshot, setViewsSnapshot] = useState(() => getProfileViews());
  const [allProfiles, setAllProfiles] = useState<DiscoverProfile[]>([]);

  const profile = getDatingProfile();
  const viewer = normalizeDatingProfile(profile);
  const strength = calculateProfileStrength(profile);
  const streak = getStreak();
  const signalsSent = getSignalsSentCount();
  const signalsReceived = readJson<number>(STORAGE_KEYS.signalsReceived, 0);
  const profileViews = viewsSnapshot;
  const viewsToday = useMemo(() => getProfileViewsToday(), [profileViews.viewers]);
  const firstName = userName.split(" ")[0] || "there";
  const prefs = getMatchPreferences();
  const city = profile.city || "Lagos";
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const passed = readJson<string[]>(STORAGE_KEYS.passed, []);

  useEffect(() => {
    void fetchDiscoverProfiles(user, city, [...blocked, ...passed]).then(setAllProfiles);
  }, [user.email, user.phone, city, blocked.length, passed.length]);

  const nearbyDeck = useMemo(
    () => buildDiscoveryDeck(filterBlockedById(allProfiles), viewer, prefs),
    [allProfiles, viewer, prefs]
  );

  const nearby: DiscoverProfile[] = nearbyDeck.slice(0, 5);
  const nearbyCount = nearbyDeck.length;

  const isNew = isNewMember(signalsSent, profileViews.count, signalsReceived);

  const activityFeed = useMemo(
    () =>
      buildDashboardFeed({
        city,
        profiles: allProfiles,
        blocked,
        passed,
        signalsReceived,
        viewsToday,
        profileStrength: strength,
        verified: profile.verified,
        compatibleNearby: nearbyCount
      }),
    [city, allProfiles, blocked, passed, signalsReceived, viewsToday, strength, profile.verified, nearbyCount]
  );

  const momentumExtras = useMemo(() => {
    if (signalsReceived <= 0) return undefined;
    return [
      {
        id: "likes",
        emoji: "❤️",
        text: `${signalsReceived} new like${signalsReceived === 1 ? "" : "s"} in Likes`,
        onClick: onOpenLikes
      }
    ];
  }, [signalsReceived, onOpenLikes]);

  const subline = useMemo(() => {
    const parts: string[] = [city];
    if (streak.count > 0) parts.push(`${streak.count}-day streak`);
    if (nearbyCount > 0) parts.push(`${nearbyCount} nearby`);
    if (viewsToday > 0) parts.push(`${viewsToday} views today`);
    if (isNew) return "Set up your signal — then open Discover.";
    return parts.join(" · ");
  }, [city, streak.count, nearbyCount, viewsToday, isNew]);

  useEffect(() => {
    syncFirstDayFromProfile(profile);
    const signals = readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, []);
    syncProfileViewsFromSignals(viewer, signals);
    setViewsSnapshot(getProfileViews());
  }, [viewer, profile]);

  const openVisitors = () => {
    if (!isPremium) trackUpgradeImpression("visitors");
    if (isPremium) onOpenVisitors();
    else setProfileViewsOpen(true);
  };

  const trialActive = isPremiumTrialActive();
  const trialHours = premiumTrialHoursRemaining();

  return (
    <div className="page home-dashboard">
      <header className="dash-greeting dash-animate">
        <div className="dash-greeting__row">
          <h1>
            {greetingForHour()}, {firstName}
          </h1>
          {isPremium && <span className="dash-greeting__pill">{trialActive ? `Trial · ${trialHours}h` : "Premium"}</span>}
        </div>
        <p>{subline}</p>
      </header>

      <FirstDayJourneyCard onCompleteProfile={onOpenProfile} onDiscover={onDiscover} />

      <StreakBanner />

      <DashboardMomentumBar
        viewsToday={viewsToday}
        totalViews={profileViews.count}
        nearbyCount={nearbyCount}
        onOpenProfileViews={openVisitors}
        onCompleteProfile={onOpenProfile}
        onDiscover={onDiscover}
        extraItems={momentumExtras}
      />

      <DashboardActivityFeed items={activityFeed} />

      {!isPremium && <DashboardDailyLimits />}

      <DashboardProfileStrengthCard
        profile={profile}
        strength={strength}
        onCompleteProfile={onOpenProfile}
      />

      <DashboardNearbySignals profiles={nearby} viewer={viewer} onDiscover={onDiscover} />

      <ReferralCard user={user} />

      {!profile.verified ? (
        <section className="dash-verify card dash-animate">
          <ShieldCheck className="dash-verify__icon" size={24} aria-hidden />
          <h2>Get verified</h2>
          <p>Phone and selfie verification help you stand out and stay safe.</p>
          <button type="button" className="btn-primary btn-full" onClick={onOpenProfile}>
            Start verification
          </button>
        </section>
      ) : (
        <div className="dash-verified card dash-animate">
          <BadgeCheck size={20} aria-hidden />
          Verified profile
        </div>
      )}

      <section className="dash-safety-link card dash-animate">
        <ShieldCheck size={20} aria-hidden />
        <div>
          <h2>Safety Center</h2>
          <p>Block, report, and privacy controls in one place.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={onOpenSafety}>
          Open
        </button>
      </section>

      {!isPremium && (
        <section className="dash-premium card dash-animate">
          <Crown className="dash-premium__icon" size={24} aria-hidden />
          <h2>Signal Pass</h2>
          <div className="dash-premium__copy">
            <ul>
              <li>Unlimited daily signals</li>
              <li>See profile visitors</li>
              <li>Priority in discovery</li>
              <li>Advanced filters</li>
            </ul>
          </div>
          <button type="button" className="btn-primary btn-full" onClick={onOpenPremium}>
            <Gift size={18} aria-hidden />
            Explore Signal Pass
          </button>
        </section>
      )}

      <DashboardDiscoverCta onDiscover={onDiscover} />

      <DashboardNextSteps
        profile={profile}
        strength={strength}
        isPremium={isPremium}
        onCompleteProfile={onOpenProfile}
        onOpenPricing={onOpenPremium}
      />

      <ProfileViewsSheet
        open={profileViewsOpen}
        onClose={() => setProfileViewsOpen(false)}
        count={profileViews.count}
        viewsToday={viewsToday}
        viewers={profileViews.viewers}
        isPremium={isPremium}
        onUpgrade={onOpenPremium}
        onOpenFullPage={onOpenVisitors}
      />
    </div>
  );
}
