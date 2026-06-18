import { ExternalLink } from "lucide-react";

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
      <ExternalLink size={13} aria-hidden />
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
    <div className="signup-legal" role="group" aria-label="Legal agreements">
      <p className="signup-legal__intro">
        By continuing, you agree to BamSignal&apos;s legal terms and confirm you are at least 18.
      </p>

      <label className="signup-legal__row">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) => onTermsChange(event.target.checked)}
        />
        <span>
          I agree to BamSignal&apos;s <LegalLink href="/terms" label="Terms of Service" />
        </span>
      </label>

      <label className="signup-legal__row">
        <input
          type="checkbox"
          checked={privacyAccepted}
          onChange={(event) => onPrivacyChange(event.target.checked)}
        />
        <span>
          I agree to BamSignal&apos;s <LegalLink href="/privacy" label="Privacy Policy" />
        </span>
      </label>

      <label className="signup-legal__row">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(event) => onAgeChange(event.target.checked)}
        />
        <span>I confirm I am at least 18 years old</span>
      </label>
    </div>
  );
}

export function isSignupLegalComplete(
  termsAccepted: boolean,
  privacyAccepted: boolean,
  ageConfirmed: boolean
): boolean {
  return termsAccepted && privacyAccepted && ageConfirmed;
}
