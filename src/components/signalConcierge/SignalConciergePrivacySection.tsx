export function SignalConciergePrivacySection() {
  return (
    <section className="signal-concierge-section" aria-labelledby="sc-privacy-title">
      <div className="signal-concierge-privacy signal-concierge-glass">
        <h2 id="sc-privacy-title" className="signal-concierge-section__title">
          Private by design
        </h2>
        <p className="signal-concierge-section__sub">
          Signal Concierge members exist outside the public BamSignal ecosystem. Your journey stays
          confidential.
        </p>
        <ul>
          <li>Never displayed on Discover</li>
          <li>Never included in Fast Connection</li>
          <li>Never shown in Search, Visitors, or Saved Profiles</li>
          <li>Introductions happen only with mutual consent</li>
        </ul>
      </div>
    </section>
  );
}
