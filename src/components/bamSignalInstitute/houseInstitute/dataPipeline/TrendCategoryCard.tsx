import type { HousePipelineTrendCategory } from "../../../../types/houseInstituteDataPipeline";

type TrendCategoryCardProps = {
  category: HousePipelineTrendCategory;
};

export function TrendCategoryCard({ category }: TrendCategoryCardProps) {
  return (
    <article className="hidp-trend-card institute-glass">
      <header className="hidp-trend-card__head">
        <h3>{category.title}</h3>
        <p>{category.description}</p>
      </header>
      {category.rows.length === 0 ? (
        <p className="hidp-card__empty">No trend rows yet.</p>
      ) : (
        <ul className="hidp-trend-card__list">
          {category.rows.map((row) => (
            <li key={row.id}>
              <div>
                <strong>{row.label}</strong>
                {row.hint ? <span>{row.hint}</span> : null}
              </div>
              <span className="hidp-trend-card__count">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
      <footer className="hidp-trend-card__footer">
        <span>Aggregate total</span>
        <strong>{category.totalCount}</strong>
      </footer>
    </article>
  );
}
