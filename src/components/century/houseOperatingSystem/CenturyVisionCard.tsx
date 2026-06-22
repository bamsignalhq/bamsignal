import type { CenturyVisionCardViewModel } from "../../../types/houseOperatingSystem";

type CenturyVisionCardProps = {
  vision: CenturyVisionCardViewModel;
};

export function CenturyVisionCard({ vision }: CenturyVisionCardProps) {
  return (
    <section className="hos-vision-card institute-glass">
      <header className="hos-card__head">
        <h2>Century vision</h2>
        <p>{vision.narrative}</p>
      </header>
      <div className="hos-vision-card__copy">
        <div>
          <p className="hos-vision-card__label">Use</p>
          <ul>
            {vision.goodCopy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="hos-vision-card__label">Avoid</p>
          <ul className="hos-vision-card__forbidden">
            {vision.forbiddenCopy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
