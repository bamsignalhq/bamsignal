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
    { label: "Connections", value: connectionsStarted }
  ];

  return (
    <section className="dash-activity dash-activity--compact" aria-label="Activity summary">
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
