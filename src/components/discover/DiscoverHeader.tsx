type DiscoverHeaderProps = {
  cityLabel: string;
};

export function DiscoverHeader({ cityLabel }: DiscoverHeaderProps) {
  return (
    <header className="discover-premium-head">
      <div className="discover-premium-head__titles">
        <h1>Discover</h1>
        <p>Thoughtful connections start here.</p>
      </div>
      <div className="discover-premium-head__city" aria-label={`Browsing ${cityLabel}`}>
        <span aria-hidden>📍</span>
        {cityLabel}
      </div>
    </header>
  );
}
