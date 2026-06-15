import { useEffect, useState } from "react";
import { fetchCitySpotlightAnalytics, type CitySpotlightAnalytics } from "../../utils/citySpotlight";

export function AdminCitySpotlightPanel() {
  const [analytics, setAnalytics] = useState<CitySpotlightAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchCitySpotlightAnalytics(30).then((data) => {
      if (!cancelled) {
        setAnalytics(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stat = (label: string, value: string | number) => (
    <div key={label} className="card admin-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="admin-city-spotlight">
      <h3 className="admin-section-title">City Spotlight analytics</h3>
      {loading ? <p className="admin-empty">Loading spotlight metrics…</p> : null}
      {!loading && !analytics ? (
        <p className="admin-empty">Spotlight analytics unavailable — check database connection.</p>
      ) : null}
      {analytics ? (
        <>
          <section className="admin-stats-grid">
            {stat("Purchases (30d)", analytics.purchases)}
            {stat("Section views", analytics.views)}
            {stat("Card clicks", analytics.clicks)}
            {stat("Profile opens", analytics.profileOpens)}
            {stat("Signals from spotlight", analytics.signals)}
          </section>
          {analytics.byCity?.length ? (
            <section className="admin-city-table card">
              <h4>Views by city</h4>
              {analytics.byCity.map((row) => (
                <div key={row.city} className="admin-city-row">
                  <span>{row.city}</span>
                  <strong>{row.views}</strong>
                </div>
              ))}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
