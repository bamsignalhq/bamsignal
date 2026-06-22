import type { FutureGenerationCardViewModel } from "../../../types/centuryTrust";

type FutureGenerationCardProps = {
  futureGeneration: FutureGenerationCardViewModel;
};

export function FutureGenerationCard({ futureGeneration }: FutureGenerationCardProps) {
  return (
    <section className="ctrust-future-card institute-glass">
      <header className="ctrust-card__head">
        <h2>Future generations</h2>
        <p>{futureGeneration.narrative}</p>
      </header>
      <ul className="ctrust-future-card__list">
        {futureGeneration.futureModules.map((module) => (
          <li key={module.id}>
            <strong>{module.label}</strong>
            <span>{module.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
