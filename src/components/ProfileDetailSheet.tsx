import { ChevronLeft, ChevronRight, Heart, MoreHorizontal, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "../constants/copy";
import { profileIntentLabel } from "../constants/intents";
import type { DiscoverProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";
import { ShowcaseImage } from "./ShowcaseImage";
import { VerificationBadge } from "./VerificationBadge";
import { VoiceIntro } from "./VoiceIntro";
import { WhyThisProfile } from "./WhyThisProfile";
import { ProfileInterestsPreview } from "./profile/ProfileInterestsPreview";
import { ProfileDetailsList } from "./profile/ProfileDetailsList";
import { ProfileCompatibilityBars } from "./profile/ProfileCompatibilityBars";
import { hasFilledProfileDetails } from "../utils/profileDetails";
import { getDatingProfile } from "../utils/profile";
import { getProfileDimensionScores } from "../utils/compatibility";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import { safePhotos } from "../utils/safeProfile";
import { likeProfile, followProfile, hasLikedProfile, hasFollowedProfile } from "../utils/profileSocial";
import { likeProfileRemote, followProfileRemote } from "../services/memberData";
import type { UserProfile } from "../types";

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
  onBlockAndReport?: () => void;
  isPremium?: boolean;
  signalSent?: boolean;
  viewer?: Pick<UserProfile, "email" | "phone" | "name">;
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
  onBlockAndReport,
  isPremium = false,
  signalSent = false,
  viewer
}: ProfileDetailSheetProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [liked, setLiked] = useState(() => hasLikedProfile(profile.id));
  const [followed, setFollowed] = useState(() => hasFollowedProfile(profile.id));
  const menuRef = useRef<HTMLDivElement>(null);

  const gallery = safePhotos(profile.photos?.length ? profile.photos : [profile.photo]);
  const heroPhoto = gallery[photoIndex] ?? gallery[0] ?? DEFAULT_PROFILE_COVER;
  const viewerProfile = getDatingProfile();
  const compatibilityDimensions = getProfileDimensionScores(viewerProfile, profile);

  const goPhoto = (dir: -1 | 1) => {
    if (gallery.length <= 1) return;
    setPhotoIndex((i) => (i + dir + gallery.length) % gallery.length);
  };

  const handleLike = async () => {
    if (liked) return;
    const entry = {
      profileId: profile.id,
      name: profile.name,
      photo: gallery[photoIndex] || profile.photo,
      at: new Date().toISOString()
    };
    if (likeProfile(entry)) setLiked(true);
    if (viewer) void likeProfileRemote(viewer, profile.id, photoIndex);
  };

  const handleFollow = async () => {
    if (followed) return;
    const entry = {
      profileId: profile.id,
      name: profile.name,
      photo: profile.photo,
      at: new Date().toISOString()
    };
    if (followProfile(entry)) setFollowed(true);
    if (viewer) void followProfileRemote(viewer, profile.id);
  };

  const handleSignal = () => {
    onSendSignal?.();
    onClose();
  };

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
          <ShowcaseImage
            src={heroPhoto}
            alt={profile.name}
            fallbackSrc={DEFAULT_PROFILE_COVER}
            className="profile-detail-sheet__img--face"
          />
          {gallery.length > 1 && (
            <>
              <button type="button" className="profile-detail-sheet__nav profile-detail-sheet__nav--prev" onClick={() => goPhoto(-1)} aria-label="Previous photo" />
              <button type="button" className="profile-detail-sheet__nav profile-detail-sheet__nav--next" onClick={() => goPhoto(1)} aria-label="Next photo" />
            </>
          )}
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
            <p className="profile-detail-sheet__subline">
              {profile.age}
              {profile.city ? ` · ${profile.city}` : ""}
            </p>
            {verification && verification.tier > 0 && (
              <div className="profile-detail-sheet__badges">
                <VerificationBadge info={verification} />
              </div>
            )}
          </div>
        </header>

        <div className="profile-detail-sheet__body profile-detail-sheet__body--clean">
          <div className="profile-detail-sheet__social-row">
            <button type="button" className={`btn-secondary btn-sm ${liked ? "active" : ""}`} onClick={handleLike}>
              <Heart size={16} /> {liked ? "Liked" : "Like photo"}
            </button>
            <button type="button" className={`btn-secondary btn-sm ${followed ? "active" : ""}`} onClick={handleFollow}>
              <UserPlus size={16} /> {followed ? "Following" : "Follow"}
            </button>
          </div>

          <section className="profile-detail-sheet__card profile-detail-sheet__card--bio">
            {profile.bio?.trim() ? (
              <>
                <p className="profile-detail-sheet__bio">{profile.bio}</p>
              </>
            ) : null}
            {hasFilledProfileDetails(profile) ? (
              <ProfileDetailsList profile={profile} variant="chips" />
            ) : !profile.bio?.trim() ? (
              <p className="profile-detail-sheet__empty">—</p>
            ) : null}
          </section>

          {profile.interests?.length ? (
            <section className="profile-detail-sheet__card profile-read-section">
              <h3 className="profile-read__heading">Interests</h3>
              <ProfileInterestsPreview interests={profile.interests} />
            </section>
          ) : null}

          {profile.intents?.length ? (
            <section className="profile-detail-sheet__card profile-read-section">
              <h3 className="profile-read__heading">Looking For</h3>
              <div className="profile-read-chips">
                {profile.intents.slice(0, 3).map((tag) => (
                  <span key={tag} className="profile-read-chip profile-read-chip--intent">
                    {profileIntentLabel(tag)}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

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

          <section className="profile-detail-sheet__card">
            <h3>Compatibility</h3>
            {compatibilityPercent != null ? (
              <p className="profile-detail-sheet__compat-line">
                <strong>{compatibilityPercent}%</strong> match
              </p>
            ) : null}
            <ProfileCompatibilityBars dimensions={compatibilityDimensions} />
          </section>
        </div>

        {(onSendSignal || onPass) && (
          <footer className="profile-detail-sheet__actions profile-detail-sheet__actions--clean">
            <button
              type="button"
              className="profile-detail-sheet__signal"
              onClick={handleSignal}
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
                      Report user
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
                      Block user
                    </button>
                  )}
                  {onBlockAndReport && (
                    <button
                      type="button"
                      role="menuitem"
                      className="profile-card-overflow__menu-item--alert"
                      onClick={() => {
                        setMenuOpen(false);
                        onBlockAndReport();
                      }}
                    >
                      Block &amp; Report
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
