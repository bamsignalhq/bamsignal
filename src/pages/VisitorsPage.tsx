import { ArrowLeft, Crown, Eye, Zap } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
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
      <header className="visitors-page__head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <Eye size={24} aria-hidden />
          <h1>Profile Visitors</h1>
          <p>
            👀 {displayCount} profile view{displayCount === 1 ? "" : "s"} today
          </p>
        </div>
      </header>

      {!isPremium ? (
        <section className="visitors-page__locked card">
          <Crown size={28} aria-hidden />
          <h2>{displayCount} people viewed your profile</h2>
          <p>Upgrade to Signal Pass to see who&apos;s curious about you.</p>
          <button type="button" className="btn-primary btn-full" onClick={onUpgrade}>
            Unlock Profile Visitors
          </button>
        </section>
      ) : viewers.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No profile visitors yet"
          message="Complete your profile and start sending Signals."
          actionLabel="Complete profile"
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
                <span className="visitors-page__compat">{visitor.compatibility}% Compatibility</span>
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
