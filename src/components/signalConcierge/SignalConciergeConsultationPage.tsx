import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT,
  SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL,
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_PAYMENT_NOTE,
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS
} from "../../constants/signalConcierge";
import { CONSULTATION_PAYMENT_MEMBERSHIP_NOTE } from "../../constants/consultationPayment";
import type { SignalConciergeConsultationChannel } from "../../constants/signalConcierge";
import type { CalendarAvailability, ConsultationEvent } from "../../types/calendar";
import type { MeetingLinkRecord } from "../../types/meetingLink";
import {
  bookConsultationCalendarSlot,
  fetchConsultantAvailability,
  getAuthenticatedMemberEmail,
  resolveBookingConsultant
} from "../../services/calendar";
import {
  consultationPaymentCallbackActive,
  deriveConsultationPaymentPhase,
  getConsultationPaymentState,
  startConsultationPaymentCheckout,
  verifyConsultationPayment,
  type ConsultationPaymentPhase
} from "../../services/consultationPayments";
import { getUpcomingConsultationEventForMember } from "../../utils/CalendarEngine";
import { getMeetingLinkForMember } from "../../utils/MeetingLinkEngine";
import { markMeetingInfrastructureInvitesSent } from "../../services/meetingInfrastructure";
import {
  mergeSignalConciergeDraft,
  readSignalConciergeApplication,
  readSignalConciergeDraft,
  submitSignalConciergeApplication
} from "../../utils/signalConciergeStorage";
import { sendConsultationScheduledEmail } from "../../services/conciergeEmail";
import {
  getAuthenticatedMemberPhone,
  sendConsultationReminderWhatsapp
} from "../../services/conciergeWhatsapp";
import { AvailabilityCard } from "./AvailabilityCard";
import { CalendarCard } from "./CalendarCard";
import { ConsultationBookingCard } from "./ConsultationBookingCard";
import { ConsultationTimelineCard } from "./ConsultationTimelineCard";
import { PaymentFailureCard } from "./PaymentFailureCard";
import { PaymentPendingCard } from "./PaymentPendingCard";
import { PaymentSuccessCard } from "./PaymentSuccessCard";
import { UpcomingConsultationCard } from "./UpcomingConsultationCard";
import { MeetingLinkCard } from "./MeetingLinkCard";
import { MeetingAccessCard } from "./MeetingAccessCard";
import { MeetingTimelineCard } from "./MeetingTimelineCard";

type SignalConciergeConsultationPageProps = {
  onScheduled: () => void;
  onApply: () => void;
};

