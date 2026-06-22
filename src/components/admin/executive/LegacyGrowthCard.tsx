import type { LegacyGrowthSnapshot } from "../../../types/executiveDashboard";

type LegacyGrowthCardProps = {
  snapshot: LegacyGrowthSnapshot;
};

export function LegacyGrowthCard({ snapshot }: LegacyGrowthCardProps) {
  return (
    <section className="legacy-growth-card concierge-consultant-card--glass cc-reveal">
      <header className="legacy-growth-card__head">
        <h3>Legacy</h3>
        <p>Journey outcomes that compound institutional trust.</p>
      </header>

      <div className="legacy-growth-card__metrics">
        <article>
          <p>Legacy families</p>
          <strong>{snapshot.legacyFamilies.toLocaleString("en-NG")}</strong>
        </article>
        <article>
          <p>Success stories</p>
          <strong>{snapshot.successStories.toLocaleString("en-NG")}</strong>
        </article>
        <article>
          <p>Marriages</p>
          <strong>{snapshot.marriages.toLocaleString("en-NG")}</strong>
        </article>
      </div>

      <p className="legacy-growth-card__trend">Trend: {snapshot.trend}</p>
    </section>
  );
}
