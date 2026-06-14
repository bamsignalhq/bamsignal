import type { BamEffectVariant } from "../../constants/brand";

type BamEffectProps = {
  active: boolean;
  variant?: BamEffectVariant;
  showText?: boolean;
  className?: string;
};

const LABELS: Record<BamEffectVariant, string> = {
  send: "BAM",
  accepted: "BAM",
  premium: "BAM",
  verified: "BAM"
};

export function BamEffect({
  active,
  variant = "send",
  showText = true,
  className = ""
}: BamEffectProps) {
  if (!active) return null;

  return (
    <div className={`bam-effect bam-effect--${variant} ${className}`} aria-hidden>
      <div className="bam-effect-glow" />
      <div className="bam-effect-burst" />
      <div className="bam-effect-wave bam-effect-wave--1" />
      <div className="bam-effect-wave bam-effect-wave--2" />
      <div className="bam-effect-wave bam-effect-wave--3" />
      {showText && <span className="bam-effect-text">{LABELS[variant]}</span>}
    </div>
  );
}
