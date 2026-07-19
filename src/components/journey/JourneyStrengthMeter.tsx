type JourneyStrengthMeterProps = {
  fill: number;
  label: string;
  hint: string;
};

export function JourneyStrengthMeter({ fill, label, hint }: JourneyStrengthMeterProps) {
  const clamped = Math.max(0, Math.min(100, fill));
  const ariaLabel = hint ? `${label}. ${hint}` : label;
  return (
    <div className="journey-strength" aria-label={ariaLabel}>
      <div className="journey-strength__labels">
        <span className="journey-strength__title">{label}</span>
        {hint ? <span className="journey-strength__hint">{hint}</span> : null}
      </div>
      <div className="journey-strength__track" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div className="journey-strength__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
