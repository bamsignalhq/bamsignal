import { useState } from "react";
import { dismissTrustFeedNudge, shouldShowTrustFeedNudge } from "../../utils/trustFeedInsertion";
import { MemberMicroNudge } from "../nudges/MemberMicroNudge";

export type TrustedMemberNudgeVariant = "feed" | "profile";

type TrustedMemberNudgeProps = {
  variant?: TrustedMemberNudgeVariant;
  onBecome: () => void;
  className?: string;
  dismissible?: boolean;
};

const COPY: Record<
  TrustedMemberNudgeVariant,
  { emoji: string; lead: string; cta: string; dismissible: boolean }
> = {
  feed: {
    emoji: "🛡",
    lead: "Trusted Members receive more replies",
    cta: "Become Trusted →",
    dismissible: true
  },
  profile: {
    emoji: "🛡",
    lead: "Build trust with other members",
    cta: "Become Trusted →",
    dismissible: false
  }
};

export function TrustedMemberNudge({
  variant = "feed",
  onBecome,
  className = "",
  dismissible
}: TrustedMemberNudgeProps) {
  const copy = COPY[variant];
  const canDismiss = dismissible ?? copy.dismissible;
  const [visible, setVisible] = useState(() => (variant === "feed" ? shouldShowTrustFeedNudge() : true));
  const [exiting, setExiting] = useState(false);

  if (!visible) return null;

  const handleDismiss = () => {
    setExiting(true);
    window.setTimeout(() => {
      dismissTrustFeedNudge();
      setVisible(false);
    }, 200);
  };

  return (
    <MemberMicroNudge
      emoji={copy.emoji}
      lead={copy.lead}
      cta={copy.cta}
      onAction={onBecome}
      onDismiss={canDismiss ? handleDismiss : undefined}
      exiting={exiting}
      className={`trusted-member-nudge trusted-member-nudge--${variant} ${className}`.trim()}
    />
  );
}
