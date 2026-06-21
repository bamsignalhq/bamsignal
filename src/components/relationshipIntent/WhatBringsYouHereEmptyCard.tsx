type WhatBringsYouHereEmptyCardProps = {
  onSet: () => void;
  className?: string;
};

export function WhatBringsYouHereEmptyCard({ onSet, className = "" }: WhatBringsYouHereEmptyCardProps) {
  return (
    <section className={`what-brings-you-here-empty ${className}`.trim()}>
      <p className="what-brings-you-here-empty__label">Not set yet</p>
      <p className="what-brings-you-here-empty__copy">
        Different people are looking for different things.
      </p>
      <button type="button" className="btn-secondary btn-full" onClick={onSet}>
        Tell people what brings you here
      </button>
    </section>
  );
}
