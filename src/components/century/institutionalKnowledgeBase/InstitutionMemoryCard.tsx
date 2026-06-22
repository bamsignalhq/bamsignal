import type { InstitutionMemoryCardViewModel } from "../../../types/institutionalKnowledgeBase";

type InstitutionMemoryCardProps = {
  memory: InstitutionMemoryCardViewModel;
};

export function InstitutionMemoryCard({ memory }: InstitutionMemoryCardProps) {
  return (
    <section className="ikb-memory-card institute-glass">
      <header className="ikb-card__head">
        <h2>Institution memory</h2>
        <p>{memory.narrative}</p>
      </header>
      <ul className="ikb-memory-card__purposes">
        {memory.purposes.map((purpose) => (
          <li key={purpose}>{purpose}</li>
        ))}
      </ul>
    </section>
  );
}
