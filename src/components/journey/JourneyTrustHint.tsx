type JourneyTrustHintProps = {
  text: string;
};

export function JourneyTrustHint({ text }: JourneyTrustHintProps) {
  return <p className="journey-trust">{text}</p>;
}
