import { MoreHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "../constants/copy";
import { intentDisplay } from "../constants/intents";
import type { DiscoverProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";
import { ShowcaseImage } from "./ShowcaseImage";
import { VerificationBadge } from "./VerificationBadge";
import { VoiceIntro } from "./VoiceIntro";
import { WhyThisProfile } from "./WhyThisProfile";

type ProfileDetailSheetProps = {
  profile: DiscoverProfile;
  open: boolean;
  onClose: () => void;
  matchReasons: string[];
  compatibilityPercent?: number;
  compatibilitySubtitle?: string;
  verification?: VerificationInfo;
  onSendSignal?: () => void;
  onPass?: () => void;
  onPrioritySignal?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  isPremium?: boolean;
  signalSent?: boolean;
};

export function ProfileDetailSheet({
  profile,
  open,
  onClose,
  matchReasons,
  compatibilityPercent,
  verification,
  onSendSignal,
  onPass,
  onPrioritySignal,
  onReport,
  onBlock,
  isPremium = false,
  signalSent = false
}: ProfileDetailSheetProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const gallery = [profile.photo];
  const heroPhoto = gallery[photoIndex] ?? profile.photo;

  useEffect(() => {
    if (!open) {
      setPhotoIndex(0);
      setMenuOpen(false);
    }
  }, [open]);

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

  if (!open) return null;

  return (
    <div className="profile-detail-sheet" role="dialog" aria-modal="true" aria-label={`${profile.name}'s profile`}>
      <button type="button" className="profile-detail-sheet__backdrop" onClick={onClose} aria-label="Close profile" />
      <article className="profile-detail-sheet__panel profile-detail-sheet__panel--actions">
        <header className="profile-detail-sheet__hero">
          <ShowcaseImage src={heroPhoto} alt={profile.name} className="profile-detail-sheet__img--face" />
          <div className="profile-detail-sheet__shade" />
          <button type="button" className="profile-detail-sheet__close icon-btn" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
          {gallery.length > 1 && (
            <div className="profile-detail-sheet__dots" role="tablist" aria-label="Photos">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === photoIndex}
                  className={i === photoIndex ? "active" : ""}
                  onClick={() => setPhotoIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}
          <div className="profile-detail-sheet__meta">
            <h2 className="profile-detail-sheet__name">{profile.name}</h2>
            <p className="profile-detail-sheet__age">{profile.age}</p>
            <p className="profile-detail-sheet__city">{profile.city}</p>
            {verification && verification.tier > 0 && (
              <div className="profile-detail-sheet__badges">
                <VerificationBadge info={verification} />
              </div>
            )}
          </div>
        </header>

        <div className="profile-detail-sheet__body profile-detail-sheet__body--clean">
          <section className="profile-detail-sheet__card">
            <h3>Bio</h3>
            <p className="profile-detail-sheet__bio">{profile.bio || "—"}</p>
          </section>

          <section className="profile-detail-sheet__card">
            <h3>Interests</h3>
            {profile.interests?.length ? (
              <div className="intent-tags">
                {profile.interests.map((tag) => (
                  <span key={tag} className="intent-tag selected">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-sheet__empty">—</p>
            )}
          </section>

          <section className="profile-detail-sheet__card">
            <h3>Looking for</h3>
            {profile.intents?.length ? (
              <div className="intent-tags">
                {profile.intents.slice(0, 3).map((tag) => (
                  <span key={tag} className="intent-tag selected">
                    {intentDisplay(tag)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-sheet__empty">—</p>
            )}
          </section>

          {profile.voiceIntroUrl && (
            <section className="profile-detail-sheet__card">
              <h3>Voice intro</h3>
              <VoiceIntro url={profile.voiceIntroUrl} />
            </section>
          )}

          {matchReasons.length > 0 && (
            <section className="profile-detail-sheet__card profile-detail-sheet__card--why">
              <WhyThisProfile reasons={matchReasons} />
            </section>
          )}

          {compatibilityPercent != null && (
            <section className="profile-detail-sheet__card">
              <h3>Compatibility</h3>
              <p className="profile-detail-sheet__compat-line">
                <strong>{compatibilityPercent}%</strong> match
              </p>
            </section>
          )}
        </div>

        {(onSendSignal || onPass) && (
          <footer className="profile-detail-sheet__actions profile-detail-sheet__actions--clean">
            <button
              type="button"
              className="profile-detail-sheet__signal"
              onClick={() => {
                onSendSignal?.();
                onClose();
              }}
              disabled={signalSent}
            >
              {BRAND.sendSignal}
            </button>
            <button
              type="button"
              className="profile-detail-sheet__pass"
              onClick={() => {
                onPass?.();
                onClose();
              }}
            >
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
                <div className="profile-card-overflow__menu profile-card-overflow__menu--up" role="menu">
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
                        onClose();
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
                        onClose();
                      }}
                      disabled={signalSent}
                    >
                      {BRAND.prioritySignal}
                    </button>
                  )}
                </div>
              )}
            </div>
          </footer>
        )}
      </article>
    </div>
  );
}
