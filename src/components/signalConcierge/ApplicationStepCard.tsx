type ApplicationStepCardProps = {
  title: string;
  subtitle?: string;
  privacyNote?: string;
  children: React.ReactNode;
};

export function ApplicationStepCard({ title, subtitle, privacyNote, children }: ApplicationStepCardProps) {
  return (
    <section className="sc-app-step-card signal-concierge-glass sc-reveal" aria-labelledby="sc-app-step-title">
      <header className="sc-app-step-card__header">
        <h2 id="sc-app-step-title" className="sc-app-step-card__title">
          {title}
        </h2>
        {subtitle ? <p className="sc-app-step-card__subtitle">{subtitle}</p> : null}
        {privacyNote ? <p className="sc-app-step-card__privacy">{privacyNote}</p> : null}
      </header>
      <div className="sc-app-step-card__body">{children}</div>
    </section>
  );
}
