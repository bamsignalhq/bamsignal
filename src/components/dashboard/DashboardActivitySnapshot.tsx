type DashboardActivitySnapshotProps = {
  profileViews: number;
  signalsReceived: number;
  connectionsStarted: number;
};

export function DashboardActivitySnapshot({
  profileViews,
  signalsReceived,
  connectionsStarted
}: DashboardActivitySnapshotProps) {
  const rows = [
    { label: "Profile views", value: profileViews },
    { label: "Signals received", value: signalsReceived },
    { label: "New connections", value: connectionsStarted }
  ].filter((row) => row.value > 0);

  if (!rows.length) return null;

  return (
    <section className="dash-activity card dash-animate" aria-label="Your activity">
      <h2 className="dash-activity__title">Your Activity</h2>
      <dl className="dash-activity__list">
        {rows.map((row) => (
          <div key={row.label} className="dash-activity__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
