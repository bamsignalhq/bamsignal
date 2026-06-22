import { useMemo } from "react";
import {
  CONCIERGE_MEMBER_FLAGS
} from "../../../constants/conciergeConsultant";
import {
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS,
  SIGNAL_CONCIERGE_STATUS_LABELS,
  SIGNAL_CONCIERGE_TIERS
} from "../../../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import type { ConciergeConsultantActivity } from "../../../types/conciergeConsultantDirectory";
import { ConsultantSummaryCard } from "./ConsultantSummaryCard";
import { CommunicationJournalCard } from "./CommunicationJournalCard";
import { FollowUpTasksCard } from "./FollowUpTasksCard";
import { IntroductionHistoryCard } from "./IntroductionHistoryCard";
import { JourneyContinuityTimeline } from "./JourneyContinuityTimeline";
import { JourneyOwnershipCard } from "./JourneyOwnershipCard";
import { MemberAssignmentSection } from "./MemberAssignmentSection";
import { MemberConsultationPaymentSection } from "./MemberConsultationPaymentSection";
import { MemberNotificationSection } from "./MemberNotificationSection";
import { MemberMeetingNotesSection } from "./MemberMeetingNotesSection";
import { JourneyTransitionCard } from "./JourneyTransitionCard";
import { TransitionSummaryCard } from "./TransitionSummaryCard";
import { listIntroductionsForMember } from "../../../utils/IntroductionEngine";
import { listMeetingsForMember } from "../../../utils/conciergeConsultantDirectoryStore";
import {
  buildJourneyContinuityEvents,
  buildJourneyTransitionSummary
} from "../../../utils/conciergeJourneyContinuity";
import { PrivateNotesCard } from "./PrivateNotesCard";
import { JourneyIdCard } from "../../signalConcierge/JourneyIdCard";
import { LegacyArchiveCard } from "./LegacyArchiveCard";
import { RelationshipStatusBadge } from "./RelationshipStatusBadge";
import { ConsentSummaryCard } from "../../signalConcierge/ConsentSummaryCard";
import { ConsentHistoryTimeline } from "../../signalConcierge/ConsentHistoryTimeline";
import { StoryCategoryCard } from "../../signalConcierge/StoryCategoryCard";
import { ensureJourneyStoryProfile } from "../../../utils/journeyStoryCategories";
import { AnniversaryTimelineCard } from "../../signalConcierge/AnniversaryTimelineCard";
import { ensureJourneyMilestoneTimeline } from "../../../utils/journeyMilestoneStore";
import { RelationshipLegacyIndexCard } from "../../signalConcierge/RelationshipLegacyIndexCard";
import { buildLegacyProfileForMember } from "../../../utils/relationshipLegacyIndexProfile";

type ConciergeMemberProfilePageProps = {
  member: ConciergeMemberRecord;
  consultants?: { id: string; name: string; status?: string }[];
  memberActivity?: ConciergeConsultantActivity[];
  onAddNote?: (body: string) => Promise<void>;
  onStatusChange?: (status: ConciergeMemberRecord["status"]) => void;
  onJourneyTransition?: (consultantId: string, reason: string) => void;
};

