import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { INTEREST_OPTIONS } from "../constants/profileOptions";

const MAX_INTERESTS = 5;

type InterestPickerProps = {
  selected: string[];
  onChange: (interests: string[]) => void;
};

export function InterestPicker({ selected, onChange }: InterestPickerProps) {
  const atMax = selected.length >= MAX_INTERESTS;
  const [expanded, setExpanded] = useState(selected.length === 0);

  const toggle = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((i) => i !== interest));
      return;
    }
    if (selected.length >= MAX_INTERESTS) return;
    const next = [...selected, interest];
    onChange(next);
    if (next.length >= MAX_INTERESTS) {
      setExpanded(false);
    }
  };

  const showAllOptions = expanded || !atMax;

  return (
    <fieldset className="intent-fieldset interest-picker">
      <legend>
        Interests
        {selected.length > 0 ? ` · ${selected.length}/${MAX_INTERESTS}` : ""}
      </legend>

      {atMax && !expanded && (
        <div className="intent-tags selectable interest-picker__selected">
          {selected.map((interest) => (
            <button
              key={interest}
              type="button"
              className="intent-tag selected"
              onClick={() => toggle(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="interest-picker__toggle link-btn"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={showAllOptions}
      >
        {showAllOptions ? (
          <>
            {atMax ? "Hide options" : "Hide interests"} <ChevronUp size={16} />
          </>
        ) : (
          <>
            {selected.length === 0 ? "Choose interests" : "Edit interests"} <ChevronDown size={16} />
          </>
        )}
      </button>

      {showAllOptions && (
        <>
          {atMax && (
            <p className="interest-picker__hint">Maximum {MAX_INTERESTS} — tap a selected tag to remove one.</p>
          )}
          <div className="intent-tags selectable">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selected.includes(interest);
              const disabled = !isSelected && selected.length >= MAX_INTERESTS;
              return (
                <button
                  key={interest}
                  type="button"
                  className={`intent-tag ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                  onClick={() => toggle(interest)}
                  disabled={disabled}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </>
      )}
    </fieldset>
  );
}
