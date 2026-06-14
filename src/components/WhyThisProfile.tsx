type WhyThisProfileProps = {
  reasons: string[];
  compact?: boolean;
  className?: string;
};

export function WhyThisProfile({ reasons, compact = false, className = "" }: WhyThisProfileProps) {
  if (!reasons.length) return null;

  const visible = compact ? reasons.slice(0, 3) : reasons.slice(0, 4);

  return (
    <section
      className={`why-this-profile ${compact ? "why-this-profile--compact" : ""} ${className}`.trim()}
      aria-label="Why this profile"
    >
      <h4 className="why-this-profile__title">Why this profile?</h4>
      <ul className="why-this-profile__list">
        {visible.map((reason) => (
          <li key={reason}>
            <span className="why-this-profile__mark" aria-hidden="true">
              ✓
            </span>
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
