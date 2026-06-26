type ProfileCompletionRingProps = {
  score: number;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
  label?: string;
  animated?: boolean;
};

export function ProfileCompletionRing({
  score,
  size = "md",
  onClick,
  className = "",
  label,
  animated = false
}: ProfileCompletionRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const content = (
    <>
      <svg viewBox="0 0 36 36" className="profile-completion-ring__svg" aria-hidden>
        <circle className="profile-completion-ring__track" cx="18" cy="18" r="15.5" />
        <circle
          className={`profile-completion-ring__fill${animated ? " profile-completion-ring__fill--animated" : ""}`}
          cx="18"
          cy="18"
          r="15.5"
          strokeDasharray={`${clamped} 100`}
        />
      </svg>
      {size !== "sm" ? <span className="profile-completion-ring__percent">{clamped}%</span> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`profile-completion-ring profile-completion-ring--${size} profile-completion-ring--button ${className}`.trim()}
        onClick={onClick}
        aria-label={label ?? `Profile ${clamped}% complete`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={`profile-completion-ring profile-completion-ring--${size} ${className}`.trim()}
      aria-label={label ?? `Profile ${clamped}% complete`}
    >
      {content}
    </span>
  );
}
