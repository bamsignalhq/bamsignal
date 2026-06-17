import { ArrowLeft, MessageCircle, MoreVertical, Pin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EXPERIENCE_COPY } from "../constants/copy";
import { FREE_DAILY_MESSAGES, STORAGE_KEYS } from "../constants/limits";
import { getCachedMemberProfile, fetchMemberProfileById } from "../services/discoverProfiles";
import { ActivityStatus } from "../components/ActivityStatus";
import { ChatInput } from "../components/ChatInput";
import { EmptyState } from "../components/EmptyState";
import { OffPlatformConsentCard } from "../components/OffPlatformConsentCard";
import { OffPlatformEducationModal } from "../components/OffPlatformEducationModal";
import { PaywallModal } from "../components/PaywallModal";
import { QuickiePaywallModal } from "../components/QuickiePaywallModal";
import { ReportBlockModal } from "../components/ReportBlockModal";
import type { ChatMessage, ChatThread, Match, UserProfile } from "../types";
import type { PremiumPlan } from "../constants/plans";
import { FEMALE_SAFETY_COPY } from "../constants/safety";
import { readReceiptsAllowed } from "../utils/activityPrivacy";
import { matchAnniversaryBanner } from "../utils/connectionAnniversary";
import { getDatingProfile } from "../utils/profile";
import { checkOutgoingChatMessage, CONTACT_LEAK_BLOCK_MESSAGE } from "../utils/contactGuard";
import { blockUser, canUseInbox, filterBlockedByProfileId, unmatchUser } from "../utils/safety";
import { trackEvent } from "../utils/analytics";
import { pushNotification } from "../utils/notifications";
import { isViewerShadowBanned } from "../utils/shadowBan";
import { incrementDailyCount, readDailyCount, readJson, writeJson } from "../utils/storage";
import { persistMessageRemote } from "../services/memberData";
import { startQuickiePassPayment, completePendingPayment } from "../services/payments";
import { canMessageQuickieProfile, profileHasQuickieIntent, unlockQuickieMatch, activateQuickiePass } from "../utils/quickie";

type ChatsPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onUpgrade: (plan: PremiumPlan) => void;
  paymentLoading?: boolean;
  onDiscover?: () => void;
};

function formatThreadTime(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString("en-NG", { weekday: "short" });
}

