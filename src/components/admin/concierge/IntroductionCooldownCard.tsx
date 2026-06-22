import { INTRODUCTION_COOLDOWN_TITLE, INTRODUCTION_PRIVACY_COPY } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { getIntroductionCooldownForMembers, getMemberDisplayName } from "../../../utils/IntroductionEngine";

type IntroductionCooldownCardProps = {
  record?: IntroductionRecord | null;
  memberAId?: string;
  memberBId?: string;
};

export function IntroductionCooldownCard({
  record,
  memberAId,
  memberBId
}: IntroductionCooldownCardProps) {
  const aId = record?.memberAId ?? memberAId;
  const bId = record?.memberBId ?? memberBId;
  if (!aId || !bId) return null;

  const cooldown = getIntroductionCooldownForMembers(aId, bId);

  return (
    <section className="introduction-cooldown concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{INTRODUCTION_COOLDOWN_TITLE}</h3>
        <p>Quality over quantity — maximum {cooldown.memberA.maxActive} active introductions per member.</p>
      </header>
      <div className="introduction-cooldown__grid">
        {[cooldown.memberA, cooldown.memberB].map((snapshot) => (
          <div
            key={snapshot.memberId}
            className={`introduction-cooldown__member${snapshot.blocked ? " introduction-cooldown__member--blocked" : ""}`}
          >
            <strong>{getMemberDisplayName(snapshot.memberId)}</strong>
            <span>
              {snapshot.activeCount} / {snapshot.maxActive} active
            </span>
            {snapshot.blocked ? (
              <em>Blocked until an introduction closes or relationship status changes.</em>
            ) : (
              <em>Eligible for a new thoughtful introduction.</em>
            )}
          </div>
        ))}
      </div>
      <p className="introduction-cooldown__privacy">{INTRODUCTION_PRIVACY_COPY}</p>
    </section>
  );
}
