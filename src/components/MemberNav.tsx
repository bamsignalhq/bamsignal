import type { NavTab } from "../types";

type MemberNavProps = {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
  likeCount?: number;
  messageCount?: number;
  className?: string;
};

const TABS: { id: NavTab; label: string; badgeKey?: "likes" | "messages" }[] = [
  { id: "home", label: "Home" },
  { id: "discover", label: "Discover" },
  { id: "likes", label: "Likes", badgeKey: "likes" },
  { id: "chats", label: "Chats", badgeKey: "messages" },
  { id: "me", label: "Me" }
];

export function MemberNav({
  active,
  onNavigate,
  likeCount = 0,
  messageCount = 0,
  className = ""
}: MemberNavProps) {
  const badges = { likes: likeCount, messages: messageCount };

  return (
    <nav className={`member-nav ${className}`.trim()} aria-label="Member navigation">
      {TABS.map(({ id, label, badgeKey }) => {
        const count = badgeKey ? badges[badgeKey] : 0;
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            className={`member-nav__item ${isActive ? "member-nav__item--active" : ""}`}
            onClick={() => onNavigate(id)}
            aria-current={isActive ? "page" : undefined}
          >
            <span>{label}</span>
            {count > 0 && (
              <span className="member-nav__badge">{count > 9 ? "9+" : count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
