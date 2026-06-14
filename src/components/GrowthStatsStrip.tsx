import { getGrowthStats } from "../constants/growthStats";

type GrowthStatsStripProps = {
  variant?: "visual" | "info";
  eyebrow?: string;
};

export function GrowthStatsStrip({ variant = "visual", eyebrow = "We're growing" }: GrowthStatsStripProps) {
  const stats = getGrowthStats();
  const rowClass = variant === "info" ? " info-highlights--row" : "";
  const cellClass = variant === "info" ? " info-highlight--row" : "";

  return (
    <section className={variant === "visual" ? "visual-growth" : "info-growth"} aria-label="BamSignal community growth">
      {variant === "visual" && eyebrow ? <p className="visual-growth__eyebrow">{eyebrow}</p> : null}
      <div className={`info-highlights${rowClass}${variant === "visual" ? " visual-growth__grid" : ""}`}>
        {stats.map((item) => (
          <div key={item.label} className={`info-highlight${cellClass}${variant === "visual" ? " visual-growth__cell" : ""}`}>
            <span className="info-highlight__value">{item.value}</span>
            <span className="info-highlight__label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
