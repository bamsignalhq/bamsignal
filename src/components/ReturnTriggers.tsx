import { Eye, Flame, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { STORAGE_KEYS } from "../constants/limits";
import { BRAND } from "../constants/copy";
import { getNotifications } from "../utils/notifications";
import { getProfileViews } from "../utils/profileViews";
import { getStreak, getStreakLabel } from "../utils/streaks";
import { filterBlockedByProfileId } from "../utils/safety";
import { readJson } from "../utils/storage";
import type { LikeEntry } from "../types";

type ReturnTriggersProps = {
  onOpenLikes?: () => void;
  onOpenDiscover?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
};

export function ReturnTriggers({
  onOpenLikes,
  onOpenDiscover,
  onOpenProfile,
  onOpenNotifications
}: ReturnTriggersProps) {
  const unread = getNotifications().filter((n) => !n.read);
  const signals = filterBlockedByProfileId(readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, []));
  const views = getProfileViews();
  const streak = getStreak();

  const items: {
    id: string;
    icon: typeof Zap;
    title: string;
    detail: string;
    action?: () => void;
    accent?: boolean;
  }[] = [];

  if (signals.length > 0) {
    items.push({
      id: "signals",
      icon: Zap,
      title: `${signals.length} new signal${signals.length === 1 ? "" : "s"}`,
      detail: "Someone wants to connect — review incoming signals.",
      action: onOpenLikes,
      accent: true
    });
  }

  if (views.count > 0) {
    items.push({
      id: "views",
      icon: Eye,
      title: `${views.count} profile view${views.count === 1 ? "" : "s"}`,
      detail: "Your profile is getting attention.",
      action: onOpenProfile
    });
  }

  const accepted = unread.find((n) => n.type === "signal_accepted");
  if (accepted) {
    items.push({
      id: "accepted",
      icon: Sparkles,
      title: BRAND.signalAccepted,
      detail: BRAND.signalAcceptedSub,
      action: onOpenNotifications,
      accent: true
    });
  }

  const verified = unread.find((n) => n.type === "verification_approved");
  if (verified) {
    items.push({
      id: "verified",
      icon: ShieldCheck,
      title: "You're verified",
      detail: verified.body,
      action: onOpenProfile
    });
  }

  if (streak.count > 0) {
    items.push({
      id: "streak",
      icon: Flame,
      title: getStreakLabel(streak.count),
      detail: "Keep your streak alive — send a signal today.",
      action: onOpenDiscover
    });
  }

  if (!items.length) return null;

  return (
    <section className="return-triggers" aria-label="Reasons to come back">
      <h3 className="return-triggers__title">What's new for you</h3>
      <ul className="return-triggers__list">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`return-triggers__item ${item.accent ? "return-triggers__item--accent" : ""}`}
                onClick={item.action}
              >
                <Icon size={20} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