function lastPreview(messages: ChatMessage[]): string {
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

export function ChatsPage({ isPremium, plans, onUpgrade, paymentLoading, onDiscover }: ChatsPageProps) {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [query, setQuery] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [listTick, setListTick] = useState(0);

  const threads = useMemo(
    () => readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {}),
    [listTick, activeMatch]
  );
  const matches = useMemo(
    () => filterBlockedByProfileId(readJson<Match[]>(STORAGE_KEYS.matches, [])),
    [listTick, activeMatch]
  );

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

  if (!matches.length && !activeMatch) {
    return (
      <div className="page member-page messages-page">
        <header className="member-page-head member-page-head--minimal">
          <h1>{EXPERIENCE_COPY.chatsTitle}</h1>
        </header>
        <EmptyState
          icon={MessageCircle}
          title={EXPERIENCE_COPY.chatEmptyTitle}
          message={EXPERIENCE_COPY.chatEmptyBody}
          actionLabel="Discover people"
          onAction={onDiscover}
        />
      </div>
    );
  }

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

  return (
    <div className="page member-page messages-page">
      <header className="member-page-head member-page-head--minimal">
        <h1>{EXPERIENCE_COPY.chatsTitle}</h1>
      </header>

      <label className="member-search">
        <Search size={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={EXPERIENCE_COPY.searchConversations}
        />
      </label>

      <ul className="messages-list">
        {filtered.map(({ match, thread, messages, lastAt, unread }) => {
          const pinned = Boolean(thread?.pinned);
          return (
            <li key={match.id}>
              <button
                type="button"
                className={`messages-row${unread > 0 ? " messages-row--unread" : ""}${pinned ? " messages-row--pinned" : ""}`}
                onClick={() => openConversation(match)}
              >
                <span className="messages-row__avatar">
                  <img src={match.photo} alt="" />
                </span>
                <span className="messages-row__body">
                  <span className="messages-row__top">
                    <strong>
                      {pinned ? <Pin size={12} className="messages-row__pin" aria-hidden /> : null}
                      {match.name}
                    </strong>
                    <time>{formatThreadTime(lastAt)}</time>
                  </span>
                  <span className="messages-row__preview">{lastPreview(messages)}</span>
                </span>
                {unread > 0 ? (
                  <span className="messages-row__badge" aria-label={`${unread} unread`}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const OFF_APP_MESSAGE_THRESHOLD = 8;

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
    offPlatformApproved: initialThread.offPlatformApproved,
    pendingOffPlatformRequest: initialThread.pendingOffPlatformRequest,
    offPlatformDeclined: initialThread.offPlatformDeclined,
    pinned: initialThread.pinned,
    readAt: initialThread.readAt
  });
  const [messages, setMessages] = useState<ChatMessage[]>(initialThread.messages);
  const [educationOpen, setEducationOpen] = useState(false);
  const [blockWarning, setBlockWarning] = useState("");
  const [toast, setToast] = useState("");
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
  const sentByMe = messages.filter((m) => m.from === "me").length;
  const showOffAppLink =
    messages.length >= OFF_APP_MESSAGE_THRESHOLD &&
    !threadMeta.offPlatformApproved &&
    !threadMeta.pendingOffPlatformRequest;

  useEffect(() => {
    void fetchMemberProfileById(user, match.profileId);
    markThreadRead(match.id);
    const seen = localStorage.getItem(STORAGE_KEYS.screenshotPrivacyNoticeSeen) === "true";
    if (!seen) {
      setScreenshotNotice(true);
      localStorage.setItem(STORAGE_KEYS.screenshotPrivacyNoticeSeen, "true");
    }
  }, [match.profileId, user.email, user.phone, match.id]);

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

    const contactCheck = checkOutgoingChatMessage(text, {
      connectionAccepted: true
    });

    if (contactCheck.blocked) {
      setBlockWarning(CONTACT_LEAK_BLOCK_MESSAGE);
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

  const requestOffApp = () => {
    updateMeta({ pendingOffPlatformRequest: true, offPlatformDeclined: false });
    pushNotification({
      type: "off_platform_request",
      title: `${match.name} wants to chat off-app`,
      body: "Say if you're comfortable leaving BamSignal."
    });
    setToast("We'll ask if they're OK continuing off-app before anything is shared.");
    setTimeout(() => setToast(""), 3500);
  };

  const acceptOffPlatform = () => {
    setEducationOpen(true);
  };

  const finishOffPlatformAccept = () => {
    setEducationOpen(false);
    updateMeta({
      offPlatformApproved: true,
      pendingOffPlatformRequest: false,
      offPlatformDeclined: false
    });
    setToast("You can share handles off-app — stay safe and meet in public first.");
    setTimeout(() => setToast(""), 3500);
  };

  const declineOffPlatform = () => {
    updateMeta({ pendingOffPlatformRequest: false, offPlatformDeclined: true });
    setToast("Kept inside BamSignal. They'll need to keep chatting here.");
    setTimeout(() => setToast(""), 3500);
  };

  const handleBlock = () => {
    blockUser(match.profileId);
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
          <span>{match.city}</span>
          {showOffAppLink && (
            <button type="button" className="chat-off-app-link" onClick={requestOffApp}>
              Continue off-app?
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

      {toast && <div className="toast toast--member">{toast}</div>}

      {threadMeta.pendingOffPlatformRequest && (
        <OffPlatformConsentCard
          matchName={match.name}
          onAccept={acceptOffPlatform}
          onDecline={declineOffPlatform}
        />
      )}

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
          <div key={m.id} className={`chat-bubble ${m.from}`}>
            {m.text}
          </div>
        ))}
        {showSeen ? <p className="chat-read-receipt">Seen</p> : null}
      </div>

      {dmPaused ? (
        <p className="chat-dm-paused">{inboxGate.reason ?? FEMALE_SAFETY_COPY.dmPaused}</p>
      ) : (
        <ChatInput
          onSend={handleSend}
          placeholder={`Message ${match.name}…`}
          blockWarning={blockWarning}
          onClearWarning={() => setBlockWarning("")}
        />
      )}

      <OffPlatformEducationModal
        open={educationOpen}
        onClose={() => setEducationOpen(false)}
        onContinue={finishOffPlatformAccept}
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
              setToast(result.error);
              setTimeout(() => setToast(""), 4000);
            }
            return;
          }
          if (result.needsVerify) {
            const verified = await completePendingPayment(user);
            if (verified.ok) {
              activateQuickiePass();
              unlockQuickieMatch(match.profileId);
              setQuickiePaywallOpen(false);
            } else if (!verified.pending && verified.error) {
              setToast(verified.error);
              setTimeout(() => setToast(""), 4000);
            }
          }
          setQuickieLoading(false);
        }}
      />

      <ReportBlockModal
        open={safetyOpen}
        userName={match.name}
        profileId={match.profileId}
        onClose={() => setSafetyOpen(false)}
        onBlock={handleBlock}
        onUnmatch={handleUnmatch}
      />
    </div>
  );
}
