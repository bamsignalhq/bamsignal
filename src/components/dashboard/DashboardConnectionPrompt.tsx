import { Compass, UserRound } from "lucide-react";

type DashboardConnectionPromptProps = {
  profileStrength: number;
  onDiscover: () => void;
  onCompleteProfile: () => void;
};

export function DashboardConnectionPrompt({
  profileStrength,
  onDiscover,
  onCompleteProfile
}: DashboardConnectionPromptProps) {
  if (profileStrength >= 100) {
    return (
      <section className="dash-connection card dash-animate">
        <div className="dash-connection__icon" aria-hidden>
          <Compass size={22} />
        </div>
        <div className="dash-connection__copy">
          <h2>Discover more people</h2>
          <p>Expand your connections and find people who match your interests.</p>
        </div>
        <button type="button" className="btn-primary btn-full" onClick={onDiscover}>
          Explore Discover
        </button>
      </section>
    );
  }

  return (
    <section className="dash-connection card dash-animate">
      <div className="dash-connection__icon" aria-hidden>
        <UserRound size={22} />
      </div>
      <div className="dash-connection__copy">
        <h2>Complete your profile</h2>
        <p>Improve visibility and compatibility for better matches.</p>
      </div>
      <button type="button" className="btn-primary btn-full" onClick={onCompleteProfile}>
        Edit Profile
      </button>
    </section>
  );
}
