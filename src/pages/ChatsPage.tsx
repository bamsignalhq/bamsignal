import { ArrowLeft, MoreVertical, Pin, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXPERIENCE_COPY } from "../constants/copy";
import { FREE_DAILY_MESSAGES, STORAGE_KEYS } from "../constants/limits";
import { getCachedMemberProfile, fetchMemberProfileById } from "../services/discoverProfiles";
import { ActivityStatus } from "../components/ActivityStatus";
import { ChatInput } from "../components/ChatInput";
import { DisableContactSharingModal } from "../components/DisableContactSharingModal";
import { EmptyChatState } from "../components/chats/EmptyChatState";
import { SmartConversationSection } from "../components/conversation/SmartConversationSection";
import { MatchSuccessIcebreakers } from "../components/icebreakers/MatchSuccessIcebreakers";
import { MessageRequestCard } from "../components/MessageRequestCard";
import { ContactExchangeConsentCard } from "../components/ContactExchangeConsentCard";
import { ContactExchangeEnabledModal } from "../components/ContactExchangeEnabledModal";
import { ContactExchangeLimitModal } from "../components/ContactExchangeLimitModal";
import { PaywallModal } from "../components/PaywallModal";
import { QuickiePaywallModal } from "../components/QuickiePaywallModal";
import { ReportBlockModal } from "../components/ReportBlockModal";
import { OfflineSafetyAckModal } from "../components/OfflineSafetyAckModal";
import type { ChatMessage, ChatThread, ContactExchangeShared, ContactExchangeState, DiscoverProfile, LikeEntry, Match, ReportReason, UserProfile } from "../types";
import type { PremiumPlan } from "../constants/plans";
import { FEMALE_SAFETY_COPY } from "../constants/safety";
import { chatListStatus, formatBubbleTime, formatThreadTime } from "../utils/chatListStatus";
import { readReceiptsAllowed } from "../utils/activityPrivacy";
import { isDemoTypingMatch, seedReviewerDemoChatsIfNeeded } from "../utils/reviewerDemoChats";
import { matchAnniversaryBanner } from "../utils/connectionAnniversary";
import { getDatingProfile } from "../utils/profile";
import { checkOutgoingChatMessage, CONTACT_LEAK_BLOCK_MESSAGE, VULGAR_CONTENT_BLOCK_MESSAGE } from "../utils/contactGuard";
import { blockAndReportUser, blockUser, canUseInbox, filterBlockedByProfileId, isUserBlocked, unmatchUser } from "../utils/safety";
import { hasOfflineSafetyAck } from "../utils/compliance";
import { trackEvent } from "../utils/analytics";
import { isViewerShadowBanned } from "../utils/shadowBan";
import { incrementDailyCount, readDailyCount, readJson, writeJson } from "../utils/storage";
import {
  completeContactExchangeRemote,
  contactExchangeAllowsSharing,
  disableContactSharingRemote,
  fetchContactExchangeState,
  mapServerExchange,
  requestContactExchangeRemote,
  respondContactExchangeRemote
} from "../services/contactExchange";
import { persistMessageRemote, acceptSignalRemote, declineSignalRemote, fetchIncomingSignalsRemote, ignoreSignalRemote, sendSignalRemote } from "../services/memberData";
import { BRAND } from "../constants/copy";
import { startQuickiePassPayment, completePendingPayment } from "../services/payments";
import { canMessageQuickieProfile, profileHasQuickieIntent, unlockQuickieMatch } from "../utils/quickie";
import { applyQuickieIntentAfterPayment } from "../utils/fastConnectionIntent";
import { consumePendingChatDraft, consumePendingChatOpen, setPendingChatDraft, setPendingChatOpen } from "../utils/chatDraft";
import { useMemberToast } from "../hooks/useMemberToast";
import { hapticMedium } from "../utils/memberHaptics";
import { debugRender } from "../utils/debugRecursion";

type ChatsPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onUpgrade: (plan: PremiumPlan) => void;
  paymentLoading?: boolean;
  onDiscover?: () => void;
  onBuildProfile?: () => void;
  phoneVerified?: boolean;
};

function lastPreview(messages: ChatMessage[], matchId: string): string {
  if (isDemoTypingMatch(matchId)) return "…";
  if (!messages.length) return EXPERIENCE_COPY.chatNewPreview;
  const last = messages[messages.length - 1];
  const prefix = last.from === "me" ? "You: " : "";
  return `${prefix}${last.text}`;
}

function unreadCount(messages: ChatMessage[], readAt?: string): number {
  const since = readAt ? new Date(readAt).getTime() : 0;
  return messages.filter((m) => m.from === "them" && new Date(m.at).getTime() > since).length;
}

function markThreadRead(matchId: string): void {
  const all = readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {});
  const thread = all[matchId] ?? { matchId, messages: [] };
  writeJson(STORAGE_KEYS.chats, {
    ...all,
    [matchId]: { ...thread, readAt: new Date().toISOString() }
  });
}

function toggleThreadPinned(matchId: string): boolean {
  const all = readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {});
  const thread = all[matchId] ?? { matchId, messages: [] };
  const pinned = !thread.pinned;
  writeJson(STORAGE_KEYS.chats, { ...all, [matchId]: { ...thread, pinned } });
  return pinned;
}

function entryToDiscoverProfile(entry: LikeEntry): DiscoverProfile {
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
    distanceKm: entry.distanceKm
  };
}

