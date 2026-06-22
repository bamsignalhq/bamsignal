import type { CultureHighlight } from "../../types/careers";

type CultureCardProps = {
  highlight: CultureHighlight;
};

export function CultureCard({ highlight }: CultureCardProps) {
  return (
    <article className="careers-culture-card cc-reveal">
      <h3>{highlight.title}</h3>
      <p>{highlight.body}</p>
    </article>
  );
}
