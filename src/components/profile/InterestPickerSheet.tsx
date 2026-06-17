import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  INTEREST_CATEGORIES,
  MAX_PROFILE_INTERESTS,
  MIN_PROFILE_INTERESTS
} from "../../constants/interestCategories";

type InterestPickerSheetProps = {
  open: boolean;
  selected: string[];
  onChange: (interests: string[]) => void;
  onClose: () => void;
  /** Onboarding — show minimum required for Continue */
  requireMinimum?: boolean;
};

export function InterestPickerSheet({
  open,
  selected,
  onChange,
  onClose,
  requireMinimum = false
}: InterestPickerSheetProps) {
  const [limitMessage, setLimitMessage] = useState("");
  const atMax = selected.length >= MAX_PROFILE_INTERESTS;

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
    if (atMax) {
      setLimitMessage(`You can choose up to ${MAX_PROFILE_INTERESTS} interests.`);
      return;
    }
    setLimitMessage("");
    onChange([...selected, interest]);
  };

  const remove = (interest: string) => {
    setLimitMessage("");
    onChange(selected.filter((item) => item !== interest));
  };

  const clearAll = () => {
    setLimitMessage("");
    onChange([]);
  };

  const countHint = () => {
    if (requireMinimum && selected.length < MIN_PROFILE_INTERESTS) {
      return `Pick at least ${MIN_PROFILE_INTERESTS} to continue · ${selected.length} selected`;
    }
    if (selected.length > 0) {
      return `${selected.length} selected · ${MAX_PROFILE_INTERESTS} max`;
    }
    if (requireMinimum) {
      return `Pick at least ${MIN_PROFILE_INTERESTS} to continue`;
    }
    return `${MIN_PROFILE_INTERESTS}–${MAX_PROFILE_INTERESTS} recommended`;
  };

  return createPortal(
    <div className="interest-sheet" role="dialog" aria-modal="true" aria-label="Choose your interests">
      <button type="button" className="interest-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="interest-sheet__panel card">
        <header className="interest-sheet__head">
          <div>
            <h3>Choose your interests</h3>
            <p>Pick a few that feel like you.</p>
            {selected.length > 0 ? (
              <p className="tap-select-sheet__count">{selected.length} selected</p>
            ) : null}
          </div>
          <button type="button" className="tap-select-sheet__done" onClick={onClose}>
            Done
          </button>
        </header>

        {selected.length > 0 ? (
          <div className="tap-select-sheet__selected interest-sheet__selected">
            <div className="tap-select-sheet__chips">
              {selected.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className="tap-select-chip"
                  onClick={() => remove(interest)}
                  aria-label={`Remove ${interest}`}
                >
                  {interest}
                  <X size={14} aria-hidden />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="interest-sheet__body">
          {INTEREST_CATEGORIES.map((category) => (
            <section key={category.id} className="interest-sheet__category">
              <h4>{category.label}</h4>
              <div className="interest-sheet__chips">
                {category.interests.map((interest) => {
                  const isSelected = selected.includes(interest);
                  const blocked = !isSelected && atMax;
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`interest-sheet-chip${isSelected ? " interest-sheet-chip--selected" : ""}${blocked ? " interest-sheet-chip--disabled" : ""}`}
                      onClick={() => toggle(interest)}
                      disabled={blocked}
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
          ) : (
            <p className="interest-sheet__count">{countHint()}</p>
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
    </div>,
    document.body
  );
}
