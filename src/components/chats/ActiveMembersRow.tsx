import type { DatingProfile, DiscoverProfile } from "../../types";
import { buildCompatibilityReasons } from "../../utils/buildCompatibilityReasons";
import { hasVoiceVibe } from "../../utils/voiceVibe";
import { ChatProfileMiniCard } from "./ChatProfileMiniCard";

type ActiveMembersRowProps = {
  profiles: DiscoverProfile[];
  viewer: DatingProfile;
  isPremium: boolean;
  phoneVerified: boolean;
  sendingId?: string | null;
  sentIds?: Set<string>;
  onSendSignal: (profile: DiscoverProfile) => void;
  onOpenProfile?: (profile: DiscoverProfile) => void;
};

export function ActiveMembersRow({
  profiles,
  viewer,
  isPremium,
  phoneVerified,
  sendingId,
  sentIds,
  onSendSignal,
  onOpenProfile
}: ActiveMembersRowProps) {
  if (!profiles.length) return null;

  return (
    <div className="active-members-row" role="list">
      {profiles.map((profile, index) => (
          <ChatProfileMiniCard
            key={profile.id}
            profile={profile}
            compatibilityReasons={buildCompatibilityReasons(viewer, profile)}
            hasVoiceVibe={hasVoiceVibe(profile)}
            sending={sendingId === profile.id}
            signalSent={sentIds?.has(profile.id)}
            staggerIndex={index}
            onSendSignal={() => onSendSignal(profile)}
            onOpenProfile={onOpenProfile ? () => onOpenProfile(profile) : undefined}
          />
      ))}
    </div>
  );
}
