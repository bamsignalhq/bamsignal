import { ChevronDown } from "lucide-react";
import { useState } from "react";

const MIN_AGE = 18;
const MAX_AGE = 75;
const AGE_OPTIONS = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

type AgeRangeTapSelectProps = {
  ageMin: number;
  ageMax: number;
  onChange: (ageMin: number, ageMax: number) => void;
  label?: string;
};

export function AgeRangeTapSelect({
  ageMin,
  ageMax,
  onChange,
  label = "Preferred age range"
}: AgeRangeTapSelectProps) {
  const [open, setOpen] = useState(false);
  const summary = `${ageMin} – ${ageMax}`;

  return (
    <div className="tap-select-field age-range-tap-select">
      <span className="tap-select-field__label">{label}</span>

      <button
        type="button"
        className="tap-select-field__trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="tap-select-field__value">{summary}</span>
        <ChevronDown size={18} className="tap-select-field__chevron" aria-hidden />
      </button>

      {open ? (
        <div className="tap-select-sheet" role="dialog" aria-modal="true" aria-label={label}>
          <button
            type="button"
            className="tap-select-sheet__backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="tap-select-sheet__panel">
            <header className="tap-select-sheet__head">
              <h3>{label}</h3>
              <button type="button" className="tap-select-sheet__done" onClick={() => setOpen(false)}>
                Done
              </button>
            </header>
            <div className="age-range-tap-select__sheet-body">
              <div className="age-range-tap-select__row">
                <label className="age-range-select__field">
                  <span>Min</span>
                  <select
                    value={ageMin}
                    onChange={(e) => {
                      const min = Number(e.target.value);
                      onChange(min, Math.max(min, ageMax));
                    }}
                    aria-label="Minimum age"
                  >
                    {AGE_OPTIONS.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="age-range-select__field">
                  <span>Max</span>
                  <select
                    value={ageMax}
                    onChange={(e) => {
                      const max = Number(e.target.value);
                      onChange(Math.min(ageMin, max), max);
                    }}
                    aria-label="Maximum age"
                  >
                    {AGE_OPTIONS.filter((age) => age >= ageMin).map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
