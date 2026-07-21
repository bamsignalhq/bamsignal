import { ArrowLeft, Crown, Eye, Zap } from "lucide-react";
import { MONETIZATION_COPY, SUCCESS_COPY, BUTTON_COPY } from "../constants/copy";
import { MemberEmptyState, MemberPageHead } from "../components/member";
import { ShowcaseImage } from "../components/ShowcaseImage";
import type { ProfileViewer } from "../utils/profileViews";

type VisitorsPageProps = {
  viewers: ProfileViewer[];
  viewsToday: number;
  isPremium: boolean;
  onBack: () => void;
  onUpgrade: () => void;
  onSendSignal: (profileId: string) => void;
  onCompleteProfile: () => void;
};

export function VisitorsPage({
  viewers,
  viewsToday,
  isPremium,
  onBack,
  onUpgrade,
  onSendSignal,
  onCompleteProfile
}: VisitorsPageProps) {
  const displayCount = viewsToday > 0 ? viewsToday : viewers.length;

  return (
    <div className="page visitors-page">
      <MemberPageHead
        className="visitors-page__head"
        title={SUCCESS_COPY.profileVisitorsTitle}
        subtitle={`${displayCount} profile view${displayCount === 1 ? "" : "s"} today`}
        onBack={onBack}
        backVariant="icon"
        backIcon={<ArrowLeft size={22} />}
      />

      {!isPremium ? (
        <section className="visitors-page__locked card">
          <Crown size={28} aria-hidden />
          <h2>{displayCount} people viewed your profile</h2>
          <p>{SUCCESS_COPY.profileVisitorsPaywallHint}</p>
          <button type="button" className="btn-primary btn-full" onClick={onUpgrade}>
            {MONETIZATION_COPY.seeEveryone}
          </button>
        </section>
      ) : viewers.length === 0 ? (
        <MemberEmptyState
          leading={<Eye size={28} strokeWidth={1.5} aria-hidden className="empty-state__icon" />}
          title={SUCCESS_COPY.emptyPremiumState}
          body="When someone views your profile, you'll see them here."
          actionLabel={BUTTON_COPY.explore}
          onAction={onCompleteProfile}
        />
      ) : (
        <ul className="visitors-page__list">
          {viewers.map((visitor) => (
            <li key={`${visitor.profileId}-${visitor.at}`} className="visitors-page__row card">
              <ShowcaseImage src={visitor.photo} alt="" className="visitors-page__photo" loading="lazy" />
              <div className="visitors-page__meta">
                <strong>
                  {visitor.name}, {visitor.age}
                </strong>
                <span>{visitor.city}</span>
                <span className="visitors-page__compat">{visitor.compatibility}% compatibility</span>
              </div>
              <button
                type="button"
                className="btn-secondary visitors-page__signal"
                onClick={() => onSendSignal(visitor.profileId)}
              >
                <Zap size={16} fill="currentColor" />
                Send Signal
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
