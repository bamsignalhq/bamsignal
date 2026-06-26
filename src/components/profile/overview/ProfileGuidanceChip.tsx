import { useMemo, useState } from "react";
import type { DatingProfile } from "../../../types";
import { MemberMicroNudge } from "../../nudges/MemberMicroNudge";
import {
  dismissProfilePageGuidance,
  resolveProfilePageGuidance,
  type ProfilePageGuidanceKind
} from "../../../utils/profilePageGuidance";

type ProfileGuidanceChipProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  onPhotos: () => void;
  onVoice: () => void;
  onTrusted: () => void;
  className?: string;
};

function actionForKind(
  kind: ProfilePageGuidanceKind,
  handlers: Pick<ProfileGuidanceChipProps, "onPhotos" | "onVoice" | "onTrusted">
): () => void {
  switch (kind) {
    case "photos":
      return handlers.onPhotos;
    case "voice":
      return handlers.onVoice;
    case "trusted":
      return handlers.onTrusted;
  }
}

export function ProfileGuidanceChip({
  profile,
  phoneVerified = false,
  isPremium = false,
  onPhotos,
  onVoice,
  onTrusted,
  className = ""
}: ProfileGuidanceChipProps) {
  const options = useMemo(() => ({ phoneVerified, isPremium }), [phoneVerified, isPremium]);
  const guidance = useMemo(
    () => resolveProfilePageGuidance(profile, options),
    [profile, options]
  );
  const [hidden, setHidden] = useState(false);
  const [exiting, setExiting] = useState(false);

  if (!guidance || hidden) return null;

  const handleDismiss = () => {
    setExiting(true);
    window.setTimeout(() => {
      dismissProfilePageGuidance(guidance.kind);
      setHidden(true);
    }, 200);
  };

  return (
    <MemberMicroNudge
      emoji={guidance.emoji}
      lead={guidance.lead}
      cta={guidance.cta}
      onAction={actionForKind(guidance.kind, { onPhotos, onVoice, onTrusted })}
      onDismiss={handleDismiss}
      exiting={exiting}
      className={`profile-guidance-chip ${className}`.trim()}
    />
  );
}
