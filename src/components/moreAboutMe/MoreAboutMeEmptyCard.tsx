type MoreAboutMeEmptyCardProps = {
  onAdd: () => void;
  className?: string;
};

export function MoreAboutMeEmptyCard({ onAdd, className = "" }: MoreAboutMeEmptyCardProps) {
  return (
    <section className={`more-about-me-empty ${className}`.trim()}>
      <p className="more-about-me-empty__label">No details added yet</p>
      <p className="more-about-me-empty__copy">Choose things that feel like you.</p>
      <button type="button" className="btn-secondary btn-full" onClick={onAdd}>
        Tell people more about yourself
      </button>
    </section>
  );
}
