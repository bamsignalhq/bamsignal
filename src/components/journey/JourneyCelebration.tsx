export function JourneyCelebration({ message }: { message: string }) {
  return (
    <p className="journey-celebration" role="status">
      {message}
    </p>
  );
}
