import type { DatingProfile, DiscoverProfile, UserProfile } from "../../types";
import { useSuggestedChatProfiles } from "../../hooks/useSuggestedChatProfiles";
import { ActiveMembersRow } from "./ActiveMembersRow";

type SuggestedProfilesRowProps = {
  user: Pick<UserProfile, "email" | "phone">;
  viewer: DatingProfile;
  isPremium: boolean;
  phoneVerified: boolean;
  enabled?: boolean;
  sendingId?: string | null;
  sentIds?: Set<string>;
  onSendSignal: (profile: DiscoverProfile) => void;
  onOpenProfile?: (profile: DiscoverProfile) => void;
};

export function SuggestedProfilesRow({
  user,
  viewer,
  isPremium,
  phoneVerified,
  enabled = true,
  sendingId,
  sentIds,
  onSendSignal,
  onOpenProfile
}: SuggestedProfilesRowProps) {
  const { profiles, loading } = useSuggestedChatProfiles(user, viewer, enabled);

  if (loading) {
    return (
      <section className="empty-chat-section empty-chat-stagger" aria-busy="true">
        <h2 className="empty-chat-section__title">People active around you</h2>
        <div className="active-members-row active-members-row--loading">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="chat-profile-mini-card chat-profile-mini-card--skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (!profiles.length) return null;

  return (
    <section className="empty-chat-section empty-chat-stagger" style={{ animationDelay: "120ms" }}>
      <h2 className="empty-chat-section__title">People active around you</h2>
      <ActiveMembersRow
        profiles={profiles}
        viewer={viewer}
        isPremium={isPremium}
        phoneVerified={phoneVerified}
        sendingId={sendingId}
        sentIds={sentIds}
        onSendSignal={onSendSignal}
        onOpenProfile={onOpenProfile}
      />
    </section>
  );
}
