import { useMemo, useState } from "react";
import { STORAGE_KEYS } from "../../constants/limits";
import { navigateToPath } from "../../constants/routes";
import type { DatingProfile } from "../../types";
import {
  dismissProfileNudge,
  resolveVisibleProfileImprovementNudge,
  type ProfileImprovementNudgeContent
} from "../../utils/profileNudge";
import { MemberMicroNudge } from "./MemberMicroNudge";

type ProfileImprovementNudgeProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  className?: string;
};

function navigateForNudge(nudge: ProfileImprovementNudgeContent): void {
  if (nudge.kind === "verification") {
    navigateToPath("/trusted-member");
    return;
  }

  if (nudge.editSection) {
    localStorage.setItem(STORAGE_KEYS.profileEditSection, nudge.editSection);
  }
  navigateToPath("/profile");
}

export function ProfileImprovementNudge({
  profile,
  phoneVerified = false,
  isPremium = false,
  className = ""
}: ProfileImprovementNudgeProps) {
  const options = useMemo(() => ({ phoneVerified, isPremium }), [phoneVerified, isPremium]);
  const nudge = useMemo(
    () => resolveVisibleProfileImprovementNudge(profile, options),
    [profile, options]
  );
  const [hidden, setHidden] = useState(false);
  const [exiting, setExiting] = useState(false);

  if (!nudge || hidden) return null;

  const handleDismiss = () => {
    setExiting(true);
    window.setTimeout(() => {
      dismissProfileNudge(nudge.kind, profile, options);
      setHidden(true);
    }, 200);
  };

  return (
    <MemberMicroNudge
      emoji={nudge.emoji}
      lead={nudge.lead}
      cta={nudge.cta}
      onAction={() => navigateForNudge(nudge)}
      onDismiss={handleDismiss}
      exiting={exiting}
      className={className}
    />
  );
}
