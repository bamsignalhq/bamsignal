import type { HiringProcessStep } from "../../types/careers";

type HiringProcessCardProps = {
  step: HiringProcessStep;
};

export function HiringProcessCard({ step }: HiringProcessCardProps) {
  return (
    <article className="careers-hiring-card cc-reveal">
      <span className="careers-hiring-card__step">Step {step.order}</span>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
    </article>
  );
}
