import { listCultureHighlights } from "../../utils/careersLogic";
import { CultureCard } from "./CultureCard";

export function CareersCulturePage() {
  const highlights = listCultureHighlights();

  return (
    <div className="careers-page">
      <header className="careers-page__head cc-reveal">
        <h1>Culture</h1>
        <p>How we work as an institution — discretion, stewardship, and Nigeria-first craft.</p>
      </header>
      <div className="careers-culture-grid">
        {highlights.map((highlight) => (
          <CultureCard key={highlight.id} highlight={highlight} />
        ))}
      </div>
    </div>
  );
}