function Field({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="concierge-member-profile__field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function ConciergeMemberProfilePage({
  member,
  consultants = [],
  memberActivity = [],
  onAddNote,
  onStatusChange,
  onJourneyTransition
}: ConciergeMemberProfilePageProps) {
  const tier = SIGNAL_CONCIERGE_TIERS.find((item) => item.id === member.preferredTier);
  const channel = SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.find(
    (item) =>
      item.id === member.consultationPreferences?.preferredChannel || item.id === member.consultationPreference
  );

  const memberMeetings = useMemo(() => listMeetingsForMember(member.id), [member.id]);
  const continuitySummary = useMemo(
    () => buildJourneyTransitionSummary(member, memberMeetings),
    [member, memberMeetings]
  );
  const continuityEvents = useMemo(
    () =>
      buildJourneyContinuityEvents({
        transfers: member.stewardshipHistory ?? [],
        timeline: member.timeline,
        activity: memberActivity,
        meetings: memberMeetings
      }),
    [member.stewardshipHistory, member.timeline, memberActivity, memberMeetings]
  );

  return (
    <div className="concierge-member-profile">
      <header className="concierge-member-profile__head concierge-consultant-card--glass cc-reveal">
        <div>
          <h2>
            {member.aboutYou.name}
            {member.trustedMember ? <span className="concierge-member-profile__trusted">Trusted Member</span> : null}
          </h2>
          <p>
            {member.aboutYou.age} · {member.aboutYou.city} · {member.aboutYou.occupation}
          </p>
          <p className="concierge-member-profile__tier">
            {tier ? `${tier.name} · ${tier.tagline}` : "Tier pending"}
          </p>
          {member.journeyArchive ? (
            <RelationshipStatusBadge status={member.journeyArchive.relationshipStatus} />
          ) : null}
        </div>
        <div className="concierge-member-profile__status-wrap">
          <label>
            Journey status
            <select
              value={member.status}
              onChange={(event) =>
                onStatusChange?.(event.target.value as ConciergeMemberRecord["status"])
              }
            >
              {Object.entries(SIGNAL_CONCIERGE_STATUS_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {member.flags.length ? (
        <div className="concierge-member-profile__flags">
          {member.flags.map((flag) => {
            const label = CONCIERGE_MEMBER_FLAGS.find((item) => item.id === flag)?.label ?? flag;
            return (
              <span key={flag} className="concierge-member-profile__flag">
                {label}
              </span>
            );
          })}
        </div>
      ) : null}

      <section className="concierge-member-profile__grid">
        <div className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Application</h3>
          <div className="concierge-member-profile__fields">
            <Field label="Name" value={member.aboutYou.name} />
            <Field label="Age" value={member.aboutYou.age} />
            <Field label="Gender" value={member.aboutYou.gender} />
            <Field label="City" value={member.aboutYou.city} />
            <Field label="Occupation" value={member.aboutYou.occupation} />
            <Field label="Education" value={member.aboutYou.education} />
            <Field label="Religion" value={member.aboutYou.religion} />
            <Field label="Marital status" value={member.aboutYou.maritalStatus} />
            <Field label="Children" value={member.aboutYou.children} />
          </div>
        </div>

        <div className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Photos</h3>
          <div className="concierge-member-profile__media">
            {member.photos.length ? (
              <div className="concierge-member-profile__photos">
                {member.photos.map((photo) => (
                  <img key={photo} src={photo} alt="" loading="lazy" />
                ))}
              </div>
            ) : (
              <p className="concierge-consultant__empty">No photos uploaded yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="concierge-member-profile__grid">
        <div className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Voice Vibe</h3>
          <p>
            {member.voiceVibe.completed ? "Recorded privately" : "Not recorded"}
            {member.voiceVibe.duration ? ` · ${member.voiceVibe.duration}s` : ""}
          </p>
          <p className="concierge-member-profile__privacy">Never shown publicly. Consultants only.</p>
        </div>
        <div className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Video introduction</h3>
          <p>
            {member.videoIntro.completed ? "Recorded privately" : "Not recorded"}
            {member.videoIntro.duration ? ` · ${member.videoIntro.duration}s` : ""}
          </p>
          <p className="concierge-member-profile__privacy">Visible only to consultants.</p>
        </div>
        <div className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Identity verification</h3>
          <Field label="Government ID" value={member.identity.governmentIdNote} />
          <Field
            label="Selfie verification"
            value={member.identity.selfieVerified ? "Confirmed" : "Pending"}
          />
          <Field label="LinkedIn" value={member.identity.linkedIn} />
          <Field label="Instagram" value={member.identity.instagram} />
        </div>
      </section>

      <section className="concierge-member-profile__grid">
        <div className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Relationship goals</h3>
          <div className="concierge-member-profile__fields">
            <Field
              label="Hoping to find"
              value={member.relationshipGoals.whatHopingToFind || member.relationshipGoals.partnerPreferences}
            />
            <Field label="Marriage timeline" value={member.relationshipGoals.marriageTimeline} />
            <Field
              label="Children preference"
              value={member.relationshipGoals.childrenPreference || member.relationshipGoals.familyGoals}
            />
            <Field label="Partner age range" value={member.relationshipGoals.partnerAgeRange} />
            <Field label="Partner location" value={member.relationshipGoals.partnerLocation} />
            <Field label="Deal breakers" value={member.relationshipGoals.dealBreakers} />
          </div>
        </div>
        <div className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Values & lifestyle</h3>
          <div className="concierge-member-profile__fields">
            <Field label="Faith importance" value={member.valuesLifestyle.faithImportance} />
            <Field label="Smoking" value={member.valuesLifestyle.smoking} />
            <Field label="Drinking" value={member.valuesLifestyle.drinking} />
            <Field label="Fitness" value={member.valuesLifestyle.fitness} />
            <Field label="Travel" value={member.valuesLifestyle.travel} />
            <Field label="Love language" value={member.valuesLifestyle.loveLanguage} />
            <Field label="Three words" value={member.valuesLifestyle.threeWords} />
          </div>
        </div>
      </section>

      <section className="concierge-member-profile__story concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <h3>More about this member</h3>
        <Field label="What makes them unique" value={member.story.whatMakesYouUnique} />
        <Field label="What they hope to build" value={member.story.whatYouHopeToBuild} />
        <Field label="Ideal relationship" value={member.story.idealRelationship} />
        <Field label="What they value most" value={member.story.whatYouValueMost} />
      </section>

      <div className="concierge-member-profile__columns">
        {member.journeyId ? <JourneyIdCard journeyId={member.journeyId} /> : null}
        <LegacyArchiveCard member={member} />
        <JourneyOwnershipCard member={member} />
      </div>

      <MemberAssignmentSection member={member} />

      <MemberConsultationPaymentSection member={member} />

      <MemberNotificationSection member={member} />

      <MemberMeetingNotesSection member={member} />

      <div className="concierge-member-profile__columns">
        <JourneyTransitionCard
          member={member}
          consultants={consultants}
          onTransition={onJourneyTransition}
        />
      </div>

      <TransitionSummaryCard summary={continuitySummary} />

      <JourneyContinuityTimeline events={continuityEvents} />

      {(() => {
        const legacyProfile = buildLegacyProfileForMember(member);
        return legacyProfile ? <RelationshipLegacyIndexCard profile={legacyProfile} /> : null;
      })()}

      {member.journeyId ? (
        <AnniversaryTimelineCard
          timeline={
            member.journeyMilestoneTimeline ?? ensureJourneyMilestoneTimeline(member.journeyId)
          }
          recordedBy="BamSignal Admin"
        />
      ) : null}

      <ConsultantSummaryCard summary={member.consultantSummary} />

      <CommunicationJournalCard entries={member.communicationJournal} />

      {member.successStoryConsent ? (
        <>
          <ConsentSummaryCard consent={member.successStoryConsent} className="consent-summary-card--admin" />
          {member.journeyId ? (
            <StoryCategoryCard
              profile={
                member.successStoryConsent.storyProfile ??
                ensureJourneyStoryProfile(member.journeyId)
              }
              readOnly
            />
          ) : null}
          <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
            <header className="concierge-consultant-card__head">
              <h3>Success story consent history</h3>
              <p>Consent survives archive, consultant changes, and relocation.</p>
            </header>
            <ConsentHistoryTimeline history={member.successStoryConsent.history} />
          </section>
        </>
      ) : null}

      {(channel || member.consultationPreferences) && (
        <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
          <h3>Consultation preferences</h3>
          <div className="concierge-member-profile__fields">
            <Field label="Preferred communication" value={channel?.label} />
            <Field label="Preferred days" value={member.consultationPreferences?.preferredDays} />
            <Field label="Preferred time range" value={member.consultationPreferences?.preferredTimeRange} />
            <Field label="Additional notes" value={member.consultationPreferences?.additionalNotes} />
          </div>
        </section>
      )}

      <div className="concierge-member-profile__columns">
        <PrivateNotesCard notes={member.privateNotes} onAddNote={onAddNote} />
        <IntroductionHistoryCard
          introductions={member.introductions}
          engineRecords={listIntroductionsForMember(member.id)}
        />
      </div>

      <div className="concierge-member-profile__columns">
        <FollowUpTasksCard tasks={member.followUpTasks} />
      </div>
    </div>
  );
}
