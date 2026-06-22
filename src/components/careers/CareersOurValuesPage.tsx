import { listValuesHighlights } from "../../utils/careersLogic";
import { ValuesCard } from "./ValuesCard";

export function CareersOurValuesPage() {
  const values = listValuesHighlights();

  return (
    <div className="careers-page">
      <header className="careers-page__head cc-reveal">
        <h1>Our values</h1>
        <p>Values we hire for and hold each other accountable to every day.</p>
      </header>
      <div className="careers-values-grid">
        {values.map((value) => (
          <ValuesCard key={value.id} value={value} />
        ))}
      </div>
    </div>
  );
}
