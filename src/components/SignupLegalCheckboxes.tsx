import { ExternalLink } from "lucide-react";

type SignupLegalCheckboxesProps = {
  accepted: boolean;
  onChange: (value: boolean) => void;
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

export function SignupLegalCheckboxes({ accepted, onChange }: SignupLegalCheckboxesProps) {
  return (
    <section className="signup-legal" aria-label="Legal agreement">
      <label className={`signup-legal__row${accepted ? " signup-legal__row--checked" : ""}`}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="signup-legal__copy">
          I agree to the <LegalLink href="/terms" label="Terms of Service" /> and{" "}
          <LegalLink href="/privacy" label="Privacy Policy" />, and confirm I am at least 18.
        </span>
      </label>
    </section>
  );
}

export function isSignupLegalComplete(accepted: boolean): boolean {
  return accepted;
}
