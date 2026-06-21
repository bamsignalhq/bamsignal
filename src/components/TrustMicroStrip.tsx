import { cardActivityBadge } from "../utils/activity";

type TrustMicroStripProps = {
  verified?: boolean;
  voiceIntroUrl?: string;
  lastActiveAt?: string;
  className?: string;
};

export function TrustMicroStrip({
  verified,
  voiceIntroUrl,
  lastActiveAt,
  className = ""
}: TrustMicroStripProps) {
  const activity = lastActiveAt ? cardActivityBadge(lastActiveAt) : null;
  const items: string[] = [];

  if (verified) items.push("Trusted Member");
  if (voiceIntroUrl) items.push("Voice Vibe");
  if (activity?.online) items.push("Active now");
  else if (activity?.label) items.push(activity.label);

  if (!items.length) return null;

  return (
    <div className={`trust-micro ${className}`.trim()} aria-label="Trust indicators">
      {items.map((item) => (
        <span key={item} className="trust-micro__item">
          {item}
        </span>
      ))}
    </div>
  );
}
