import type { HousePipelineObservatoryFeedItem } from "../../../../types/houseInstituteDataPipeline";

type ObservatoryFeedCardProps = {
  feed: HousePipelineObservatoryFeedItem[];
  title?: string;
  description?: string;
};

export function ObservatoryFeedCard({
  feed,
  title = "Observatory feed",
  description = "Anonymous aggregate signals for Relationship Observatory research."
}: ObservatoryFeedCardProps) {
  return (
    <section className="hidp-feed-card institute-glass">
      <header className="hidp-card__head">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {feed.length === 0 ? (
        <p className="hidp-card__empty">Observatory feed awaits aggregate journey outcomes.</p>
      ) : (
        <ul className="hidp-feed-card__list">
          {feed.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.headline}</strong>
                <p>{item.summary}</p>
              </div>
              <div className="hidp-feed-card__meta">
                {typeof item.count === "number" ? <span>{item.count}</span> : null}
                <time dateTime={item.observedAt}>
                  {new Date(item.observedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
