import { Shield } from "lucide-react";

type TrustedMemberHomeCardProps = {
  onBecome: () => void;
  className?: string;
};

export function TrustedMemberHomeCard({ onBecome, className = "" }: TrustedMemberHomeCardProps) {
  return (
    <section className={`trusted-member-home-card ${className}`.trim()} aria-label="Build trust">
      <span className="trusted-member-home-card__icon" aria-hidden>
        <Shield size={22} />
      </span>
      <div className="trusted-member-home-card__copy">
        <h2 className="trusted-member-home-card__title">Build trust with other members</h2>
        <p className="trusted-member-home-card__sub">
          People are more likely to respond to trusted profiles.
        </p>
      </div>
      <button type="button" className="btn-primary btn-sm" onClick={onBecome}>
        Become a Trusted Member
      </button>
    </section>
  );
}
