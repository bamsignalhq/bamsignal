import {
  SIGNAL_CONCIERGE_APPLICATION_REVIEW_TITLE,
  SIGNAL_CONCIERGE_APPLICATION_SUCCESS_BODY,
  SIGNAL_CONCIERGE_APPLICATION_SUCCESS_TITLE,
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS,
  SIGNAL_CONCIERGE_WIZARD_STEPS
} from "../../constants/signalConcierge";
import type { SignalConciergeApplicationDraft } from "../../types/signalConcierge";
import { normalizeApplicationDraft } from "./ApplicationSaveProgress";

type ReviewSection = {
  step: number;
  title: string;
  lines: string[];
};

function buildReviewSections(draft: SignalConciergeApplicationDraft): ReviewSection[] {
  const normalized = normalizeApplicationDraft(draft);
  const about = normalized.aboutYou!;
  const goals = normalized.relationshipGoals!;
  const values = normalized.valuesLifestyle!;
  const story = normalized.story!;
  const identity = normalized.identity!;
  const prefs = normalized.consultationPreferences!;
  const channelLabel =
    SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.find((item) => item.id === prefs.preferredChannel)?.label ??
    "Not selected";

  return [
    {
      step: 0,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[0].title,
      lines: [
        `Name: ${about.name || "—"}`,
        `Age: ${about.age || "—"}`,
        `Gender: ${about.gender || "—"}`,
        `City: ${about.city || "—"}`,
        `Occupation: ${about.occupation || "—"}`,
        `Education: ${about.education || "—"}`,
        `Religion: ${about.religion || "—"}`,
        `Marital status: ${about.maritalStatus || "—"}`,
        `Children: ${about.children || "—"}`
      ]
    },
    {
      step: 1,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[1].title,
      lines: [
        `Hoping to find: ${goals.whatHopingToFind || "—"}`,
        `Marriage timeline: ${goals.marriageTimeline || "—"}`,
        `Children preference: ${goals.childrenPreference || "—"}`,
        `Partner age range: ${goals.partnerAgeRange || "—"}`,
        `Partner location: ${goals.partnerLocation || "—"}`,
        `Deal breakers: ${goals.dealBreakers || "—"}`
      ]
    },
    {
      step: 2,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[2].title,
      lines: [
        `Faith importance: ${values.faithImportance || "—"}`,
        `Smoking: ${values.smoking || "—"}`,
        `Drinking: ${values.drinking || "—"}`,
        `Fitness: ${values.fitness || "—"}`,
        `Travel: ${values.travel || "—"}`,
        `Love language: ${values.loveLanguage || "—"}`,
        `Three words: ${values.threeWords || "—"}`
      ]
    },
    {
      step: 3,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[3].title,
      lines: [
        `What makes you unique: ${story.whatMakesYouUnique || "—"}`,
        `What you hope to build: ${story.whatYouHopeToBuild || "—"}`,
        `Ideal relationship: ${story.idealRelationship || "—"}`,
        `What you value most: ${story.whatYouValueMost || "—"}`
      ]
    },
    {
      step: 4,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[4].title,
      lines: [normalized.voiceVibe?.completed ? "Voice recording saved privately." : "Not recorded yet."]
    },
    {
      step: 5,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[5].title,
      lines: [normalized.videoIntro?.completed ? "Video introduction saved privately." : "Not recorded yet."]
    },
    {
      step: 6,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[6].title,
      lines: [
        `Government ID: ${identity.governmentIdNote || "—"}`,
        `Selfie verification: ${identity.selfieVerified ? "Confirmed" : "Pending"}`,
        `LinkedIn: ${identity.linkedIn || "—"}`,
        `Instagram: ${identity.instagram || "—"}`
      ]
    },
    {
      step: 7,
      title: SIGNAL_CONCIERGE_WIZARD_STEPS[7].title,
      lines: [
        `Preferred communication: ${channelLabel}`,
        `Preferred days: ${prefs.preferredDays || "—"}`,
        `Preferred time range: ${prefs.preferredTimeRange || "—"}`,
        `Additional notes: ${prefs.additionalNotes || "—"}`
      ]
    }
  ];
}

type ApplicationReviewPageProps = {
  draft: SignalConciergeApplicationDraft;
  onEditSection: (step: number) => void;
  onSubmit: () => void;
  message?: string;
};

export function ApplicationReviewPage({ draft, onEditSection, onSubmit, message }: ApplicationReviewPageProps) {
  const sections = buildReviewSections(draft);

  return (
    <section className="sc-app-review sc-reveal" aria-labelledby="sc-app-review-title">
      <header className="sc-app-review__header">
        <h1 id="sc-app-review-title" className="sc-app-review__title">
          {SIGNAL_CONCIERGE_APPLICATION_REVIEW_TITLE}
        </h1>
        <p className="sc-app-review__sub">Review your answers before submitting. You can edit any section.</p>
      </header>

      {message ? (
        <p className="sc-app-review__message" role="status">
          {message}
        </p>
      ) : null}

      <div className="sc-app-review__sections">
        {sections.map((section) => (
          <article key={section.step} className="sc-app-review__section signal-concierge-glass">
            <div className="sc-app-review__section-head">
              <h2 className="sc-app-review__section-title">{section.title}</h2>
              <button
                type="button"
                className="signal-concierge-btn signal-concierge-btn--ghost sc-app-review__edit"
                onClick={() => onEditSection(section.step)}
              >
                Edit
              </button>
            </div>
            <ul className="sc-app-review__lines">
              {section.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="sc-app-review__actions">
        <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onSubmit}>
          Submit application
        </button>
      </div>
    </section>
  );
}

type ApplicationSuccessPageProps = {
  onViewStatus?: () => void;
};

export function ApplicationSuccessPage({ onViewStatus }: ApplicationSuccessPageProps) {
  return (
    <section className="sc-app-success sc-reveal" aria-labelledby="sc-app-success-title">
      <div className="sc-app-success__glow" aria-hidden />
      <h1 id="sc-app-success-title" className="sc-app-success__title">
        {SIGNAL_CONCIERGE_APPLICATION_SUCCESS_TITLE}
      </h1>
      <p className="sc-app-success__body">{SIGNAL_CONCIERGE_APPLICATION_SUCCESS_BODY}</p>
      {onViewStatus ? (
        <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onViewStatus}>
          View application status
        </button>
      ) : null}
    </section>
  );
}
