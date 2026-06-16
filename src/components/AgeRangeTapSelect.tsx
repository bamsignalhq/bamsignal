import { TapSelectField } from "./TapSelectField";

const MIN_AGE = 18;
const MAX_AGE = 75;
const AGE_OPTIONS = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => String(MIN_AGE + i));

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
  const minOptions = AGE_OPTIONS.filter((age) => Number(age) <= ageMax);
  const maxOptions = AGE_OPTIONS.filter((age) => Number(age) >= ageMin);

  return (
    <div className="age-range-tap-select">
      <span className="tap-select-field__label">{label}</span>
      <div className="age-range-tap-select__row">
        <TapSelectField
          label="From"
          placeholder="Min"
          options={minOptions}
          value={String(ageMin)}
          onChange={(next) => {
            const min = Number(next);
            if (!Number.isFinite(min)) return;
            onChange(min, Math.max(min, ageMax));
          }}
        />
        <TapSelectField
          label="To"
          placeholder="Max"
          options={maxOptions}
          value={String(ageMax)}
          onChange={(next) => {
            const max = Number(next);
            if (!Number.isFinite(max)) return;
            onChange(Math.min(ageMin, max), max);
          }}
        />
      </div>
    </div>
  );
}
