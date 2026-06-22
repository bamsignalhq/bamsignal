import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SUCCESS_STORY_CELEBRATE,
  SUCCESS_STORY_CONSENT_SUBCOPY,
  SUCCESS_STORY_CONSENT_TITLE,
  SUCCESS_STORY_TELL_YOUR_STORY
} from "../../constants/conciergeSuccessStoryConsent";
import type { SuccessStoryConsentRecord, SuccessStoryConsentPermissions } from "../../types/conciergeSuccessStoryConsent";
import type { JourneyStoryProfile } from "../../types/JourneyStoryType";
import {
  approveSuccessStoryConsentParty,
  ensureSuccessStoryConsent,
  saveSuccessStoryConsentPermissions,
  withdrawSuccessStoryConsentByJourney
} from "../../utils/conciergeSuccessStoryConsentStore";
import { readSignalConciergeApplication } from "../../utils/signalConciergeStorage";
import { getConciergeMember } from "../../utils/conciergeConsultantStore";
import { ConsentHistoryTimeline } from "./ConsentHistoryTimeline";
import { ConsentSummaryCard } from "./ConsentSummaryCard";
import { SuccessStoryConsentCard } from "./SuccessStoryConsentCard";
import { StoryCategoryCard } from "./StoryCategoryCard";
import { assignStoryCategory, ensureJourneyStoryProfile } from "../../utils/journeyStoryCategories";
import type { JourneyStoryCategoryId } from "../../constants/journeyStoryCategories";
import { AnniversaryTimelineCard } from "./AnniversaryTimelineCard";
import { ensureJourneyMilestoneTimeline } from "../../utils/journeyMilestoneStore";
import { RelationshipLegacyIndexCard } from "./RelationshipLegacyIndexCard";
import { buildLegacyProfileForMember } from "../../utils/relationshipLegacyIndexProfile";
import type { JourneyMilestoneTimeline } from "../../types/journeyMilestone";
import type { ConciergeMemberRecord } from "../../types/conciergeConsultant";

type SuccessStoryConsentPageProps = {
  /** Admin read-only mode */
  readOnly?: boolean;
  /** Admin: view consent for a specific journey */
  journeyId?: string;
  memberId?: string;
};

export function SuccessStoryConsentPage({
  readOnly = false,
  journeyId: journeyIdProp,
  memberId: memberIdProp
}: SuccessStoryConsentPageProps) {
  const [consent, setConsent] = useState<SuccessStoryConsentRecord | null>(null);
  const [storyProfile, setStoryProfile] = useState<JourneyStoryProfile | null>(null);
  const [milestoneTimeline, setMilestoneTimeline] = useState<JourneyMilestoneTimeline | null>(null);
  const [member, setMember] = useState<ConciergeMemberRecord | null>(null);
  const [memberId, setMemberId] = useState(memberIdProp ?? "");
  const [memberName, setMemberName] = useState("");

  const load = useCallback(() => {
    const application = readSignalConciergeApplication();
    const resolvedMemberId = memberIdProp ?? application?.id ?? "";
    const member = getConciergeMember(resolvedMemberId);
    const journeyId = journeyIdProp ?? member?.journeyId ?? application?.journeyId;
    if (!journeyId || !member) {
      setConsent(null);
      setMember(null);
      return;
    }

    const introduction = member.introductions[0];
    const partnerName = introduction?.introducedWithName ?? "Partner";
    const partnerId = introduction?.introducedWithId ?? `partner_${journeyId}`;

    const record = ensureSuccessStoryConsent({
      journeyId,
      memberAId: member.id,
      memberBId: partnerId,
      memberAName: member.aboutYou.name,
      memberBName: partnerName
    });
    setConsent(record);
    setStoryProfile(ensureJourneyStoryProfile(journeyId));
    setMilestoneTimeline(ensureJourneyMilestoneTimeline(journeyId));
    setMember(member);
    setMemberId(member.id);
    setMemberName(member.aboutYou.name);
  }, [journeyIdProp, memberIdProp]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = (permissions: Partial<SuccessStoryConsentPermissions>) => {
    if (!consent || readOnly) return;
    const next = saveSuccessStoryConsentPermissions(consent.journeyId, permissions, memberName);
    if (next) setConsent(next);
  };

  const handleApprove = () => {
    if (!consent || readOnly) return;
    const next = approveSuccessStoryConsentParty(consent.journeyId, {
      memberId,
      memberName
    });
    if (next) setConsent(next);
  };

  const handleWithdraw = () => {
    if (!consent || readOnly) return;
    const next = withdrawSuccessStoryConsentByJourney(consent.journeyId, {
      memberId,
      approvedBy: memberName
    });
    if (next) setConsent(next);
  };

  const handleToggleCategory = (categoryId: JourneyStoryCategoryId) => {
    if (!consent || readOnly) return;
    const next = assignStoryCategory(consent.journeyId, {
      categoryId,
      assignedBy: memberName
    });
    setStoryProfile(next);
  };

  const legacyProfile = useMemo(
    () => (member ? buildLegacyProfileForMember(member) : null),
    [member]
  );

  if (!consent) {
    return (
      <section className="success-story-consent-page signal-concierge-glass">
        <h1 className="signal-concierge-section__title">{SUCCESS_STORY_CONSENT_TITLE}</h1>
        <p className="signal-concierge-section__sub">
          Your relationship journey consent will appear here once your consultant links your couple record.
        </p>
      </section>
    );
  }

  return (
    <div className="success-story-consent-page">
      <header className="success-story-consent-page__head signal-concierge-glass">
        <p className="success-story-consent-page__kicker">{SUCCESS_STORY_TELL_YOUR_STORY}</p>
        <h1 className="signal-concierge-section__title">{SUCCESS_STORY_CONSENT_TITLE}</h1>
        <p className="signal-concierge-section__sub">{SUCCESS_STORY_CONSENT_SUBCOPY}</p>
        <p className="success-story-consent-page__celebrate">{SUCCESS_STORY_CELEBRATE}</p>
        <p className="success-story-consent-page__journey-id">Journey ID · {consent.journeyId}</p>
      </header>

      <ConsentSummaryCard consent={consent} />

      {storyProfile ? (
        <StoryCategoryCard
          profile={storyProfile}
          readOnly={readOnly}
          onToggleCategory={handleToggleCategory}
        />
      ) : null}

      {milestoneTimeline ? (
        <AnniversaryTimelineCard timeline={milestoneTimeline} readOnly celebrate />
      ) : null}

      {legacyProfile ? <RelationshipLegacyIndexCard profile={legacyProfile} celebrate /> : null}

      <SuccessStoryConsentCard
        consent={consent}
        currentMemberId={memberId}
        currentMemberName={memberName}
        readOnly={readOnly}
        onSavePermissions={handleSave}
        onApprove={handleApprove}
        onWithdraw={handleWithdraw}
      />

      <section className="success-story-consent-page__history signal-concierge-glass">
        <h2 className="signal-concierge-section__title">Consent history</h2>
        <ConsentHistoryTimeline history={consent.history} />
      </section>
    </div>
  );
}
