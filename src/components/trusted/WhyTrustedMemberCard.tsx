type WhyTrustedMemberCardProps = {
  onBecome: () => void;
  className?: string;
};

export function WhyTrustedMemberCard({ onBecome, className = "" }: WhyTrustedMemberCardProps) {
  return (
    <section className={`why-trusted-member-card ${className}`.trim()}>
      <p className="why-trusted-member-card__eyebrow">Not yet a Trusted Member</p>
      <h2 className="why-trusted-member-card__title">Why become a Trusted Member?</h2>
      <p className="why-trusted-member-card__copy">
        People are more likely to connect with members they trust.
      </p>
      <p className="why-trusted-member-card__hint">
        Your verification photo remains private and is never shown publicly.
      </p>
      <button type="button" className="btn-secondary btn-full" onClick={onBecome}>
        Become a Trusted Member
      </button>
    </section>
  );
}