export function ChatsPage({
  isPremium,
  plans,
  onUpgrade,
  paymentLoading,
  onDiscover,
  onBuildProfile,
  phoneVerified = false
}: ChatsPageProps) {
  debugRender("ChatsPage", { isPremium, phoneVerified });
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [query, setQuery] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [listTick, setListTick] = useState(0);
  const [messageRequests, setMessageRequests] = useState<LikeEntry[]>([]);
  const [matchCelebration, setMatchCelebration] = useState<{
    match: Match;
    target: DiscoverProfile;
    draft: string;
  } | null>(null);
  const { showToast: showInboxToast, ToastHost: InboxToastHost } = useMemberToast();
  const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const viewer = getDatingProfile();

  useEffect(() => {
    void fetchIncomingSignalsRemote(user).then(setMessageRequests);
  }, [user.email, user.phone, listTick]);

  useEffect(() => {
    if (seedReviewerDemoChatsIfNeeded(user)) {
      setListTick((v) => v + 1);
    }
  }, [user.email, user.username]);

  const threads = useMemo(
    () => readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {}),
    [listTick, activeMatch]
  );
  const matches = useMemo(
    () => filterBlockedByProfileId(readJson<Match[]>(STORAGE_KEYS.matches, [])),
    [listTick, activeMatch]
  );

  useEffect(() => {
    const pendingMatchId = consumePendingChatOpen();
    if (!pendingMatchId) return;
    const pending = matches.find((row) => row.id === pendingMatchId);
    if (pending) setActiveMatch(pending);
  }, [matches]);

  const rows = useMemo(() => {
    return matches
      .map((match) => {
        const thread = threads[match.id];
        const messages = thread?.messages ?? [];
        const lastAt = messages[messages.length - 1]?.at ?? match.matchedAt;
        const lastActiveAt = match.lastActiveAt ?? getCachedMemberProfile(match.profileId)?.lastActiveAt;
        const unread = unreadCount(messages, thread?.readAt);
        return { match, thread, messages, lastAt, lastActiveAt, unread };
      })
      .sort((a, b) => {
        const pinA = a.thread?.pinned ? 1 : 0;
        const pinB = b.thread?.pinned ? 1 : 0;
        if (pinA !== pinB) return pinB - pinA;
        return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
      });
  }, [matches, threads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ match }) => match.name.toLowerCase().includes(q) || match.city.toLowerCase().includes(q));
  }, [query, rows]);

  if (activeMatch) {
    return (
      <ChatDetail
        match={activeMatch}
        isPremium={isPremium}
        onBack={() => {
          setActiveMatch(null);
          setListTick((v) => v + 1);
        }}
        plans={plans}
        onUpgrade={onUpgrade}
        paywallOpen={paywallOpen}
        setPaywallOpen={setPaywallOpen}
        paymentLoading={paymentLoading}
        safetyOpen={safetyOpen}
        setSafetyOpen={setSafetyOpen}
      />
    );
  }

  const openConversation = (match: Match) => {
    markThreadRead(match.id);
    setActiveMatch(match);
  };

  const showEmptyInbox = matches.length === 0;

  const handleEmptySendSignal = async (profile: DiscoverProfile) => {
    const result = await sendSignalRemote(user, profile.id, "signal");
    if (result.ok) {
      hapticMedium();
      showInboxToast(BRAND.signalSent, { tone: "success" });
      return true;
    }
    if (result.error) {
      showInboxToast(result.error, { tone: "error", duration: 3200 });
    }
    return false;
  };

  return (
    <div className="page member-page messages-page messages-page--premium member-content-pad">
      <header className="member-page-head member-page-head--minimal">
        <h1>{EXPERIENCE_COPY.chatsTitle}</h1>
      </header>

      {!showEmptyInbox ? (
      <label className="member-search member-search--chats">
        <Search size={18} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={EXPERIENCE_COPY.searchConversations}
        />
      </label>
      ) : null}

      <InboxToastHost />

      {messageRequests.length > 0 ? (
        <div className="message-requests-list">
          {messageRequests.map((entry) => (
            <MessageRequestCard
              key={entry.id || entry.profileId}
              entry={entry}
              onAccept={async () => {
                if (!entry.id) return;
                const match = await acceptSignalRemote(user, entry.id);
                if (match) {
                  setListTick((v) => v + 1);
                  setMessageRequests((current) => current.filter((row) => row.id !== entry.id));
                  setMatchCelebration({
                    match,
                    target: entryToDiscoverProfile(entry),
                    draft: ""
                  });
                }
              }}
              onIgnore={async () => {
                if (!entry.id) return;
                await ignoreSignalRemote(user, entry.id);
                setMessageRequests((current) => current.filter((row) => row.id !== entry.id));
              }}
              onDecline={async () => {
                if (!entry.id) return;
                await declineSignalRemote(user, entry.id);
                setMessageRequests((current) => current.filter((row) => row.id !== entry.id));
              }}
            />
          ))}
        </div>
      ) : null}

      {showEmptyInbox ? (
        <EmptyChatState
          viewer={viewer}
          user={user}
          isPremium={isPremium}
          phoneVerified={phoneVerified}
          onDiscover={onDiscover}
          onBuildProfile={onBuildProfile}
          onSendSignal={handleEmptySendSignal}
        />
      ) : null}

      {!showEmptyInbox && filtered.length === 0 && query.trim() ? (
        <p className="messages-empty messages-empty--compact">No conversations match your search.</p>
      ) : null}

      {filtered.length > 0 ? (
        <ul className="messages-list messages-list--premium">
          {filtered.map(({ match, thread, messages, lastAt, lastActiveAt, unread }) => {
            const pinned = Boolean(thread?.pinned);
            const lastMessage = messages[messages.length - 1];
            const discoverProfile = getCachedMemberProfile(match.profileId);
            const receiptsOn = readReceiptsAllowed(viewer, discoverProfile ?? {});
            const status = chatListStatus({
              matchId: match.id,
              lastActiveAt,
              lastMessage,
              peerSeenAt: thread?.peerSeenAt,
              receiptsOn
            });
            const preview = lastPreview(messages, match.id);
            return (
              <li key={match.id}>
                <button
                  type="button"
                  className={`messages-row messages-row--premium${unread > 0 ? " messages-row--unread" : ""}${pinned ? " messages-row--pinned" : ""}`}
                  onClick={() => openConversation(match)}
                >
                  <span className="messages-row__avatar">
                    <img src={match.photo} alt="" loading="lazy" decoding="async" />
                    {status?.showOnlineDot ? <span className="messages-row__online" aria-hidden /> : null}
                  </span>
                  <span className="messages-row__body">
                    <span className="messages-row__top">
                      <strong>
                        {pinned ? <Pin size={12} className="messages-row__pin" aria-hidden /> : null}
                        {match.name}
                      </strong>
                      <time dateTime={lastAt}>{formatThreadTime(lastAt)}</time>
                    </span>
                    {status ? (
                      <span className={`messages-row__status messages-row__status--${status.kind}`}>
                        {status.text}
                      </span>
                    ) : null}
                    <span className="messages-row__preview-row">
                      <span className="messages-row__preview">{preview}</span>
                      {unread > 0 ? (
                        <span className="messages-row__badge" aria-label={`${unread} unread`}>
                          {unread > 9 ? "9+" : unread}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

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

      {matchCelebration ? (
        <MatchSuccessIcebreakers
          open
          matchName={matchCelebration.match.name}
          viewer={viewer}
          target={matchCelebration.target}
          onSelect={(text) => setMatchCelebration((prev) => (prev ? { ...prev, draft: text } : null))}
          onClose={() => setMatchCelebration(null)}
          onStartChat={() => {
            if (matchCelebration.draft.trim()) {
              setPendingChatDraft(matchCelebration.match.id, matchCelebration.draft);
            }
            setActiveMatch(matchCelebration.match);
            setMatchCelebration(null);
          }}
        />
      ) : null}
    </div>
  );
}
function ChatDetail({
  match,
  isPremium,
  plans,
  onBack,
  onUpgrade,
  paywallOpen,
  setPaywallOpen,
  paymentLoading,
  safetyOpen,
  setSafetyOpen
}: {
  match: Match;
  isPremium: boolean;
  plans: PremiumPlan[];
  onBack: () => void;
  onUpgrade: (plan: PremiumPlan) => void;
  paywallOpen: boolean;
  setPaywallOpen: (v: boolean) => void;
  paymentLoading?: boolean;
  safetyOpen: boolean;
  setSafetyOpen: (v: boolean) => void;
}) {
  const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const viewerShadowBanned = isViewerShadowBanned(user.phone, user.email);
  const allThreads = readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {});
  const initialThread = allThreads[match.id] || { matchId: match.id, messages: [] };
  const [threadMeta, setThreadMeta] = useState<Omit<ChatThread, "messages">>({
    matchId: match.id,
    contactExchange: initialThread.contactExchange,
    offPlatformApproved: initialThread.offPlatformApproved,
    pendingOffPlatformRequest: initialThread.pendingOffPlatformRequest,
    offPlatformDeclined: initialThread.offPlatformDeclined,
    pinned: initialThread.pinned,
    readAt: initialThread.readAt
  });
  const [messages, setMessages] = useState<ChatMessage[]>(initialThread.messages);
  const [exchangeRole, setExchangeRole] = useState<"requester" | "recipient" | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [enabledModalOpen, setEnabledModalOpen] = useState(false);
  const [blockWarning, setBlockWarning] = useState("");
  const blockWarningTimerRef = useRef<number | undefined>(undefined);
  const showBlockWarning = (msg: string) => {
    if (blockWarningTimerRef.current !== undefined) clearTimeout(blockWarningTimerRef.current);
    setBlockWarning(msg);
    blockWarningTimerRef.current = window.setTimeout(() => {
      setBlockWarning("");
      blockWarningTimerRef.current = undefined;
    }, 4000);
  };
  const { showToast, ToastHost } = useMemberToast();
  const [composerDraft, setComposerDraft] = useState(() => consumePendingChatDraft(match.id) ?? "");
  const [screenshotNotice, setScreenshotNotice] = useState(false);
  const [quickiePaywallOpen, setQuickiePaywallOpen] = useState(false);
  const [quickieLoading, setQuickieLoading] = useState(false);
  const viewer = getDatingProfile();
  const inboxGate = canUseInbox(viewer);
  const dmPaused = !inboxGate.allowed;
  const lastActiveAt = match.lastActiveAt ?? getCachedMemberProfile(match.profileId)?.lastActiveAt;
  const discoverProfile = getCachedMemberProfile(match.profileId);
  const matchHasQuickie = profileHasQuickieIntent(discoverProfile?.intents);
  const receiptsOn = readReceiptsAllowed(viewer, discoverProfile ?? {});
  const anniversary = matchAnniversaryBanner(match);
  const lastMine = [...messages].reverse().find((m) => m.from === "me");
  const showSeen = receiptsOn && lastMine && threadMeta.peerSeenAt;
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [offlineSafetyOpen, setOfflineSafetyOpen] = useState(false);
  const pendingExchangeActionRef = useRef<(() => void) | null>(null);
  const exchangeStatus = threadMeta.contactExchange?.status;
  const sharingDisabled = threadMeta.contactExchange?.contactSharingEnabled === false;
  const exchangeApproved =
    contactExchangeAllowsSharing(threadMeta.contactExchange) || Boolean(threadMeta.offPlatformApproved);
  const showExchangeButton =
    !exchangeApproved &&
    (!exchangeStatus ||
      exchangeStatus === "declined" ||
      exchangeStatus === "cancelled" ||
      exchangeStatus === "expired" ||
      sharingDisabled);
  const canDisableSharing = exchangeApproved && !sharingDisabled;
  const showRecipientConsent = exchangeStatus === "pending" && exchangeRole === "recipient";
  const showRequesterWaiting = exchangeStatus === "pending" && exchangeRole === "requester";
  const requesterFirstName = match.name.trim().split(/\s+/)[0] || match.name;
  const requesterProfileId = localStorage.getItem(STORAGE_KEYS.memberProfileId) || undefined;
  const showConversationSuggestions = messages.length < 10;
  const conversationContext = messages.length === 0 ? "chat-empty" : "chat";
  const chatTargetProfile: DiscoverProfile =
    discoverProfile ?? {
      id: match.profileId,
      name: match.name,
      age: 26,
      city: match.city,
      bio: "",
      photo: match.photo,
      intents: ["MeaningfulConversations"],
      verified: false
    };

  const runAfterOfflineSafety = useCallback((action: () => void) => {
    if (hasOfflineSafetyAck(getDatingProfile().compliance)) {
      action();
      return;
    }
    pendingExchangeActionRef.current = action;
    setOfflineSafetyOpen(true);
  }, []);

  useEffect(() => {
    void fetchMemberProfileById(user, match.profileId);
    markThreadRead(match.id);
    const seen = localStorage.getItem(STORAGE_KEYS.screenshotPrivacyNoticeSeen) === "true";
    if (!seen) {
      setScreenshotNotice(true);
      localStorage.setItem(STORAGE_KEYS.screenshotPrivacyNoticeSeen, "true");
    }
    void fetchContactExchangeState(user, match.id).then((result) => {
      if (!result?.ok) return;
      if (result.role) setExchangeRole(result.role);
      const mapped = mapServerExchange(result.exchange as Record<string, unknown> | null);
      if (mapped) {
        setThreadMeta((prev) => {
          const meta = { ...prev, contactExchange: mapped, matchId: match.id };
          writeJson(STORAGE_KEYS.chats, {
            ...readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {}),
            [match.id]: { ...meta, messages }
          });
          return meta;
        });
        if (mapped.status === "accepted") {
          runAfterOfflineSafety(() => setEnabledModalOpen(true));
        }
      }
    });
  }, [match.profileId, user.email, user.phone, match.id, messages, runAfterOfflineSafety]);

  const persistThread = (nextMessages: ChatMessage[], meta = threadMeta) => {
    const nextMeta = { ...meta, matchId: match.id };
    setMessages(nextMessages);
    setThreadMeta(nextMeta);
    writeJson(STORAGE_KEYS.chats, {
      ...readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {}),
      [match.id]: { ...nextMeta, messages: nextMessages }
    });
    const lastMessage = nextMessages[nextMessages.length - 1];
    if (lastMessage?.from === "me") {
      persistMessageRemote(user, match.id, lastMessage, nextMeta);
    }
  };

  const updateMeta = (patch: Partial<Omit<ChatThread, "messages">>) => {
    const meta = { ...threadMeta, ...patch, matchId: match.id };
    setThreadMeta(meta);
    writeJson(STORAGE_KEYS.chats, {
      ...readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {}),
      [match.id]: { ...meta, messages }
    });
  };

  const handleSend = (text: string) => {
    setBlockWarning("");

    if (isUserBlocked(match.profileId)) {
      showBlockWarning("You've blocked this person.");
      return;
    }

    const contactApproved =
      contactExchangeAllowsSharing(threadMeta.contactExchange) ||
      Boolean(threadMeta.offPlatformApproved);
    const contactCheck = checkOutgoingChatMessage(text, {
      connectionAccepted: contactApproved
    });

    if (contactCheck.blocked) {
      showBlockWarning(
        contactCheck.kind === "profanity" ? VULGAR_CONTENT_BLOCK_MESSAGE : CONTACT_LEAK_BLOCK_MESSAGE
      );
      return;
    }

    if (!canMessageQuickieProfile(match.profileId, matchHasQuickie)) {
      setQuickiePaywallOpen(true);
      trackEvent("quickie_paywall_shown", { context: "message" });
      return;
    }

    if (!isPremium) {
      if (readDailyCount(STORAGE_KEYS.dailyMessages) >= FREE_DAILY_MESSAGES) {
        setPaywallOpen(true);
        return;
      }
      incrementDailyCount(STORAGE_KEYS.dailyMessages);
    }

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      from: "me",
      text,
      at: new Date().toISOString()
    };
    const isFirstMessage = messages.length === 0;
    const nextMessages = [...messages, msg];
    persistThread(nextMessages);
    if (isFirstMessage) trackEvent("message_started", { matchId: match.id });
  };

  const requestContactExchange = async () => {
    if (!user.phoneVerified) {
      showToast("Verify your phone number before exchanging contacts.", { tone: "error", duration: 3500 });
      return;
    }
    runAfterOfflineSafety(() => void executeContactExchangeRequest());
  };

  const executeContactExchangeRequest = async () => {
    const result = await requestContactExchangeRemote(
      user,
      match.id,
      match.profileId,
      requesterProfileId
    );
    if (!result) return;
    if (!result.ok) {
      if (result.limitReached) {
        setLimitModalOpen(true);
        trackEvent("paywall_seen", { context: "contact_exchange" });
      } else if (result.error) {
        showToast(result.error, { tone: "error", duration: 4000 });
      }
      return;
    }
    trackEvent("exchange_requested", { matchId: match.id });
    const mapped = mapServerExchange(result.exchange as Record<string, unknown>);
    if (mapped) updateMeta({ contactExchange: mapped });
    setExchangeRole("requester");
    showToast("We'll ask if they're comfortable continuing outside BamSignal.", { duration: 3500 });
  };

  const acceptContactExchange = async () => {
    runAfterOfflineSafety(() => void executeAcceptContactExchange());
  };

  const executeAcceptContactExchange = async () => {
    const result = await respondContactExchangeRemote(user, match.id, true, requesterProfileId);
    if (!result) return;
    if (!result.ok) {
      if (result.limitReached) {
        setLimitModalOpen(true);
      } else if (result.error) {
        showToast(result.error, { tone: "error", duration: 4000 });
      }
      return;
    }
    trackEvent("exchange_accepted", { matchId: match.id });
    const mapped = mapServerExchange(result.exchange as Record<string, unknown>);
    if (mapped) updateMeta({ contactExchange: mapped });
    runAfterOfflineSafety(() => setEnabledModalOpen(true));
  };

  const declineContactExchange = async () => {
    const result = await respondContactExchangeRemote(user, match.id, false, requesterProfileId);
    if (result?.ok) {
      trackEvent("exchange_declined", { matchId: match.id });
      const mapped = mapServerExchange(result.exchange as Record<string, unknown>);
      if (mapped) updateMeta({ contactExchange: mapped });
    }
    showToast("Kept inside BamSignal for now.", { duration: 3500 });
  };

  const finishContactExchange = async (shared: ContactExchangeShared) => {
    const result = await completeContactExchangeRemote(user, match.id, shared || {}, requesterProfileId);
    if (!result) return;
    if (!result.ok) {
      if (result.error) {
        showToast(result.error, { tone: "error", duration: 4000 });
      }
      return;
    }
    trackEvent("exchange_completed", { matchId: match.id });
    const mapped = mapServerExchange(result.exchange as Record<string, unknown>);
    if (mapped) updateMeta({ contactExchange: mapped, offPlatformApproved: true });
    showToast("Contact exchange saved. Share only what you're comfortable with.", { tone: "success", duration: 3500 });
  };

  const disableSharing = async () => {
    const result = await disableContactSharingRemote(user, match.id, requesterProfileId);
    setDisableModalOpen(false);
    if (!result?.ok) {
      if (result?.error) {
        showToast(result.error, { tone: "error", duration: 4000 });
      }
      return;
    }
    trackEvent("contact_sharing_disabled", { matchId: match.id });
    const mapped = mapServerExchange(result.exchange as Record<string, unknown>);
    if (mapped) updateMeta({ contactExchange: mapped });
    showToast("Contact sharing disabled for this conversation.", { tone: "success", duration: 3500 });
  };

  const handleBlock = () => {
    blockUser(match.profileId);
    onBack();
  };

  const handleBlockAndReport = (reason: ReportReason, details?: string) => {
    blockAndReportUser(match.profileId, reason, details);
    onBack();
  };

  const handleUnmatch = () => {
    unmatchUser(match.id, match.profileId);
    onBack();
  };

  const handleTogglePin = () => {
    const pinned = toggleThreadPinned(match.id);
    updateMeta({ pinned });
  };

  return (
    <div className="page chat-detail-page">
      <header className="chat-detail-header chat-detail-header--fintech">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <img src={match.photo} alt="" className="chat-avatar" />
        <div className="chat-detail-header__meta">
          <strong>{match.name}</strong>
          <ActivityStatus
            lastActiveAt={lastActiveAt}
            profile={discoverProfile ?? undefined}
            isConnection
            variant="subtle"
          />
          {showExchangeButton && (
            <button type="button" className="chat-off-app-link" onClick={() => void requestContactExchange()}>
              Exchange Contacts 🔒
            </button>
          )}
        </div>
        <button type="button" className="icon-btn" onClick={handleTogglePin} aria-label={threadMeta.pinned ? "Unpin conversation" : "Pin conversation"}>
          <Pin size={20} className={threadMeta.pinned ? "chat-detail-header__pin--active" : ""} />
        </button>
        <button type="button" className="icon-btn" onClick={() => setSafetyOpen(true)} aria-label="Safety options">
          <MoreVertical size={22} />
        </button>
      </header>

      <ToastHost />

      {showRecipientConsent && (
        <ContactExchangeConsentCard
          requesterFirstName={requesterFirstName}
          onAccept={() => void acceptContactExchange()}
          onDecline={() => void declineContactExchange()}
        />
      )}

      {showRequesterWaiting && (
        <p className="chat-exchange-waiting">Waiting for {match.name} to accept your contact exchange request.</p>
      )}

      {exchangeStatus === "expired" ? (
        <p className="chat-exchange-waiting">Contact request expired. You can request again when you are ready.</p>
      ) : null}

      {exchangeApproved ? (
        <p className="chat-exchange-enabled">❤️ Contact exchange enabled — share only what you're comfortable with.</p>
      ) : null}

      {screenshotNotice ? (
        <p className="chat-privacy-notice">{FEMALE_SAFETY_COPY.screenshotNotice}</p>
      ) : null}

      {anniversary ? <p className="chat-anniversary-banner">{anniversary}</p> : null}

      <div className="chat-messages chat-messages--fintech">
        {messages.length === 0 ? (
          <div className="chat-match-banner">
            <p className="chat-match-banner__title">{EXPERIENCE_COPY.chatMatchBanner}</p>
            <p className="chat-match-banner__hint">{EXPERIENCE_COPY.chatMatchHint}</p>
          </div>
        ) : null}
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble chat-bubble--premium ${m.from}`}>
            <span className="chat-bubble__text">{m.text}</span>
            <time className="chat-bubble__time" dateTime={m.at}>
              {formatBubbleTime(m.at)}
            </time>
          </div>
        ))}
        {showSeen ? <p className="chat-read-receipt">Seen</p> : null}
      </div>

      {showConversationSuggestions ? (
        <SmartConversationSection
          viewer={viewer}
          target={chatTargetProfile}
          context={conversationContext}
          messageCount={messages.length}
          onSelect={setComposerDraft}
          className="smart-conversation--chat"
          showLede={false}
        />
      ) : null}

      {dmPaused ? (
        <p className="chat-dm-paused">{inboxGate.reason ?? FEMALE_SAFETY_COPY.dmPaused}</p>
      ) : (
        <ChatInput
          value={composerDraft}
          onValueChange={setComposerDraft}
          onSend={handleSend}
          placeholder={`Message ${match.name}…`}
          blockWarning={blockWarning}
          onClearWarning={() => {
            if (blockWarningTimerRef.current !== undefined) clearTimeout(blockWarningTimerRef.current);
            setBlockWarning("");
          }}
        />
      )}

      <ContactExchangeEnabledModal
        open={enabledModalOpen}
        onClose={() => setEnabledModalOpen(false)}
        onSave={(shared) => void finishContactExchange(shared)}
      />

      <ContactExchangeLimitModal
        open={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        plans={plans}
        onUpgrade={(plan) => {
          onUpgrade(plan);
          setLimitModalOpen(false);
        }}
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

      <QuickiePaywallModal
        open={quickiePaywallOpen}
        onClose={() => setQuickiePaywallOpen(false)}
        loading={quickieLoading}
        context="message"
        onPay={async () => {
          setQuickieLoading(true);
          const result = await startQuickiePassPayment(user);
          if (!result.ok) {
            setQuickieLoading(false);
            if (!result.cancelled && result.error) {
              showToast(result.error, { tone: "error", duration: 4000 });
            }
            return;
          }
          if (result.needsVerify) {
            const verified = await completePendingPayment(user);
            if (verified.ok) {
              applyQuickieIntentAfterPayment(user, verified.quickiePassUntil, { addIntent: false });
              unlockQuickieMatch(match.profileId);
              setQuickiePaywallOpen(false);
            } else if (!verified.pending && verified.error) {
              showToast(verified.error, { tone: "error", duration: 4000 });
            }
          }
          setQuickieLoading(false);
        }}
      />

      <DisableContactSharingModal
        open={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        onConfirm={() => void disableSharing()}
      />

      <ReportBlockModal
        open={safetyOpen}
        userName={match.name}
        profileId={match.profileId}
        showDisableContactSharing={canDisableSharing}
        onDisableContactSharing={() => {
          setSafetyOpen(false);
          setDisableModalOpen(true);
        }}
        onClose={() => setSafetyOpen(false)}
        onBlock={handleBlock}
        onBlockAndReport={handleBlockAndReport}
        onUnmatch={handleUnmatch}
      />

      <OfflineSafetyAckModal
        open={offlineSafetyOpen}
        user={user}
        onClose={() => {
          setOfflineSafetyOpen(false);
          pendingExchangeActionRef.current = null;
        }}
        onComplete={() => {
          setOfflineSafetyOpen(false);
          const action = pendingExchangeActionRef.current;
          pendingExchangeActionRef.current = null;
          action?.();
        }}
      />
    </div>
  );
}
