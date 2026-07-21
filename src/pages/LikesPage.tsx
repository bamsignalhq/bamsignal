import { useEffect, useMemo, useState } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { useMemberToast } from "../hooks/useMemberToast";
import { MemberEmptyState, MemberSafetyRow } from "../components/member";
import { BRAND, MONETIZATION_COPY, PREMIUM_COPY } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import { MatchSuccessIcebreakers } from "../components/icebreakers/MatchSuccessIcebreakers";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { ReportBlockModal } from "../components/ReportBlockModal";
import { IncomingSignalCard } from "../components/signals/IncomingSignalCard";
import { SignalsMayLikeSection } from "../components/signals/SignalsMayLikeSection";
import { SignalsPageHeader } from "../components/signals/SignalsPageHeader";
import { SignalsSegmentTabs, type SignalsSegment } from "../components/signals/SignalsSegmentTabs";
import { SignalsSettingsSheet } from "../components/signals/SignalsSettingsSheet";
import { SignalsStoriesRow } from "../components/signals/SignalsStoriesRow";
import { fetchDiscoverProfiles, fetchMemberProfileById, getCachedMemberProfile } from "../services/discoverProfiles";
import { acceptSignalRemote, declineSignalRemote, fetchIncomingSignalsRemote, sendSignalRemote } from "../services/memberData";
import type { DiscoverProfile, LikeEntry, Match, UserProfile } from "../types";
import { blockAndReportUser, blockUser, filterBlockedByProfileId } from "../utils/safety";
import { trackEvent } from "../utils/analytics";
import { notifySignalAccepted } from "../utils/notifyHelpers";
import { readJson, writeJson } from "../utils/storage";
import { getVerificationTier } from "../utils/verification";
import { getMemberCity } from "../utils/memberCity";
import { isReviewerDemoChatUser } from "../utils/reviewerDemoChats";
import {
  getReviewerDemoMayLikeProfiles,
  isDemoSignalEntry,
  mergeReviewerDemoSignals
} from "../utils/reviewerDemoSignals";
import { hapticMedium } from "../utils/memberHaptics";
import { getDatingProfile } from "../utils/profile";
import { setPendingChatDraft, setPendingChatOpen } from "../utils/chatDraft";
import { useAndroidBack } from "../hooks/useAndroidBack";
import { debugRender } from "../utils/debugRecursion";

type LikesPageProps = {
  isPremium: boolean;
  onUpgrade: () => void;
  paymentLoading?: boolean;
  onCompleteProfile?: () => void;
  onDiscover?: () => void;
  onOpenSafety?: () => void;
  onOpenChats?: () => void;
};

const FALLBACK_MESSAGES = [
  "I really like your vibe. You seem so genuine and kind.",
  "You caught my attention. Let's see where this goes.",
  "You seem like someone I'd love to get to know better."
];

function formatSignalTime(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return "Today";
}

function enrichSignal(entry: LikeEntry, index: number): LikeEntry {
  const profile = getCachedMemberProfile(entry.profileId);
  return {
    ...entry,
    age: entry.age ?? profile?.age,
    distanceKm: entry.distanceKm ?? profile?.distanceKm,
    state: entry.state ?? profile?.state,
    verified: entry.verified ?? profile?.verified,
    message:
      entry.message ??
      profile?.bio?.trim().slice(0, 120) ??
      FALLBACK_MESSAGES[index % FALLBACK_MESSAGES.length]
  };
}

function likeEntryToProfile(entry: LikeEntry): DiscoverProfile {
  const cached = getCachedMemberProfile(entry.profileId);
  if (cached) return cached;
  return {
    id: entry.profileId,
    name: entry.name,
    age: entry.age ?? 26,
    city: entry.city,
    state: entry.state,
    bio: entry.message ?? "",
    photo: entry.photo,
    intents: ["MeaningfulConversations"],
    verified: Boolean(entry.verified),
    premium: false,
    distanceKm: entry.distanceKm,
    createdAt: entry.at
  };
}