export function SignalConciergeConsultationPage({
  onScheduled,
  onApply
}: SignalConciergeConsultationPageProps) {
  const draft = readSignalConciergeDraft();
  const application = readSignalConciergeApplication();
  const [selected, setSelected] = useState<SignalConciergeConsultationChannel>(
    () =>
      draft.consultationPreference ??
      application?.consultationPreference ??
      "whatsapp"
  );
  const [phase, setPhase] = useState<ConsultationPaymentPhase>("idle");
  const [paymentError, setPaymentError] = useState("");
  const [paying, setPaying] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookedEvent, setBookedEvent] = useState<ConsultationEvent | null>(null);
  const [meetingLink, setMeetingLink] = useState<MeetingLinkRecord | null>(null);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [tick, setTick] = useState(0);

  const consultant = useMemo(() => resolveBookingConsultant(), []);
  const paymentState = useMemo(() => {
    if (!application) return null;
    return getConsultationPaymentState(application);
  }, [application, tick]);

  const resolvedPhase = useMemo(() => {
    if (!application) return "idle" as ConsultationPaymentPhase;
    if (phase === "verifying" || phase === "failed") {
      return deriveConsultationPaymentPhase(application, phase === "verifying" ? "verifying" : "failed");
    }
    return deriveConsultationPaymentPhase(application);
  }, [application, phase]);

  const consultationEligible = Boolean(paymentState?.summary.consultationEligible);
  const upcomingEvent = useMemo(() => {
    if (!application) return bookedEvent;
    return bookedEvent ?? getUpcomingConsultationEventForMember(application.id);
  }, [application, bookedEvent, tick]);

  const activeMeetingLink = useMemo(() => {
    if (!application) return meetingLink;
    return meetingLink ?? getMeetingLinkForMember(application.id);
  }, [application, meetingLink, tick]);

  const refreshPayment = useCallback(() => setTick((value) => value + 1), []);

  const [availability, setAvailability] = useState<CalendarAvailability | null>(null);

  useEffect(() => {
    if (!application || !consultationEligible || !consultant) return;
    let cancelled = false;

    const load = async () => {
      const result = await fetchConsultantAvailability(consultant.id, consultant.name);
      if (cancelled) return;
      setAvailability(result.availability);
      setAvailabilityReady(true);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [application, consultationEligible, consultant]);

  useEffect(() => {
    if (!application || !consultationPaymentCallbackActive()) return;
    let cancelled = false;

    const run = async () => {
      setPhase("verifying");
      const result = await verifyConsultationPayment(application);
      if (cancelled) return;
      if (result.ok) {
        setPhase("paid");
        setPaymentError("");
        refreshPayment();
        return;
      }
      if (result.phase === "pending") {
        setPhase("pending");
        return;
      }
      setPhase("failed");
      setPaymentError(result.error || "");
      refreshPayment();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [application, refreshPayment]);

  const payConsultation = async () => {
    if (!application || paying) return;
    setPaying(true);
    setPaymentError("");
    setPhase("preparing");
    const result = await startConsultationPaymentCheckout(application);
    setPaying(false);
    refreshPayment();

    if (result.ok) {
      setPhase(result.phase || "paid");
      return;
    }

    if (result.cancelled || result.redirected) {
      setPhase("pending");
      return;
    }

    setPhase(result.phase || "failed");
    setPaymentError(result.error || "");
  };

  const schedule = async () => {
    if (!application || !consultationEligible || !consultant || !availability || !selectedSlotId || booking) return;
    const slot = availability.slots.find((item) => item.id === selectedSlotId);
    if (!slot?.available) {
      setBookingError("Please choose an available consultation slot.");
      return;
    }

    setBooking(true);
    setBookingError("");
    const memberEmail = await getAuthenticatedMemberEmail();
    const result = await bookConsultationCalendarSlot({
      application,
      memberEmail,
      consultantId: consultant.id,
      consultantName: consultant.name,
      consultantEmail: consultant.email,
      slot,
      journeyId: application.journeyId
    });
    setBooking(false);

    if (!result.ok || !result.event) {
      setBookingError(result.error || "Unable to book consultation.");
      return;
    }

    setBookedEvent(result.event);
    if (result.meetingLink) setMeetingLink(result.meetingLink);
    const next = mergeSignalConciergeDraft({
      consultationPreference: selected,
      status: "consultation-scheduled",
      consultationScheduledAt: result.event.scheduledAt
    });
    submitSignalConciergeApplication({
      ...next,
      status: "consultation-scheduled",
      consultationScheduledAt: result.event.scheduledAt
    });
    void sendConsultationScheduledEmail({
      application,
      event: result.event,
      memberEmail,
      consultantName: consultant.name,
      meetingLink: result.meetingLink
    }).then(() => {
      if (result.event?.meetingId) {
        markMeetingInfrastructureInvitesSent(result.event.meetingId);
      }
    });
    void getAuthenticatedMemberPhone().then((memberPhone) =>
      sendConsultationReminderWhatsapp({
        application,
        event: result.event!,
        memberPhone,
        consultantName: consultant.name
      })
    );
    refreshPayment();
    onScheduled();
  };

  if (!application || !paymentState) {
    return (
      <section className="signal-concierge-consultation signal-concierge-glass">
        <h1 className="signal-concierge-section__title">Schedule Consultation</h1>
        <p className="signal-concierge-section__sub">Begin your application before scheduling a consultation.</p>
        <div className="signal-concierge-hero__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onApply}>
            Complete application first
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="signal-concierge-consultation signal-concierge-glass">
      <h1 className="signal-concierge-section__title">Schedule Consultation</h1>
      <p className="signal-concierge-section__sub">
        A confidential conversation with our team to understand your goals and determine fit.
      </p>
      <p className="signal-concierge-modal__fee">
        {SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL} {SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT}
      </p>
      <p className="signal-concierge-section__sub">{SIGNAL_CONCIERGE_PAYMENT_NOTE}</p>
      <p className="consultation-payment-status-card__note">{CONSULTATION_PAYMENT_MEMBERSHIP_NOTE}</p>

      {resolvedPhase === "paid" ? <PaymentSuccessCard summary={paymentState.summary} /> : null}
      {resolvedPhase === "pending" || resolvedPhase === "verifying" ? <PaymentPendingCard /> : null}
      {resolvedPhase === "failed" ? (
        <PaymentFailureCard message={paymentError} onRetry={() => void payConsultation()} />
      ) : null}

      {!consultationEligible ? (
        <div className="signal-concierge-hero__actions consultation-payment-actions">
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--primary"
            onClick={() => void payConsultation()}
            disabled={paying || resolvedPhase === "verifying"}
          >
            {paying || resolvedPhase === "preparing" ? "Opening checkout…" : "Pay consultation fee"}
          </button>
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onApply}>
            Complete application first
          </button>
        </div>
      ) : (
        <>
          <UpcomingConsultationCard event={upcomingEvent} meetingLink={activeMeetingLink} />
          {activeMeetingLink ? (
            <>
              <MeetingLinkCard record={activeMeetingLink} />
              <MeetingAccessCard record={activeMeetingLink} />
              <MeetingTimelineCard timeline={activeMeetingLink.timeline} />
            </>
          ) : null}
          {upcomingEvent ? <ConsultationTimelineCard timeline={upcomingEvent.timeline} /> : null}

          <div className="signal-concierge-channel-grid">
            {SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.filter((channel) => channel.id !== "whatsapp").map((channel) => {
              const active = selected === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  className={`signal-concierge-channel${active ? " signal-concierge-channel--selected" : ""}`}
                  onClick={() => {
                    setSelected(channel.id);
                    mergeSignalConciergeDraft({ consultationPreference: channel.id });
                  }}
                >
                  <span>{channel.label}</span>
                  {active ? <span aria-hidden>✓</span> : null}
                </button>
              );
            })}
          </div>

          {availability && availabilityReady ? (
            <>
              <AvailabilityCard availability={availability} />
              <CalendarCard
                availability={availability}
                selectedSlotId={selectedSlotId}
                onSelectSlot={setSelectedSlotId}
              />
            </>
          ) : (
            <p className="signal-concierge-section__sub">Loading consultant availability…</p>
          )}


          {!upcomingEvent ? (
            <ConsultationBookingCard
              booking={booking}
              selectedSlotId={selectedSlotId}
              primaryLabel={SIGNAL_CONCIERGE_CTA_PRIMARY}
              onBook={() => void schedule()}
              onSecondary={onApply}
              error={bookingError || undefined}
              onRetry={() => void schedule()}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
