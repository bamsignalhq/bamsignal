import { useMemo, useState } from "react";
import { SmartConversationSection } from "../conversation/SmartConversationSection";
import type { DatingProfile, DiscoverProfile, UserProfile } from "../../types";
import { copyIcebreaker } from "../../utils/chatDraft";
import { SuggestedProfilesRow } from "./SuggestedProfilesRow";

type EmptyChatStateProps = {
  viewer: DatingProfile;
  user: Pick<UserProfile, "email" | "phone">;
  isPremium: boolean;
  phoneVerified: boolean;
  onDiscover?: () => void;
  onBuildProfile?: () => void;
  onSendSignal: (profile: DiscoverProfile) => Promise<boolean>;
  onOpenProfile?: (profile: DiscoverProfile) => void;
};

const SUBTEXT_OPTIONS = [
  "Your next conversation could start today.",
  "Meaningful conversations start with one hello."
] as const;

function EmptyChatIllustration() {
  return (
    <div className="empty-chat-illustration" aria-hidden>
      <svg viewBox="0 0 200 140" className="empty-chat-illustration__svg">
        <defs>
          <linearGradient id="emptyChatGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9b6dff" />
            <stop offset="100%" stopColor="#e91e8f" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="118" rx="72" ry="10" fill="rgba(155,109,255,0.18)" />
        <rect x="28" y="34" width="92" height="52" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(155,109,255,0.35)" />
        <rect x="80" y="58" width="92" height="52" rx="18" fill="url(#emptyChatGlow)" opacity="0.22" stroke="rgba(233,30,143,0.35)" />
        <circle cx="52" cy="52" r="8" fill="rgba(233,30,143,0.55)" />
        <circle cx="72" cy="52" r="8" fill="rgba(155,109,255,0.55)" />
        <circle cx="92" cy="52" r="8" fill="rgba(255,255,255,0.35)" />
        <path
          d="M104 82h48a10 10 0 0 1 10 10v10a10 10 0 0 1-10 10h-28l-14 12v-12h-6a10 10 0 0 1-10-10V92a10 10 0 0 1 10-10z"
          fill="rgba(36,17,47,0.85)"
          stroke="rgba(233,30,143,0.45)"
        />
      </svg>
    </div>
  );
}

export function EmptyChatState({
  viewer,
  user,
  isPremium,
  phoneVerified,
  onDiscover,
  onBuildProfile: _onBuildProfile,
  onSendSignal,
  onOpenProfile
}: EmptyChatStateProps) {
  const subtext = useMemo(
    () => SUBTEXT_OPTIONS[Math.floor(Date.now() / 86_400_000) % SUBTEXT_OPTIONS.length],
    []
  );

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(() => new Set());
  const [icebreakerToast, setIcebreakerToast] = useState("");

  const handleSendSignal = async (profile: DiscoverProfile) => {
    if (sendingId || sentIds.has(profile.id)) return;
    setSendingId(profile.id);
    const ok = await onSendSignal(profile);
    setSendingId(null);
    if (ok) setSentIds((prev) => new Set(prev).add(profile.id));
  };

  const handleIcebreaker = (text: string) => {
    void copyIcebreaker(text).then((ok) => {
      setIcebreakerToast(ok ? "Copied — use when you chat" : "Ready when you start chatting");
      window.setTimeout(() => setIcebreakerToast(""), 2400);
    });
  };

  return (
    <div className="empty-chat-state">
      <header className="empty-chat-state__hero empty-chat-stagger">
        <EmptyChatIllustration />
        <h2 className="empty-chat-state__title">Nobody here yet 😊</h2>
        <p className="empty-chat-state__subtext">{subtext}</p>
      </header>

      <SuggestedProfilesRow
        user={user}
        viewer={viewer}
        isPremium={isPremium}
        phoneVerified={phoneVerified}
        sendingId={sendingId}
        sentIds={sentIds}
        onSendSignal={(profile) => void handleSendSignal(profile)}
        onOpenProfile={onOpenProfile}
      />

      <div className="empty-chat-stagger" style={{ animationDelay: "220ms" }}>
        <SmartConversationSection
          viewer={viewer}
          target={{}}
          context="empty-inbox"
          onSelect={handleIcebreaker}
        />
      </div>

      {icebreakerToast ? (
        <p className="empty-chat-toast" role="status">
          {icebreakerToast}
        </p>
      ) : null}

      <section className="empty-chat-section empty-chat-stagger" style={{ animationDelay: "320ms" }}>
        <h2 className="empty-chat-section__title">Discover More People</h2>
        {onDiscover ? (
          <button type="button" className="btn-secondary btn-full" onClick={onDiscover}>
            Go to Discover
          </button>
        ) : null}
      </section>
    </div>
  );
}
