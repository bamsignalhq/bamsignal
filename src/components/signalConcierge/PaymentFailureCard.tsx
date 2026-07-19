import { CommercialOutcomeCard } from "../commercial/CommercialOutcomeCard";

type PaymentFailureCardProps = {
  message?: string;
  onRetry?: () => void;
};

export function PaymentFailureCard({
  message = "We couldn't confirm your consultation fee. You can try again when you're ready.",
  onRetry
}: PaymentFailureCardProps) {
  return (
    <div className="sc-reveal">
      <CommercialOutcomeCard tone="failure" body={message} onRetry={onRetry} />
    </div>
  );
}
