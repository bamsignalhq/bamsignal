import { ageFromDateOfBirth, isAdultDob } from "../utils/ageFromDob";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
] as const;

type DateOfBirthPickerProps = {
  value: string;
  onChange: (isoDate: string, age: number | null) => void;
};

function partsFromIso(iso: string): { day: number; month: number; year: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 25);
    return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
  }
  return { day: Number(match[3]), month: Number(match[2]), year: Number(match[1]) };
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function DateOfBirthPicker({ value, onChange }: DateOfBirthPickerProps) {
  const { day, month, year } = partsFromIso(value);
  const maxDay = daysInMonth(month, year);
  const safeDay = Math.min(day, maxDay);

  const emit = (nextDay: number, nextMonth: number, nextYear: number) => {
    const clampedDay = Math.min(nextDay, daysInMonth(nextMonth, nextYear));
    const iso = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
    onChange(iso, ageFromDateOfBirth(iso));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i);

  const underage = value && !isAdultDob(value);

  return (
    <div className="dob-picker">
      <span className="dob-picker__label">Date of birth</span>
      <div className="dob-picker__row">
        <label>
          Day
          <select value={safeDay} onChange={(e) => emit(Number(e.target.value), month, year)}>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month
          <select value={month} onChange={(e) => emit(safeDay, Number(e.target.value), year)}>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select value={year} onChange={(e) => emit(safeDay, month, Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      {underage && (
        <p className="dob-picker__error" role="alert">
          You must be 18 or older to join BamSignal.
        </p>
      )}
      {value && isAdultDob(value) && (
        <p className="dob-picker__hint">Age {ageFromDateOfBirth(value)}</p>
      )}
    </div>
  );
}
