import { ChevronRight, Shield } from "lucide-react";

type DiscoverSafetyCardProps = {
  onClick?: () => void;
};

export function DiscoverSafetyCard({ onClick }: DiscoverSafetyCardProps) {
  return (
    <button type="button" className="discover-premium-safety" onClick={onClick}>
      <span className="discover-premium-safety__icon" aria-hidden>
        <Shield size={22} />
      </span>
      <span className="discover-premium-safety__copy">
        <strong>You&apos;re in control</strong>
        <span>We protect your privacy and keep it safe.</span>
      </span>
      <ChevronRight size={20} className="discover-premium-safety__chevron" aria-hidden />
    </button>
  );
}
