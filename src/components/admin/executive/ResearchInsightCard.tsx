import type { ResearchInsightSnapshot } from "../../../types/executiveDashboard";

type ResearchInsightCardProps = {
  snapshot: ResearchInsightSnapshot;
};

export function ResearchInsightCard({ snapshot }: ResearchInsightCardProps) {
  return (
    <section className="research-insight-card concierge-consultant-card--glass cc-reveal">
      <header className="research-insight-card__head">
        <h3>Research</h3>
        <p>Institutional research signal — strategic, not operational.</p>
      </header>

      <h4>{snapshot.title}</h4>
      <p>{snapshot.summary}</p>
      <p className="research-insight-card__ref">Ref: {snapshot.reportRef}</p>
    </section>
  );
}
