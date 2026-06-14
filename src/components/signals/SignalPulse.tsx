import type { CSSProperties } from "react";

type SignalPulseProps = {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

export function SignalPulse({ size = 48, color = "var(--brand-pink)", className = "", style }: SignalPulseProps) {
  return (
    <span
      className={`signal-pulse ${className}`}
      style={{ width: size, height: size, color, ...style }}
      aria-hidden
    >
      <span className="signal-pulse__ring signal-pulse__ring--1" />
      <span className="signal-pulse__ring signal-pulse__ring--2" />
      <span className="signal-pulse__core" />
    </span>
  );
}
