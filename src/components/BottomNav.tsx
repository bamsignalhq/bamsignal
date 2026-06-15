import { Compass, Heart, Home, MessageCircle, User, UserPlus } from "lucide-react";
import type { NavTab } from "../types";

type BottomNavProps = {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
  likeCount?: number;
  isGuest?: boolean;
  onJoin?: () => void;
};

type NavItem = {
  id: NavTab | "join";
  label: string;
  icon: typeof Home;
  action?: boolean;
};

const memberTabs: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "chats", label: "Messages", icon: MessageCircle },
  { id: "likes", label: "Signals", icon: Heart },
  { id: "me", label: "Profile", icon: User }
];

const guestTabs: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "join", label: "Join", icon: UserPlus, action: true }
];

export function BottomNav({ active, onNavigate, likeCount = 0, isGuest, onJoin }: BottomNavProps) {
  const tabs = isGuest ? guestTabs : memberTabs;

  return (
    <nav className={`bottom-nav ${isGuest ? "bottom-nav--guest" : ""}`} aria-label="Main navigation">
      {tabs.map(({ id, label, icon: Icon, action }) => {
        const isJoin = id === "join";
        const isActive = !isJoin && active === id;

        return (
          <button
            key={id}
            type="button"
            className={`bottom-nav-item ${isActive ? "active" : ""} ${isJoin ? "bottom-nav-item--join" : ""}`}
            onClick={() => (action ? onJoin?.() : onNavigate(id as NavTab))}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav-icon-wrap">
              <Icon size={22} strokeWidth={isActive || isJoin ? 2.4 : 2} />
              {id === "likes" && likeCount > 0 && (
                <span className="bottom-nav-badge">{likeCount > 9 ? "9+" : likeCount}</span>
              )}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
