type CompatibilityReasonsCardProps = {
  reasons: string[];
  className?: string;
  title?: string;
};

export function CompatibilityReasonsCard({
  reasons,
  className = "",
  title = "Why You May Connect"
}: CompatibilityReasonsCardProps) {
  if (!reasons.length) return null;

  return (
    <section
      className={`compat-reasons-card ${className}`.trim()}
      aria-label={title}
    >
      <h3 className="compat-reasons-card__title">{title}</h3>
      <ul className="compat-reasons-card__list">
        {reasons.map((reason) => (
          <li key={reason} className="compat-reasons-card__row">
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
