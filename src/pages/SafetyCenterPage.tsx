import { ArrowLeft, BookOpen, LifeBuoy, Shield, ShieldAlert } from "lucide-react";
import { navigateToPath } from "../constants/routes";

type SafetyCenterPageProps = {
  onBack: () => void;
  onOpenProfile: () => void;
};

const SAFETY_LINKS = [
  {
    icon: ShieldAlert,
    title: "Report a user",
    body: "Report fake profiles, scams, or harassment from any profile or chat.",
    action: "profile" as const
  },
  {
    icon: Shield,
    title: "Block a user",
    body: "Block someone — they won't see you or contact you again.",
    action: "profile" as const
  },
  {
    icon: BookOpen,
    title: "Community guidelines",
    body: "How we keep BamSignal respectful and real.",
    action: "guidelines" as const
  },
  {
    icon: LifeBuoy,
    title: "Contact support",
    body: "Reach our team for urgent safety issues.",
    action: "contact" as const
  }
];

export function SafetyCenterPage({ onBack, onOpenProfile }: SafetyCenterPageProps) {
  return (
    <div className="page safety-center-page safety-center-page--clean">
      <header className="safety-center-page__head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1>Safety Center</h1>
          <p>Report, block, and manage your experience.</p>
        </div>
      </header>

      <nav className="safety-center-clean" aria-label="Safety tools">
        {SAFETY_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              className="safety-center-clean__row card"
              onClick={() => {
                if (item.action === "profile") onOpenProfile();
                else if (item.action === "guidelines") navigateToPath("/safety");
                else navigateToPath("/contact");
              }}
            >
              <Icon size={20} aria-hidden />
              <div>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <p className="safety-center-clean__note">
        Privacy and matching controls live in <button type="button" className="link-btn" onClick={onOpenProfile}>Settings</button>.
      </p>
    </div>
  );
}
