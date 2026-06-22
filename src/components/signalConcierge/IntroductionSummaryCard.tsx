import type { IntroductionSummary } from "../../types/memberDashboard";

type IntroductionSummaryCardProps = {
  introductions: IntroductionSummary;
};

export function IntroductionSummaryCard({ introductions }: IntroductionSummaryCardProps) {
  return (
    <section className="member-dashboard-card introduction-summary-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Introductions</h3>
        <p>Confidential — always with mutual consent.</p>
      </header>
      <p className="introduction-summary-card__count">
        {introductions.count} introduction{introductions.count === 1 ? "" : "s"}
      </p>
      {introductions.latestLabel ? (
        <p className="introduction-summary-card__latest">{introductions.latestLabel}</p>
      ) : null}
      <p className="introduction-summary-card__detail">{introductions.detail}</p>
    </section>
  );
}
