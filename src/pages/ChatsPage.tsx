import { ArrowLeft, MessageCircle, MoreVertical, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BRAND } from "../constants/copy";
import { FREE_DAILY_MESSAGES, STORAGE_KEYS } from "../constants/limits";
import { getCachedMemberProfile, fetchMemberProfileById } from "../services/discoverProfiles";
import { ActivityStatus } from "../components/ActivityStatus";
import { WhyThisProfile } from "../components/WhyThisProfile";
import { ChatInput } from "../components/ChatInput";
import { EmptyState } from "../components/EmptyState";
import { OffPlatformConsentCard } from "../components/OffPlatformConsentCard";
import { OffPlatformEducationModal } from "../components/OffPlatformEducationModal";
import { PaywallModal } from "../components/PaywallModal";
import { ReportBlockModal } from "../components/ReportBlockModal";
import { SafetyNotice } from "../components/SafetyNotice";
import type { ChatMessage, ChatThread, Match, UserProfile } from "../types";
import type { PremiumPlan } from "../constants/plans";
import { FEMALE_SAFETY_COPY } from "../constants/safety";
import { getDatingProfile } from "../utils/profile";
import { getProfileMatchReasons } from "../utils/compatibility";
import { checkOutgoingChatMessage } from "../utils/contactGuard";
import { blockUser, canUseInbox, filterBlockedByProfileId } from "../utils/safety";
import { isOnlineNow } from "../utils/activity";
import { trackEvent } from "../utils/analytics";
import { pushNotification } from "../utils/notifications";
import { isViewerShadowBanned } from "../utils/shadowBan";
import { incrementDailyCount, readDailyCount, readJson, writeJson } from "../utils/storage";
import { persistMessageRemote } from "../services/memberData";

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
  if (!messages.length) return "Say hi — your signal was accepted ✨";
  const last = messages[messages.length - 1];
  const prefix = last.from === "me" ? "You: " : "";
  return `${prefix}${last.text}`;
}

