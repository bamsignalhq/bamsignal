import { useMemo } from "react";
import { CONSULTATION_REVIEW_ENGINE_BRAND } from "../../../constants/consultationReview";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ensureMemberConsultationReviewBundle } from "../../../utils/consultationReviewEngine";
import { ConsultationHistoryCard } from "./ConsultationHistoryCard";
import { ConsultationNotesCard } from "./ConsultationNotesCard";
import { ConsultationOutcomeCard } from "./ConsultationOutcomeCard";
import { ConsultationRecommendationCard } from "./ConsultationRecommendationCard";
import { ConsultationSummaryCard } from "./ConsultationSummaryCard";

type MemberConsultationReviewSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberConsultationReviewSection({ member }: MemberConsultationReviewSectionProps) {
  const bundle = useMemo(() => ensureMemberConsultationReviewBundle(member), [member]);
  const latest = bundle.reviews[0] ?? null;

  if (!latest && !bundle.summary) {
    return (
      <section className="member-consultation-review concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>Consultation review</h3>
          <p>{CONSULTATION_REVIEW_ENGINE_BRAND}</p>
        </header>
        <p className="concierge-consultant__empty">No completed consultation review yet.</p>
      </section>
    );
  }

  return (
    <section className="member-consultation-review">
      <header className="member-consultation-review__section-head cc-reveal">
        <h2>Consultation review</h2>
        <p>{CONSULTATION_REVIEW_ENGINE_BRAND} — structured notes, outcomes, and recommendations.</p>
      </header>

      {bundle.summary ? <ConsultationSummaryCard summary={bundle.summary} /> : null}

      <div className="member-consultation-review__cards">
        {latest ? (
          <>
            <ConsultationOutcomeCard
              outcome={latest.outcome}
              heldAt={latest.heldAt}
              consultantName={latest.consultantName}
            />
            <ConsultationNotesCard notes={latest.notes} />
            <ConsultationRecommendationCard recommendation={latest.recommendation} />
          </>
        ) : null}
        <ConsultationHistoryCard reviews={bundle.reviews} timeline={bundle.timeline} />
      </div>
    </section>
  );
}
