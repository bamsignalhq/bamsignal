import { APPLICATION_WIZARD_STEP_COUNT } from "./ApplicationSaveProgress";

type ApplicationProgressBarProps = {
  currentStep: number;
  stepTitle: string;
  totalSteps?: number;
};

export function ApplicationProgressBar({
  currentStep,
  stepTitle,
  totalSteps = APPLICATION_WIZARD_STEP_COUNT
}: ApplicationProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="sc-app-progress sc-reveal" aria-live="polite">
      <p className="sc-app-progress__label">
        Step {currentStep} of {totalSteps} · {stepTitle}
      </p>
      <div className="sc-app-progress__track" aria-hidden>
        <span className="sc-app-progress__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
