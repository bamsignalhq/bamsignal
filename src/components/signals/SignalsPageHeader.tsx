import { SlidersHorizontal } from "lucide-react";

type SignalsPageHeaderProps = {
  onSettings: () => void;
};

export function SignalsPageHeader({ onSettings }: SignalsPageHeaderProps) {
  return (
    <header className="signals-premium-head">
      <div className="signals-premium-head__copy">
        <p className="signals-premium-head__eyebrow">LIKES</p>
        <h1>Incoming signals</h1>
      </div>
      <button type="button" className="signals-premium-head__settings" onClick={onSettings}>
        <SlidersHorizontal size={16} aria-hidden />
        Settings
      </button>
    </header>
  );
}