export function ChatsPage({ isPremium, plans, onUpgrade, paymentLoading, onDiscover }: ChatsPageProps) {
  const threads = readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {});
  const matches = filterBlockedByProfileId(readJson<Match[]>(STORAGE_KEYS.matches, []));
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [query, setQuery] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);

  const rows = useMemo(() => {
    return matches
      .map((match) => {
        const thread = threads[match.id];
        const messages = thread?.messages ?? [];
        const lastAt = messages[messages.length - 1]?.at ?? match.matchedAt;
        const lastActiveAt = match.lastActiveAt ?? getCachedMemberProfile(match.profileId)?.lastActiveAt;
        return { match, messages, lastAt, lastActiveAt };
      })
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [matches, threads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ match }) => match.name.toLowerCase().includes(q) || match.city.toLowerCase().includes(q));
  }, [query, rows]);

  if (!matches.length && !activeMatch) {
    return (
      <div className="page member-page messages-page">
        <header className="member-page-head">
          <div>
            <p className="member-page-head__eyebrow">Messages</p>
            <h1>Your inbox</h1>
          </div>
        </header>
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          message="Your conversations will appear here."
          actionLabel="Go to Discover"
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
        onBack={() => setActiveMatch(null)}
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

  return (
    <div className="page member-page messages-page">
      <header className="member-page-head">
        <div>
          <p className="member-page-head__eyebrow">Messages</p>
          <h1>{matches.length} conversation{matches.length === 1 ? "" : "s"}</h1>
          <p className="member-page-head__sub">Signal accepted — chat safely inside BamSignal.</p>
        </div>
      </header>

      <label className="member-search">
        <Search size={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages"
        />
      </label>

      <ul className="messages-list">
        {filtered.map(({ match, messages, lastAt, lastActiveAt }) => {
          const online = isOnlineNow(lastActiveAt);
          const unread = messages.filter((m) => m.from === "them").length > 0 && messages[messages.length - 1]?.from === "them";
          return (
            <li key={match.id}>
              <button type="button" className="messages-row" onClick={() => setActiveMatch(match)}>
                <span className="messages-row__avatar">
                  <img src={match.photo} alt="" />
                  {online && <span className="messages-row__online" aria-label="Online now" />}
                </span>
                <span className="messages-row__body">
                  <span className="messages-row__top">
                    <strong>{match.name}</strong>
                    <time>{formatThreadTime(lastAt)}</time>
                  </span>
                  <span className="messages-row__preview">{lastPreview(messages)}</span>
                  <span className="messages-row__meta">
                    {match.city}
                    {lastActiveAt && (
                      <>
                        {" · "}
                        <ActivityStatus lastActiveAt={lastActiveAt} variant="subtle" />
                      </>
                    )}
                  </span>
                </span>
                {unread && <span className="messages-row__unread" aria-label="Unread" />}
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
    offPlatformDeclined: initialThread.offPlatformDeclined
  });
  const [messages, setMessages] = useState<ChatMessage[]>(initialThread.messages);
  const [educationOpen, setEducationOpen] = useState(false);
  const [blockWarning, setBlockWarning] = useState("");
  const [toast, setToast] = useState("");
  const viewer = getDatingProfile();
  const inboxGate = canUseInbox(viewer);
  const dmPaused = !inboxGate.allowed;
  const lastActiveAt = match.lastActiveAt ?? getCachedMemberProfile(match.profileId)?.lastActiveAt;
  const discoverProfile = getCachedMemberProfile(match.profileId);
  const matchReasons = discoverProfile ? getProfileMatchReasons(getDatingProfile(), discoverProfile) : [];
  const sentByMe = messages.filter((m) => m.from === "me").length;
  const showOffAppLink =
    messages.length >= OFF_APP_MESSAGE_THRESHOLD &&
    !threadMeta.offPlatformApproved &&
    !threadMeta.pendingOffPlatformRequest;

  useEffect(() => {
    void fetchMemberProfileById(user, match.profileId);
  }, [match.profileId, user.email, user.phone]);

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
      offPlatformApproved: Boolean(threadMeta.offPlatformApproved)
    });

    if (contactCheck.blocked) {
      if (contactCheck.kind === "digits") {
        setBlockWarning(BRAND.contactBlockMessage);
        return;
      }
      if (contactCheck.needsConsent) {
        setBlockWarning(BRAND.contactTelegramBlocked);
        updateMeta({ pendingOffPlatformRequest: true, offPlatformDeclined: false });
        pushNotification({
          type: "off_platform_request",
          title: `${match.name} wants to chat off-app`,
          body: "Open Messages to say if you're comfortable leaving BamSignal."
        });
        setToast(`${match.name} wants to continue off-app — see the prompt below.`);
        setTimeout(() => setToast(""), 4000);
        return;
      }
      setBlockWarning(BRAND.contactBlockMessage);
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

  return (
    <div className="page chat-detail-page">
      <header className="chat-detail-header chat-detail-header--fintech">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <img src={match.photo} alt="" className="chat-avatar" />
        <div className="chat-detail-header__meta">
          <strong>{match.name}</strong>
          <ActivityStatus lastActiveAt={lastActiveAt} variant="subtle" />
          <span>{match.city}</span>
          {showOffAppLink && (
            <button type="button" className="chat-off-app-link" onClick={requestOffApp}>
              Continue off-app?
            </button>
          )}
        </div>
        <button type="button" className="icon-btn" onClick={() => setSafetyOpen(true)} aria-label="Safety options">
          <MoreVertical size={22} />
        </button>
      </header>

      {toast && <div className="toast toast--member">{toast}</div>}

      <SafetyNotice variant="chat" message={BRAND.chatSafetyNotice} />

      {threadMeta.pendingOffPlatformRequest && (
        <OffPlatformConsentCard
          matchName={match.name}
          onAccept={acceptOffPlatform}
          onDecline={declineOffPlatform}
        />
      )}

      {matchReasons.length > 0 && (
        <WhyThisProfile reasons={matchReasons} compact className="chat-detail-why" />
      )}

      <div className="chat-messages chat-messages--fintech">
        {messages.length === 0 && (
          <p className="chat-empty">Say hi to {match.name}! Keep it friendly and stay on BamSignal.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>

      <SafetyNotice variant="inline" message="Meet in public first. Tell a trusted contact where you're going and when you'll check in." />

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

      <ReportBlockModal
        open={safetyOpen}
        userName={match.name}
        profileId={match.profileId}
        onClose={() => setSafetyOpen(false)}
        onBlock={handleBlock}
      />
    </div>
  );
}
