type ConsultationBookingCardProps = {
  booking: boolean;
  selectedSlotId?: string | null;
  primaryLabel: string;
  onBook: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  error?: string;
  onRetry?: () => void;
};

export function ConsultationBookingCard({
  booking,
  selectedSlotId,
  primaryLabel,
  onBook,
  onSecondary,
  secondaryLabel = "Update application",
  error,
  onRetry
}: ConsultationBookingCardProps) {
  return (
    <section className="consultation-booking-card signal-concierge-glass sc-reveal">
      <header className="consultation-booking-card__head">
        <h3>Book consultation</h3>
        <p>Choose a slot above, then confirm your private consultation time.</p>
      </header>
      {error ? (
        <p className="consultation-booking-card__error" role="alert">
          {error}
          {onRetry ? (
            <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onRetry}>
              Try again
            </button>
          ) : null}
        </p>
      ) : null}
      <div className="signal-concierge-hero__actions">
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--primary"
          onClick={onBook}
          disabled={booking || !selectedSlotId}
        >
          {booking ? "Booking consultation…" : primaryLabel}
        </button>
        {onSecondary ? (
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
