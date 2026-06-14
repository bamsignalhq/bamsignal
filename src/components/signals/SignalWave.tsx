type SignalWaveProps = {
  active?: boolean;
  count?: number;
  className?: string;
};

export function SignalWave({ active = true, count = 3, className = "" }: SignalWaveProps) {
  if (!active) return null;

  return (
    <div className={`signal-wave ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="signal-wave__ring" style={{ animationDelay: `${i * 0.14}s` }} />
      ))}
    </div>
  );
}
