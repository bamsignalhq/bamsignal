import type { DashboardFeedItem } from "../../utils/dashboardFeed";

type DashboardActivityFeedProps = {
  items: DashboardFeedItem[];
};

export function DashboardActivityFeed({ items }: DashboardActivityFeedProps) {
  if (!items.length) return null;

  return (
    <section className="dash-feed dash-animate" aria-label="Recent activity">
      <h2 className="dash-feed__title">Activity</h2>
      <ul className="dash-feed__list">
        {items.slice(0, 5).map((item) => (
          <li key={item.id} className="dash-feed__item">
            <span className="dash-feed__mark" aria-hidden>
              ✓
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
