import { ExternalLink, ShieldCheck } from "lucide-react";

type SignupLegalCheckboxesProps = {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  ageConfirmed: boolean;
  onTermsChange: (value: boolean) => void;
  onPrivacyChange: (value: boolean) => void;
  onAgeChange: (value: boolean) => void;
};

function LegalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="signup-legal__link"
      onClick={(event) => event.stopPropagation()}
    >
      {label}
      <ExternalLink size={12} aria-hidden />
    </a>
  );
}

export function SignupLegalCheckboxes({
  termsAccepted,
  privacyAccepted,
  ageConfirmed,
  onTermsChange,
  onPrivacyChange,
  onAgeChange
}: SignupLegalCheckboxesProps) {
  return (
    <section className="signup-legal" aria-label="Legal agreements">
      <header className="signup-legal__head">
        <span className="signup-legal__icon" aria-hidden>
          <ShieldCheck size={16} strokeWidth={2} />
        </span>
        <div>
          <p className="signup-legal__title">Before you continue</p>
          <p className="signup-legal__intro">
            Confirm the items below to create your account. You must be 18 or older.
          </p>
        </div>
      </header>

      <div className="signup-legal__list">
        <label className={`signup-legal__row${termsAccepted ? " signup-legal__row--checked" : ""}`}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => onTermsChange(event.target.checked)}
          />
          <span className="signup-legal__copy">
            I agree to the <LegalLink href="/terms" label="Terms of Service" />
          </span>
        </label>

        <label className={`signup-legal__row${privacyAccepted ? " signup-legal__row--checked" : ""}`}>
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(event) => onPrivacyChange(event.target.checked)}
          />
          <span className="signup-legal__copy">
            I agree to the <LegalLink href="/privacy" label="Privacy Policy" />
          </span>
        </label>

        <label className={`signup-legal__row${ageConfirmed ? " signup-legal__row--checked" : ""}`}>
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(event) => onAgeChange(event.target.checked)}
          />
          <span className="signup-legal__copy">I confirm I am at least 18 years old</span>
        </label>
      </div>
    </section>
  );
}

export function isSignupLegalComplete(
  termsAccepted: boolean,
  privacyAccepted: boolean,
  ageConfirmed: boolean
): boolean {
  return termsAccepted && privacyAccepted && ageConfirmed;
}
