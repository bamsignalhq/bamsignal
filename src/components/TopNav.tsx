import { Moon, SlidersHorizontal, Sun } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { FoundingMemberBadge } from "./FoundingMemberBadge";
import { MemberNav } from "./MemberNav";
import { NotificationBell } from "./NotificationCenter";
import type { NavTab, Theme } from "../types";

type TopNavProps = {
  theme: Theme;
  onToggleTheme: () => void;
  isPremium?: boolean;
  isGuest?: boolean;
  onLogin?: () => void;
  onLogoClick?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  showEarlyAccess?: boolean;
  showFoundingMember?: boolean;
  memberTab?: NavTab;
  onMemberNavigate?: (tab: NavTab) => void;
  likeCount?: number;
  messageCount?: number;
  showMemberNav?: boolean;
  memberFirstName?: string;
  discoverPremium?: boolean;
  onDiscoverFilterClick?: () => void;
};

export function TopNav({
  theme,
  onToggleTheme,
  isPremium,
  isGuest,
  onLogin,
  onLogoClick,
  showNotifications,
  notificationCount = 0,
  onNotificationsClick,
  showEarlyAccess,
  showFoundingMember,
  memberTab,
  onMemberNavigate,
  likeCount = 0,
  messageCount = 0,
  showMemberNav = false,
  memberFirstName,
  discoverPremium = false,
  onDiscoverFilterClick
}: TopNavProps) {
  return (
    <header className={`top-nav${discoverPremium ? " top-nav--discover-premium" : ""}`}>
      <button type="button" className="top-nav-brand" onClick={onLogoClick} aria-label="BamSignal home">
        <AppLogo size="sm" showText={discoverPremium} />
        {showFoundingMember && <FoundingMemberBadge className="top-nav-early" />}
        {!showFoundingMember && showEarlyAccess && <FoundingMemberBadge className="top-nav-early" />}
      </button>

      {showMemberNav && memberTab && onMemberNavigate && (
        <MemberNav
          active={memberTab}
          onNavigate={onMemberNavigate}
          likeCount={likeCount}
          messageCount={messageCount}
          className="top-nav-member-nav"
        />
      )}
      <div className="top-nav-actions">
        {isGuest ? (
          <>
            {onLogin && (
              <button type="button" className="top-nav-get-started" onClick={onLogin}>
                Login
              </button>
            )}
            <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </>
        ) : (
          <>
            {memberFirstName && (
              <span className="top-nav-greeting" aria-label={`Signed in as ${memberFirstName}`}>
                Hi, {memberFirstName}
              </span>
            )}
            {isPremium && <span className="premium-pill">Premium</span>}
            {showNotifications && onNotificationsClick && (
              <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
            )}
            {discoverPremium && onDiscoverFilterClick ? (
              <button
                type="button"
                className="icon-btn"
                onClick={onDiscoverFilterClick}
                aria-label="Discover filters"
              >
                <SlidersHorizontal size={20} />
              </button>
            ) : (
              <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
