type TrustedMemberConfettiProps = {
  active?: boolean;
};

const CONFETTI_PIECES = [
  { left: "8%", delay: "0s", color: "#d4af37" },
  { left: "18%", delay: "0.12s", color: "#a855f7" },
  { left: "28%", delay: "0.24s", color: "#f3e8ff" },
  { left: "38%", delay: "0.08s", color: "#d4af37" },
  { left: "48%", delay: "0.18s", color: "#7c3aed" },
  { left: "58%", delay: "0.28s", color: "#fbbf24" },
  { left: "68%", delay: "0.06s", color: "#c084fc" },
  { left: "78%", delay: "0.16s", color: "#d4af37" },
  { left: "88%", delay: "0.22s", color: "#a855f7" },
  { left: "94%", delay: "0.1s", color: "#f3e8ff" }
] as const;

export function TrustedMemberConfetti({ active = true }: TrustedMemberConfettiProps) {
  if (!active) return null;

  return (
    <div className="trusted-member-confetti" aria-hidden>
      {CONFETTI_PIECES.map((piece, index) => (
        <span
          key={`${piece.left}-${index}`}
          className="trusted-member-confetti__piece"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: piece.delay
          }}
        />
      ))}
    </div>
  );
}