function applySegment(signals: LikeEntry[], segment: SignalsSegment): LikeEntry[] {
  const now = Date.now();
  switch (segment) {
    case "new":
      return signals.filter((s) => now - new Date(s.at).getTime() < 7 * 86_400_000);
    case "nearby":
      return [...signals].sort(
        (a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
      );
    case "recent":
      return [...signals].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    default:
      return signals;
  }
}

export function LikesPage({
  isPremium,
  onUpgrade,
  paymentLoading,
  onCompleteProfile: _onCompleteProfile,
  onDiscover,
  onOpenSafety,
  onOpenChats
}: LikesPageProps) {
  debugRender("LikesPage", { isPremium });
  const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const { profile: viewer } = useMemberProfileListener();
  const [signals, setSignals] = useState<LikeEntry[]>(() =>
    mergeReviewerDemoSignals(
      user,
      filterBlockedByProfileId(readJson(STORAGE_KEYS.likedBy, []))
    )
  );
  const [segment, setSegment] = useState<SignalsSegment>("all");
  const [storyFilter, setStoryFilter] = useState<string | "all">("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailProfile, setDetailProfile] = useState<DiscoverProfile | null>(null);
  const [safetyTarget, setSafetyTarget] = useState<LikeEntry | null>(null);
  const [signalingId, setSignalingId] = useState<string | null>(null);
  const [mayLikeProfiles, setMayLikeProfiles] = useState<DiscoverProfile[]>(() =>
    isReviewerDemoChatUser(user) ? getReviewerDemoMayLikeProfiles() : []
  );
  const { showToast, ToastHost } = useMemberToast();
  const [matchCelebration, setMatchCelebration] = useState<{
    match: Match;
    target: DiscoverProfile;
    draft: string;
  } | null>(null);
  const datingProfile = getDatingProfile();

  useEffect(() => {
    void fetchIncomingSignalsRemote(user).then((incoming) => {
      setSignals(mergeReviewerDemoSignals(user, filterBlockedByProfileId(incoming)));
    });
  }, [user.email, user.phone]);

  useEffect(() => {
    if (isReviewerDemoChatUser(user)) {
      setMayLikeProfiles(getReviewerDemoMayLikeProfiles());
      return;
    }
    const city = viewer.city || getMemberCity() || "Lagos";
    void fetchDiscoverProfiles(user, city, []).then((profiles) => {
      setMayLikeProfiles(profiles.slice(0, 4));
    });
  }, [user.email, user.phone, viewer.city]);

  const enriched = useMemo(
    () => signals.map((entry, index) => enrichSignal(entry, index)),
    [signals]
  );

  const segmentCounts = useMemo(() => {
    const now = Date.now();
    return {
      all: enriched.length,
      new: enriched.filter((s) => now - new Date(s.at).getTime() < 7 * 86_400_000).length,
      nearby: enriched.filter((s) => s.distanceKm != null && s.distanceKm <= 40).length,
      recent: enriched.length
    };
  }, [enriched]);

  const filtered = useMemo(() => {
    let list = applySegment(enriched, segment);
    if (storyFilter !== "all") {
      list = list.filter((entry) => entry.profileId === storyFilter);
    }
    return list;
  }, [enriched, segment, storyFilter]);

  useAndroidBack(() => {
    if (settingsOpen) {
      setSettingsOpen(false);
      return true;
    }
    if (detailProfile) {
      setDetailProfile(null);
      return true;
    }
    if (safetyTarget) {
      setSafetyTarget(null);
      return true;
    }
    return false;
  });

  const removeSignal = (entry: LikeEntry) => {
    const next = signals.filter((s) => s.id !== entry.id && s.profileId !== entry.profileId);
    setSignals(next);
    if (!isDemoSignalEntry(entry)) {
      writeJson(STORAGE_KEYS.likedBy, next);
    }
  };

  const acceptSignal = async (entry: LikeEntry) => {
    if (!isPremium && !isDemoSignalEntry(entry)) {
      onUpgrade();
      return;
    }

    if (isDemoSignalEntry(entry)) {
      removeSignal(entry);
      hapticMedium();
      showToast(`${BRAND.matchCreated} ${BRAND.matchCreatedSub}`, { tone: "success" });
      return;
    }

    if (!entry.id) {
      showToast("Could not accept this signal.", { tone: "error" });
      return;
    }
    const match = await acceptSignalRemote(user, entry.id);
    if (!match) {
      showToast("Could not accept signal. Try again.", { tone: "error" });
      return;
    }
    removeSignal(entry);
    hapticMedium();
    trackEvent("signal_accepted", { profileId: entry.profileId });
    notifySignalAccepted(entry.name);
    setMatchCelebration({
      match,
      target: likeEntryToProfile(entry),
      draft: ""
    });
  };

  const handleBlock = (entry: LikeEntry) => {
    blockUser(entry.profileId);
    if (!isDemoSignalEntry(entry) && entry.id) void declineSignalRemote(user, entry.id);
    removeSignal(entry);
    hapticMedium();
    showToast(`${entry.name} blocked.`, { tone: "success" });
  };

  const handleBlockAndReport = (entry: LikeEntry, reason: import("../types").ReportReason, details?: string) => {
    blockAndReportUser(entry.profileId, reason, details);
    if (!isDemoSignalEntry(entry) && entry.id) void declineSignalRemote(user, entry.id);
    removeSignal(entry);
    showToast(`${entry.name} blocked and reported.`, { tone: "success" });
  };

  const openProfile = async (entry: LikeEntry) => {
    if (!isPremium && !isDemoSignalEntry(entry)) {
      onUpgrade();
      return;
    }
    void fetchMemberProfileById(user, entry.profileId);
    setDetailProfile(likeEntryToProfile(entry));
  };

  const handleMayLikeSignal = async (profile: DiscoverProfile) => {
    if (profile.id.startsWith("demo-signal-")) {
      hapticMedium();
      showToast(BRAND.signalSent, { tone: "success" });
      return;
    }
    setSignalingId(profile.id);
    const result = await sendSignalRemote(user, profile.id, "signal");
    setSignalingId(null);
    if (result.ok) {
      hapticMedium();
      showToast(BRAND.signalSent, { tone: "success" });
    } else if (result.error) showToast(result.error, { tone: "error" });
  };

  const detailVerification = detailProfile
    ? getVerificationTier(
        { ...viewer, verified: detailProfile.verified },
        Boolean(detailProfile.premium),
        true
      )
    : undefined;

  const hasSignals = enriched.length > 0;

  return (
    <div className="page member-page signals-premium-page member-content-pad">
      <SignalsPageHeader onSettings={() => setSettingsOpen(true)} />

      {hasSignals ? (
        <>
          <SignalsStoriesRow
            signals={enriched}
            activeId={storyFilter}
            onSelect={setStoryFilter}
          />
          <SignalsSegmentTabs active={segment} counts={segmentCounts} onChange={setSegment} />
        </>
      ) : null}

      <ToastHost />

      {!hasSignals ? (
        <MemberEmptyState
          className="signals-premium-empty"
          title={PREMIUM_COPY.signalsEmptyTitle}
          actionLabel={PREMIUM_COPY.explorePeople}
          onAction={onDiscover ?? onUpgrade}
        >
          {!isPremium ? (
            <button
              type="button"
              className="signals-premium-empty__pass-link"
              onClick={onUpgrade}
              disabled={paymentLoading}
            >
              {paymentLoading ? MONETIZATION_COPY.checkoutLoading : MONETIZATION_COPY.getSignalPass}
            </button>
          ) : null}
        </MemberEmptyState>
      ) : (
        <div className="signals-premium-list">
          {filtered.map((entry) => (
            <IncomingSignalCard
              key={entry.id || entry.profileId}
              entry={entry}
              timeLabel={formatSignalTime(entry.at)}
              locked={!isPremium && !isDemoSignalEntry(entry)}
              onAccept={() => void acceptSignal(entry)}
              onViewProfile={() => void openProfile(entry)}
            />
          ))}
        </div>
      )}

      {hasSignals ? (
        <SignalsMayLikeSection
          profiles={mayLikeProfiles}
          onViewAll={onDiscover}
          onOpenProfile={(profile) => setDetailProfile(profile)}
          onSignal={(profile) => void handleMayLikeSignal(profile)}
          signalingId={signalingId}
        />
      ) : null}

      <MemberSafetyRow variant="signals" onClick={onOpenSafety} />

      <SignalsSettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {detailProfile ? (
        <ProfileDetailSheet
          profile={detailProfile}
          open={Boolean(detailProfile)}
          onClose={() => setDetailProfile(null)}
          verification={detailVerification?.tier ? detailVerification : undefined}
          viewer={user}
          isPremium={isPremium}
          onSendSignal={() => void handleMayLikeSignal(detailProfile)}
          onReport={() => {
            const entry = signals.find((s) => s.profileId === detailProfile.id);
            if (entry) setSafetyTarget(entry);
          }}
        />
      ) : null}

      {safetyTarget ? (
        <ReportBlockModal
          open={Boolean(safetyTarget)}
          userName={safetyTarget.name}
          profileId={safetyTarget.profileId}
          onClose={() => setSafetyTarget(null)}
          onBlock={() => handleBlock(safetyTarget)}
          onBlockAndReport={(reason, details) => handleBlockAndReport(safetyTarget, reason, details)}
        />
      ) : null}

      {matchCelebration ? (
        <MatchSuccessIcebreakers
          open
          matchName={matchCelebration.match.name}
          viewer={datingProfile}
          target={matchCelebration.target}
          onSelect={(text) => setMatchCelebration((prev) => (prev ? { ...prev, draft: text } : null))}
          onClose={() => setMatchCelebration(null)}
          onStartChat={() => {
            if (matchCelebration.draft.trim()) {
              setPendingChatDraft(matchCelebration.match.id, matchCelebration.draft);
            }
            setPendingChatOpen(matchCelebration.match.id);
            setMatchCelebration(null);
            onOpenChats?.();
          }}
        />
      ) : null}
    </div>
  );
}
