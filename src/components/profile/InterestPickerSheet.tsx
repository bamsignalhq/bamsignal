import { useEffect, useState } from "react";
import {
  INTEREST_CATEGORIES,
  MAX_PROFILE_INTERESTS
} from "../../constants/interestCategories";

type InterestPickerSheetProps = {
  open: boolean;
  selected: string[];
  onChange: (interests: string[]) => void;
  onClose: () => void;
};

export function InterestPickerSheet({ open, selected, onChange, onClose }: InterestPickerSheetProps) {
  const [limitMessage, setLimitMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setLimitMessage("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const toggle = (interest: string) => {
    if (selected.includes(interest)) {
      setLimitMessage("");
      onChange(selected.filter((item) => item !== interest));
      return;
    }
    if (selected.length >= MAX_PROFILE_INTERESTS) {
      setLimitMessage("You can choose up to 12 interests.");
      return;
    }
    setLimitMessage("");
    onChange([...selected, interest]);
  };

  const clearAll = () => {
    setLimitMessage("");
    onChange([]);
  };

  return (
    <div className="interest-sheet" role="dialog" aria-modal="true" aria-label="Choose your interests">
      <button type="button" className="interest-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="interest-sheet__panel card">
        <header className="interest-sheet__head">
          <div>
            <h3>Choose your interests</h3>
            <p>Pick a few that feel like you.</p>
          </div>
        </header>

        <div className="interest-sheet__body">
          {INTEREST_CATEGORIES.map((category) => (
            <section key={category.id} className="interest-sheet__category">
              <h4>{category.label}</h4>
              <div className="interest-sheet__chips">
                {category.interests.map((interest) => {
                  const isSelected = selected.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`interest-sheet-chip${isSelected ? " interest-sheet-chip--selected" : ""}`}
                      onClick={() => toggle(interest)}
                      aria-pressed={isSelected}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer className="interest-sheet__foot">
          {limitMessage ? (
            <p className="interest-sheet__limit" role="status">
              {limitMessage}
            </p>
          ) : selected.length > 0 ? (
            <p className="interest-sheet__count">
              {selected.length} selected · {MAX_PROFILE_INTERESTS} max
            </p>
          ) : (
            <p className="interest-sheet__count">5–8 recommended · optional</p>
          )}
          <div className="interest-sheet__actions">
            <button type="button" className="btn-secondary" onClick={clearAll} disabled={!selected.length}>
              Clear
            </button>
            <button type="button" className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
