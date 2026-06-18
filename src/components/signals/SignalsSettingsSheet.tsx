import { X } from "lucide-react";

type SignalsSettingsSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function SignalsSettingsSheet({ open, onClose }: SignalsSettingsSheetProps) {
  if (!open) return null;

  return (
    <div className="signals-premium-sheet" role="dialog" aria-modal="true" aria-labelledby="signals-settings-title">
      <button type="button" className="signals-premium-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="signals-premium-sheet__panel">
        <header className="signals-premium-sheet__head">
          <h2 id="signals-settings-title">Signal preferences</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>
        <p className="signals-premium-sheet__copy">
          Choose how you want to be notified when someone sends you a signal. More controls are coming soon.
        </p>
        <ul className="signals-premium-sheet__list">
          <li>Notify me when I receive a new signal</li>
          <li>Highlight priority introductions</li>
          <li>Show nearby signals first</li>
        </ul>
      </div>
    </div>
  );
}
