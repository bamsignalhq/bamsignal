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
  label = "Age"
}: AgeRangeTapSelectProps) {
  return (
    <div className="age-range-select">
      <span className="age-range-select__label">{label}</span>
      <div className="age-range-select__row">
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
  );
}
