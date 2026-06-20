import { MoreHorizontal, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import { BRAND } from "../constants/copy";
import type { DiscoverProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";
import { ShowcaseImage } from "./ShowcaseImage";
import { VerificationBadge } from "./VerificationBadge";

type ProfileCardProps = {
  profile: DiscoverProfile;
  compatibilityPercent?: number;
  matchReasons?: string[];
  verification?: VerificationInfo;
  onIgnore?: () => void;
  onSendSignal?: () => void;
  onPrioritySignal?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  onViewProfile?: () => void;
  signalBlockedReason?: string;
  showActions?: boolean;
  blurred?: boolean;
  isPremium?: boolean;
  memberBadge?: "Premium" | "Fast" | null;
  signalSent?: boolean;
  entering?: boolean;
};

export function ProfileCard({
  profile,
  verification,
  onIgnore,
  onSendSignal,
  onPrioritySignal,
  onReport,
  onBlock,
  onViewProfile,
  signalBlockedReason,
  showActions = true,
  blurred = false,
  isPremium = false,
  memberBadge = null,
  signalSent = false,
  entering = true
}: ProfileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <article
      className={`profile-card profile-card-v2 profile-card-v2--minimal profile-card-v2--hero ${blurred ? "blurred" : ""} ${signalSent ? "profile-card-v2--sent" : ""} ${entering ? "profile-card-v2--enter" : ""}`}
    >
      <div className="profile-card-v2__photo">
        <button
          type="button"
          className="profile-card-photo-hit"
          onClick={onViewProfile}
          aria-label={`View ${profile.name}'s profile`}
        >
          <ShowcaseImage
            src={profile.photo || DEFAULT_PROFILE_COVER}
            alt={profile.name}
            fallbackSrc={DEFAULT_PROFILE_COVER}
            loading="lazy"
            className="profile-card-v2__img--face"
          />
          <div className="profile-card-gradient" />
          <div className="profile-card-v2__overlay">
            <div className="profile-card-v2__identity">
              <h3>
                {profile.name}
                <span className="profile-card-v2__age">, {profile.age}</span>
                {memberBadge ? (
                  <span className={`profile-card-v2__plan-badge profile-card-v2__plan-badge--${memberBadge.toLowerCase()}`}>
                    {memberBadge}
                  </span>
                ) : null}
              </h3>
            </div>
            <p className="profile-card-v2__city">{profile.city}</p>
            {verification?.tier ? (
              <div className="profile-card-badges profile-card-badges--minimal">
                <VerificationBadge info={verification} />
              </div>
            ) : null}
          </div>
        </button>
      </div>

      {signalBlockedReason && (
        <p className="profile-card-signal-gate" role="status">
          {signalBlockedReason}
        </p>
      )}

      {showActions && !blurred && (
        <div className="profile-card-v2__actions profile-card-v2__actions--minimal">
          <button
            type="button"
            className="btn-secondary profile-card-v2__pass"
            onClick={onIgnore}
            aria-label={BRAND.ignore}
          >
            {BRAND.ignore}
          </button>
          <button
            type="button"
            className="btn-primary profile-card-v2__signal"
            onClick={onSendSignal}
            aria-label={BRAND.sendSignal}
            disabled={Boolean(signalBlockedReason) || signalSent}
          >
            <Zap size={18} fill="currentColor" />
            {BRAND.sendSignal}
          </button>
          <div className="profile-card-overflow" ref={menuRef}>
            <button
              type="button"
              className="profile-card-overflow__trigger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="More options"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <div className="profile-card-overflow__menu" role="menu">
                {onReport && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onReport();
                    }}
                  >
                    Report
                  </button>
                )}
                {onBlock && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onBlock();
                    }}
                  >
                    Block
                  </button>
                )}
                {isPremium && onPrioritySignal && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onPrioritySignal();
                    }}
                    disabled={signalSent}
                  >
                    {BRAND.prioritySignal}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
