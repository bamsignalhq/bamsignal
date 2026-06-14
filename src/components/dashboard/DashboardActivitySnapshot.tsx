type DashboardActivitySnapshotProps = {
  profileViews: number;
  signalsReceived: number;
  signalsSent: number;
  streakCount: number;
};

export function DashboardActivitySnapshot({
  profileViews,
  signalsReceived,
  signalsSent,
  streakCount
}: DashboardActivitySnapshotProps) {
  const streakLabel =
    streakCount >= 7 ? "7 Day Streak" : streakCount >= 1 ? `${streakCount} Day Streak` : "Start Streak";

  return (
    <section className="dash-snapshot dash-animate" aria-label="Your activity">
      <div className="dash-snapshot__item">
        <span className="dash-snapshot__emoji" aria-hidden>
          👀
        </span>
        <strong>{profileViews}</strong>
        <span>Profile Views</span>
      </div>
      <div className="dash-snapshot__item">
        <span className="dash-snapshot__emoji" aria-hidden>
          ❤️
        </span>
        <strong>{signalsReceived}</strong>
        <span>Signals Received</span>
      </div>
      <div className="dash-snapshot__item">
        <span className="dash-snapshot__emoji" aria-hidden>
          📤
        </span>
        <strong>{signalsSent}</strong>
        <span>Signals Sent</span>
      </div>
      <div className="dash-snapshot__item">
        <span className="dash-snapshot__emoji" aria-hidden>
          🔥
        </span>
        <strong>{streakCount > 0 ? streakCount : "—"}</strong>
        <span>{streakLabel}</span>
      </div>
    </section>
  );
}
