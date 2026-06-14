type SignalRippleProps = {
  active?: boolean;
  className?: string;
};

export function SignalRipple({ active = true, className = "" }: SignalRippleProps) {
  if (!active) return null;

  return (
    <div className={`signal-ripple ${className}`} aria-hidden>
      <span className="signal-ripple__ring signal-ripple__ring--1" />
      <span className="signal-ripple__ring signal-ripple__ring--2" />
    </div>
  );
}
