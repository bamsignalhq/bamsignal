import { MoreHorizontal, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "../constants/copy";
import type { DiscoverProfile } from "../types";
import type { TrustInfo } from "../utils/trust";
import type { VerificationInfo } from "../utils/verification";
import { ShowcaseImage } from "./ShowcaseImage";
import { VerificationBadge } from "./VerificationBadge";
import { TrustBadge } from "./TrustBadge";
import { TrustMicroStrip } from "./TrustMicroStrip";

type ProfileCardProps = {
  profile: DiscoverProfile;
  compatibilityPercent?: number;
  matchReasons?: string[];
  verification?: VerificationInfo;
  trust?: TrustInfo;
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
  signalSent?: boolean;
  entering?: boolean;
};

export function ProfileCard({
  profile,
  compatibilityPercent,
  matchReasons = [],
  verification,
  trust,
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
  signalSent = false,
  entering = true
}: ProfileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reasonChips = matchReasons.slice(0, 2);

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
      className={`profile-card profile-card-v2 profile-card-v2--minimal ${blurred ? "blurred" : ""} ${signalSent ? "profile-card-v2--sent" : ""} ${entering ? "profile-card-v2--enter" : ""}`}
    >
      <div className="profile-card-v2__photo">
        <button
          type="button"
          className="profile-card-photo-hit"
          onClick={onViewProfile}
          aria-label={`View ${profile.name}'s profile`}
        >
          <ShowcaseImage src={profile.photo} alt={profile.name} loading="lazy" className="profile-card-v2__img--face" />
          <div className="profile-card-gradient" />
          <div className="profile-card-v2__overlay">
            <div className="profile-card-v2__identity">
              <h3>
                {profile.name}
                <span className="profile-card-v2__age">, {profile.age}</span>
              </h3>
            </div>
            <p className="profile-card-v2__city">{profile.city}</p>
            <div className="profile-card-badges">
              {verification && <VerificationBadge info={verification} />}
              {trust && <TrustBadge info={trust} />}
            </div>
            <TrustMicroStrip
              verified={Boolean(verification?.tier || profile.verified)}
              voiceIntroUrl={profile.voiceIntroUrl}
              lastActiveAt={profile.lastActiveAt}
            />
            {compatibilityPercent != null && (
              <span className="profile-card-compat">{compatibilityPercent}% match</span>
            )}
            {reasonChips.length > 0 && (
              <div className="profile-card-reason-chips">
                {reasonChips.map((reason) => (
                  <span key={reason} className="profile-card-reason-chip">
                    {reason}
                  </span>
                ))}
              </div>
            )}
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
            className="profile-card-v2__signal"
            onClick={onSendSignal}
            aria-label={BRAND.sendSignal}
            disabled={Boolean(signalBlockedReason) || signalSent}
          >
            <Zap size={18} fill="currentColor" />
            {BRAND.sendSignal}
          </button>
          <button type="button" className="profile-card-v2__pass" onClick={onIgnore} aria-label={BRAND.ignore}>
            {BRAND.ignore}
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
