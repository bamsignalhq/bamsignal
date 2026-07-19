type JourneyGuideProps = {
  text: string;
};

export function JourneyGuide({ text }: JourneyGuideProps) {
  return (
    <p className="journey-guide" role="status">
      {text}
    </p>
  );
}
