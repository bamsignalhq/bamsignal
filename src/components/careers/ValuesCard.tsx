import type { ValueHighlight } from "../../types/careers";

type ValuesCardProps = {
  value: ValueHighlight;
};

export function ValuesCard({ value }: ValuesCardProps) {
  return (
    <article className="careers-values-card cc-reveal">
      <h3>{value.title}</h3>
      <p>{value.body}</p>
    </article>
  );
}
