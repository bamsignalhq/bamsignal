import { listHiringProcessSteps } from "../../utils/careersLogic";
import { HiringProcessCard } from "./HiringProcessCard";

export function CareersHiringProcessPage() {
  const steps = listHiringProcessSteps();

  return (
    <div className="careers-page">
      <header className="careers-page__head cc-reveal">
        <h1>Hiring process</h1>
        <p>Transparent stages from application to onboarding — respectful of your time and ours.</p>
      </header>
      <div className="careers-hiring-grid careers-hiring-grid--full">
        {steps.map((step) => (
          <HiringProcessCard key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
}
