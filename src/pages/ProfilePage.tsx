import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Mic, Moon, Settings, Sun } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { MAX_INTENT_SELECTIONS, INTENT_OPTIONS, intentDisplay, profileIntentLabel, toggleIntentSelection, INTENT_LIMIT_MESSAGE } from "../constants/intents";
import { PhotoUploadGrid } from "../components/PhotoUploadGrid";
import { CoverPhotoUpload } from "../components/CoverPhotoUpload";
import { PhoneVerificationPanel } from "../components/PhoneVerificationPanel";
import { MatchPreferenceFields } from "../components/preferences/MatchPreferenceFields";
import { TapSelectField } from "../components/TapSelectField";
import { searchStateFromPrefs, withSearchStateChange, normalizeSearchCities } from "../utils/searchLocationPrefs";
import {
  citiesForState,
  cityBelongsToState,
  NIGERIAN_STATES,
  normalizeEthnicities,
  normalizeLifestyleTraits,
  stateDisplayLabel
} from "../constants/profileOptions";
import { ProfileCoverHeader } from "../components/ProfileCoverHeader";
import { ProfileInterestsPreview } from "../components/profile/ProfileInterestsPreview";
import { InterestPicker } from "../components/InterestPicker";
import { VoiceIntroRecorder } from "../components/VoiceIntro";
import { VoiceIntro } from "../components/VoiceIntro";
import type {
  DatingProfile,
  IntentTag,
  LookingFor,
  MatchPreferences,
  SafetySettings,
  Theme,
  UserProfile
} from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { BUTTON_COPY, PREMIUM_COPY } from "../constants/copy";
import { APP_BUILD_LABEL, APP_BUILD_TIME } from "../constants/appRelease";
import { APP_BUILD_ID } from "../constants/build";
import { BUILD_CODE, BUILD_TIME, BUILD_VERSION, CACHE_VERSION } from "../buildInfo";
import { getCms } from "../constants/cms";
import { USER_MESSAGES } from "../constants/userMessages";
import { getVerificationTier } from "../utils/verification";
import { normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { resolveProfileMainPhoto } from "../utils/mainPhoto";
import {
  CONTACT_LEAK_BLOCK_MESSAGE,
  validateDisplayName,
  validateProfileContactLeaks,
  validateUserText
} from "../utils/contactGuard";
import { readJson, writeJson } from "../utils/storage";
import { SafetySettingsCard } from "../components/SafetySettingsCard";
import {
  isUserVerificationApproved,
  isUserVerificationPending
} from "../utils/verificationQueue";
import { notifyVerificationApproved } from "../utils/notifyHelpers";
import { MAX_PROFILE_PHOTOS } from "../constants/photos";
import { persistCoverPhotoChange } from "../utils/persistCoverPhoto";
import { syncMemberProfileRemote, syncMemberProfileWithResult } from "../services/cityHome";
import { revalidateMemberProfileAfterUpdate } from "../services/memberProfileSync";
import { ProfileAccountPanel } from "../components/profile/ProfileAccountPanel";
import { TwoFactorSettingsCard } from "../components/TwoFactorSettingsCard";
import { ContactForm } from "../components/ContactForm";
import { ProfileBoostSheet } from "../components/profile/ProfileBoostSheet";
import { FastConnectionSheet } from "../components/profile/FastConnectionSheet";
import { ProfilePromptsEditor } from "../components/profile/ProfilePromptsEditor";
import { ProfileOverviewCard } from "../components/profile/ProfileOverviewCard";
import {
  getProfileAboutDisplay
} from "../utils/ownProfileOverview";
import type { BoostProduct } from "../constants/boosts";
import { boostNeedsMemberCity } from "../constants/boosts";
import { fetchAccountStateRemote } from "../services/memberTrust";
import { getMemberCity } from "../utils/memberCity";
import { canShowProfileBoostEntry } from "../utils/profileBoostEntry";
import { useFastConnectionCheckout } from "../hooks/useFastConnectionCheckout";
import { fastConnectionActiveLabel } from "../utils/quickie";

type ProfileView = "overview" | "edit" | "settings";
type SaveFeedbackSource = "edit" | "preferences";

type SaveFeedback = {
  text: string;
  success: boolean;
  source: SaveFeedbackSource;
};
type SettingsPanel = "hub" | "account" | "privacy" | "notifications" | "preferences" | "verification" | "subscription" | "help" | "about";
type EditSection = "basic" | "photos" | "bio" | "interests" | "intent" | "details" | "prompts" | "voice";

const PROFILE_STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ value: s, label: stateDisplayLabel(s) }));

type ProfilePageProps = {
  user: UserProfile;
  isPremium: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onUserChange: (user: UserProfile) => void;
  onLogout: () => void;
  onUpgrade: () => void;
  onReturnToDashboard: () => void;
  onOpenSafetyCenter?: () => void;
  onPurchaseBoost?: (product: BoostProduct) => void;
  boostCheckoutLoading?: boolean;
};

function bioHint(bio: string): string {
  return bio.trim().length >= 16 ? "Added" : "Not added";
}

function interestsHint(interests?: string[]): string {
  const count = interests?.length ?? 0;
  if (!count) return "None yet";
  return `${count} selected`;
}

function intentHint(intents: IntentTag[]): string {
  if (!intents.length) return "Not added";
  if (intents.length === 1) return intentDisplay(intents[0]);
  return `${intents.length} selected`;
}

function voiceHint(url?: string): string {
  return url ? "Added" : "Not added";
}

function detailsHint(profile: DatingProfile): string {
  const tribes = normalizeEthnicities(profile.ethnicities, profile.ethnicity);
  const count = [
    tribes[0],
    profile.religion,
    profile.occupation,
    profile.stateOfOrigin,
    profile.genotype,
    profile.kidsPreference
  ].filter((v) => v && v !== "Prefer not to say").length;
  return count ? `${count} added` : "Optional";
}

function photosHint(count: number): string {
  return `${count} of ${MAX_PROFILE_PHOTOS} added`;
}

function SettingsRow({
  label,
  hint,
  onClick
}: {
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="settings-hub-row" onClick={onClick}>
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}

function EditAccordion({
  id,
  title,
  hint,
  open,
  onToggle,
  children
}: {
  id: EditSection;
  title: string;
  hint?: string;
  open: boolean;
  onToggle: (id: EditSection) => void;
  children: ReactNode;
}) {
  return (
    <section className={`profile-edit-accordion ${open ? "open" : ""}`}>
      <button type="button" className="profile-edit-accordion__head" onClick={() => onToggle(id)} aria-expanded={open}>
        <span>
          <strong>{title}</strong>
          {hint && <small>{hint}</small>}
        </span>
        <ChevronDown size={18} className="profile-edit-accordion__chevron" aria-hidden="true" />
      </button>
      {open && <div className="profile-edit-accordion__body">{children}</div>}
    </section>
  );
}

export function ProfilePage({
  user,
  isPremium,
  theme,
  onToggleTheme,
  onUserChange,
  onLogout,
  onUpgrade,
  onReturnToDashboard,
  onOpenSafetyCenter,
  onPurchaseBoost,
  boostCheckoutLoading = false
}: ProfilePageProps) {
  const { profile, setProfile, prefs, setPrefs } = useMemberProfileListener();
  const [saved, setSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null);
  const saveNavigateTimerRef = useRef<number | null>(null);
  const [modMessage, setModMessage] = useState("");
  const [modMessageSuccess, setModMessageSuccess] = useState(false);
  const [view, setView] = useState<ProfileView>("overview");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("hub");
  const [editOpen, setEditOpen] = useState<EditSection | null>(null);
  const [boostSheetOpen, setBoostSheetOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [verifySubmitted, setVerifySubmitted] = useState(
    () => profile.verificationStatus === "pending" || isUserVerificationPending(user.phone)
  );
  const verifyPending =
    verifySubmitted ||
    profile.verificationStatus === "pending" ||
    isUserVerificationPending(user.phone);

  const profileCityOptions = useMemo(
    () => (profile.state ? citiesForState(profile.state) : []),
    [profile.state]
  );

  useEffect(() => {
    if (profile.verified || !user.phone) return;
    if (isUserVerificationApproved(user.phone)) {
      setProfile((p) => ({ ...p, verified: true }));
      notifyVerificationApproved();
    }
  }, [user.phone, profile.verified]);

  useEffect(() => {
    void fetchAccountStateRemote(user).then((state) => {
      if (!state) return;
      setDeletePending(state.accountStatus === "deleted_pending");
      if (state.profilePausedAt !== undefined && state.profilePausedAt !== profile.profilePausedAt) {
        setProfile((p) => ({ ...p, profilePausedAt: state.profilePausedAt ?? undefined }));
      }
    });
  }, [user.email, user.phone]);

  const showBoostEntry = canShowProfileBoostEntry(user, profile, { deletePending }) && Boolean(onPurchaseBoost);
  const memberCity = getMemberCity() || profile.city?.trim() || "";
  const fastConnectionStatus = fastConnectionActiveLabel();

  const handlePurchaseBoost = (product: BoostProduct) => {
    if (!onPurchaseBoost) return;
    if (!user.email) {
      showModMessage("Add a verified email before purchasing a boost.");
      return;
    }
    if (boostNeedsMemberCity(product.id) && !memberCity) {
      showModMessage("Set your city in Edit Profile first.");
      return;
    }
    setBoostSheetOpen(false);
    onPurchaseBoost(product);
  };

  useEffect(() => {
    return () => {
      if (saveNavigateTimerRef.current !== null) {
        window.clearTimeout(saveNavigateTimerRef.current);
      }
    };
  }, []);

  const showSaveFeedback = (text: string, success: boolean, source: SaveFeedbackSource) => {
    if (saveNavigateTimerRef.current !== null) {
      window.clearTimeout(saveNavigateTimerRef.current);
      saveNavigateTimerRef.current = null;
    }
    setSaveFeedback({ text, success, source });
  };

  const clearSaveFeedback = () => {
    setSaveFeedback(null);
    setSaved(false);
  };

  const returnToProfileOverview = () => {
    setView("overview");
    setSettingsPanel("hub");
    setEditOpen(null);
    clearSaveFeedback();
  };

  const triggerSave = (source: SaveFeedbackSource) => {
    void save(source);
  };

  const commitProfileMediaUpdate = (next: DatingProfile) => {
    const normalized = normalizeDatingProfile({ ...next, premium: isPremium });
    setProfile(normalized);
    void syncMemberProfileWithResult(user, normalized).then(async (synced) => {
      if (!synced.ok) return;
      const canonical = await revalidateMemberProfileAfterUpdate(user, {
        profile: synced.profile ?? normalized
      });
      setProfile({ ...canonical.profile, premium: isPremium });
    });
    return normalized;
  };

  const save = async (source: SaveFeedbackSource = "edit") => {
    if (saveBusy) return;
    const nameError = validateDisplayName(user.name);
    if (nameError) {
      showSaveFeedback(nameError, false, source);
      return;
    }
    const bioError = validateUserText(profile.bio);
    if (bioError) {
      showSaveFeedback(bioError, false, source);
      return;
    }
    const profileLeak = validateProfileContactLeaks(profile, user);
    if (profileLeak.blocked) {
      showSaveFeedback(CONTACT_LEAK_BLOCK_MESSAGE, false, source);
      return;
    }
    setSaveBusy(true);
    setSaveFeedback(null);
    try {
      const normalized = normalizeDatingProfile({ ...profile, premium: isPremium });
      const normalizedPrefs = normalizeMatchPreferences(prefs);
      const synced = await syncMemberProfileWithResult(user, normalized);
      onUserChange({ ...user, name: user.name });
      if (!synced.ok) {
        showSaveFeedback(USER_MESSAGES.profileSaveFailed, false, source);
        return;
      }
      const canonical = await revalidateMemberProfileAfterUpdate(user, {
        profile: synced.profile ?? normalized,
        prefs: normalizedPrefs
      });
      setProfile({ ...canonical.profile, premium: isPremium });
      setPrefs(canonical.prefs);
      setSaved(true);
      showSaveFeedback(USER_MESSAGES.profileSaved, true, source);
      saveNavigateTimerRef.current = window.setTimeout(() => {
        saveNavigateTimerRef.current = null;
        returnToProfileOverview();
      }, 600);
    } finally {
      setSaveBusy(false);
    }
  };

  const showModMessage = (msg: string, success = false) => {
    setModMessage(msg);
    setModMessageSuccess(success);
    window.setTimeout(() => {
      setModMessage("");
      setModMessageSuccess(false);
    }, 4000);
  };

  const {
    sheetOpen: fastConnectionSheetOpen,
    loading: fastConnectionLoading,
    closeSheet: closeFastConnectionSheet,
    continueToPayment: continueFastConnectionPayment,
    handleIntentTap,
    refreshProfileIntents
  } = useFastConnectionCheckout({
    user,
    returnPath: "/profile",
    onPaymentSuccess: () => {
      setProfile((current) => ({ ...current, intents: refreshProfileIntents() }));
      showModMessage("Fast Connection is active.", true);
    },
    onPaymentError: (message) => showModMessage(message)
  });

  const startSelfieVerification = () => {
    openSettings("verification");
  };

  const handlePhoneVerified = (phone: string) => {
    const nextUser = { ...user, phone, phoneVerified: true };
    onUserChange(nextUser);
    writeJson(STORAGE_KEYS.userProfile, nextUser);
  };

  const handleSelfieSubmitted = (verificationSelfie: string) => {
    setProfile((p) => {
      const next = {
        ...p,
        verificationSelfie,
        verificationStatus: "pending" as const
      };
      writeJson(STORAGE_KEYS.datingProfile, normalizeDatingProfile(next));
      syncMemberProfileRemote(user, next);
      return next;
    });
    setVerifySubmitted(true);
  };

  const toggleIntent = (intent: IntentTag) => {
    const result = toggleIntentSelection(profile.intents, intent);
    if (result.blocked) {
      showModMessage(result.blockedReason || INTENT_LIMIT_MESSAGE);
      return;
    }
    setProfile((p) => ({ ...p, intents: result.next }));
  };

  const handleIntentSelection = (intent: IntentTag) => {
    const handled = handleIntentTap(intent, profile.intents, (intents) =>
      setProfile((current) => ({ ...current, intents }))
    );
    if (!handled) toggleIntent(intent);
  };

  const handleLogout = () => {
    onLogout();
  };

  const openSettings = (panel: SettingsPanel = "hub") => {
    setSettingsPanel(panel);
    setView("settings");
  };

  const toggleEditSection = (id: EditSection) => {
    setEditOpen((current) => (current === id ? null : id));
  };

  const openEdit = (section: EditSection) => {
    setEditOpen(section);
    setView("edit");
  };

  const phoneVerified = Boolean(user.phoneVerified);
  const verification = getVerificationTier(profile, isPremium, phoneVerified);

  const settingsBack = () => {
    if (settingsPanel === "hub") {
      setView("edit");
    } else {
      setSettingsPanel("hub");
    }
  };

  const handleHelpComplete = () => {
    setView("overview");
    setSettingsPanel("hub");
    onReturnToDashboard();
  };

  return (
    <div
      className={`page profile-page profile-page--hero profile-page--premium ${view === "edit" ? "profile-page--editing" : ""}`}
    >
      {modMessage && (
        <p
          className={`profile-mod-toast${modMessageSuccess ? " profile-mod-toast--success" : ""}`}
          role="status"
        >
          {modMessage}
        </p>
      )}

      {view === "overview" && (
        <>
          <ProfileCoverHeader
            user={user}
            profile={profile}
            verification={verification}
            variant="premium"
            editableCover
            coverPhoto={profile.coverPhoto}
            photoMeta={profile.photoMeta}
            onCoverChange={(nextCover, nextPhotoMeta, coverPhotoPath) => {
              setProfile((p) => {
                const next = persistCoverPhotoChange(user, p, {
                  url: nextCover,
                  path: coverPhotoPath,
                  photoMeta: nextPhotoMeta
                });
                return next;
              });
            }}
            onCoverModerationMessage={showModMessage}
            editablePhotos
            onPhotosChange={(photos, nextPhotoMeta, nextMainPhotoUrl) => {
              commitProfileMediaUpdate(
                normalizeDatingProfile({
                  ...profile,
                  photos,
                  photoMeta: nextPhotoMeta ?? profile.photoMeta,
                  mainPhotoUrl: nextMainPhotoUrl
                })
              );
            }}
            onPhotoModerationMessage={showModMessage}
          />

          <div className="profile-premium-sections">
            {(() => {
              const about = getProfileAboutDisplay(profile);
              if (!about) return null;
              return (
                <ProfileOverviewCard
                  title="About"
                  onEdit={() => openEdit(about.editSection === "bio" ? "bio" : "prompts")}
                >
                  <p className="profile-premium-card__text">{about.text}</p>
                </ProfileOverviewCard>
              );
            })()}

            {profile.interests?.length > 0 ? (
              <ProfileOverviewCard title="Interests" onEdit={() => openEdit("interests")}>
                <ProfileInterestsPreview interests={profile.interests} variant="premium" />
              </ProfileOverviewCard>
            ) : null}

            {profile.intents.length > 0 ? (
              <ProfileOverviewCard title="Looking for" onEdit={() => openEdit("intent")}>
                <div className="profile-premium-pills profile-premium-pills--intent">
                  {profile.intents.slice(0, MAX_INTENT_SELECTIONS).map((intent) => (
                    <span key={intent} className="profile-premium-pill profile-premium-pill--outline">
                      {profileIntentLabel(intent)}
                    </span>
                  ))}
                </div>
              </ProfileOverviewCard>
            ) : null}

            <ProfileOverviewCard title="Voice intro" onEdit={() => openEdit("voice")}>
              <div className="profile-premium-voice profile-premium-voice--compact">
                <span className="profile-premium-voice__icon" aria-hidden>
                  <Mic size={18} strokeWidth={1.75} />
                </span>
                <span className="profile-premium-voice__label">Voice intro</span>
                {profile.voiceIntroUrl ? (
                  <VoiceIntro url={profile.voiceIntroUrl} label="Play" compact />
                ) : (
                  <button
                    type="button"
                    className="profile-premium-voice__play-pill"
                    onClick={() => openEdit("voice")}
                  >
                    Add
                  </button>
                )}
              </div>
            </ProfileOverviewCard>
          </div>

          <div className="profile-action-card">
            <button type="button" className="btn-primary btn-full profile-action-card__primary" onClick={() => setView("edit")}>
              Edit profile
            </button>
            <div className="profile-action-card__secondary">
              <button type="button" className="btn-secondary btn-full" onClick={() => openSettings()}>
                <Settings size={16} aria-hidden />
                Settings
              </button>
              <button type="button" className="btn-secondary btn-full profile-edit-cta__logout" onClick={handleLogout}>
                <LogOut size={16} aria-hidden />
                Log out
              </button>
            </div>
            {showBoostEntry ? (
              <button
                type="button"
                className="profile-boost-entry profile-boost-entry--subtle"
                onClick={() => setBoostSheetOpen(true)}
              >
                Boost visibility →
              </button>
            ) : null}
            {fastConnectionStatus ? (
              <p className="profile-fast-connection-status" role="status">
                {fastConnectionStatus}
              </p>
            ) : null}
          </div>
        </>
      )}

      {view === "edit" && (
        <>
          <div className="profile-edit-top">
            <button type="button" className="profile-back-link" onClick={() => setView("overview")}>
              <ChevronLeft size={18} /> Profile
            </button>
            <button
              type="button"
              className="profile-settings-gear"
              onClick={() => openSettings()}
              aria-label="Settings"
            >
              <Settings size={18} aria-hidden />
              <span>Settings</span>
            </button>
          </div>
          <h2 className="profile-screen-title">Edit Profile</h2>

          <EditAccordion
            id="basic"
            title="About"
            open={editOpen === "basic"}
            onToggle={toggleEditSection}
          >
            <div className="profile-form-rows">
              <label className="profile-form-row">
                <span className="profile-form-row__label">Name</span>
                <input
                  className="profile-form-row__input"
                  value={user.name}
                  onChange={(e) => onUserChange({ ...user, name: e.target.value })}
                />
              </label>
              <div className="profile-readonly-row">
                <div className="profile-readonly-field">
                  <span className="profile-form-row__label">Age</span>
                  <p className="profile-readonly-field__value">{profile.age || "—"}</p>
                </div>
                <div className="profile-readonly-field">
                  <span className="profile-form-row__label">Gender</span>
                  <p className="profile-readonly-field__value">{profile.gender || "—"}</p>
                </div>
              </div>
              <div className="profile-location-row">
                <TapSelectField
                  label="State"
                  options={PROFILE_STATE_OPTIONS}
                  value={profile.state}
                  formatValue={stateDisplayLabel}
                  onChange={(next) => {
                    const state = (next as string | undefined) ?? "";
                    const city =
                      state && cityBelongsToState(profile.city, state) ? profile.city : "";
                    setProfile({ ...profile, state, city });
                  }}
                />
                <TapSelectField
                  label="City"
                  disabled={!profile.state}
                  options={profileCityOptions}
                  value={profile.city || undefined}
                  onChange={(next) => setProfile({ ...profile, city: (next as string | undefined) ?? "" })}
                />
              </div>
              <TapSelectField
                label="Interested in"
                options={["Men", "Women"]}
                value={profile.lookingFor}
                onChange={(next) => next && setProfile({ ...profile, lookingFor: next as LookingFor })}
              />
            </div>
          </EditAccordion>

          <EditAccordion
            id="photos"
            title="Photos"
            hint={photosHint(profile.photos.length)}
            open={editOpen === "photos"}
            onToggle={toggleEditSection}
          >
            <h4 className="profile-form-row__label">Backdrop photo</h4>
            <CoverPhotoUpload
              coverPhoto={profile.coverPhoto}
              coverPhotoUrl={profile.coverPhotoUrl}
              coverPhotoExplicit={profile.coverPhotoExplicit}
              coverPhotoUpdatedAt={profile.coverPhotoUpdatedAt}
              photoMeta={profile.photoMeta}
              profilePhotos={profile.photos}
              onChange={(coverPhoto, nextPhotoMeta, coverPhotoPath) => {
                setProfile((p) =>
                  persistCoverPhotoChange(user, p, {
                    url: coverPhoto,
                    path: coverPhotoPath,
                    photoMeta: nextPhotoMeta
                  })
                );
              }}
              onModerationMessage={showModMessage}
            />
            <h4 className="profile-form-row__label">Profile photos</h4>
            <PhotoUploadGrid
              className="photo-upload-grid--centered"
              photos={profile.photos}
              mainPhotoUrl={profile.mainPhotoUrl}
              photoMeta={profile.photoMeta}
              coverPhoto={profile.coverPhoto}
              onChange={(photos, nextPhotoMeta, nextMainPhotoUrl) => {
                commitProfileMediaUpdate(
                  normalizeDatingProfile({
                    ...profile,
                    photos,
                    photoMeta: nextPhotoMeta ?? profile.photoMeta,
                    mainPhotoUrl: nextMainPhotoUrl
                  })
                );
              }}
              onModerationMessage={showModMessage}
            />
          </EditAccordion>

          <EditAccordion
            id="bio"
            title="Bio"
            hint={bioHint(profile.bio)}
            open={editOpen === "bio"}
            onToggle={toggleEditSection}
          >
            <label className="profile-form-row profile-form-row--stack">
              <span className="profile-form-row__label">Bio</span>
              <textarea
                className="profile-form-row__textarea"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell people a little about yourself"
                rows={4}
              />
            </label>
          </EditAccordion>

          <EditAccordion
            id="interests"
            title="Interests"
            hint={interestsHint(profile.interests)}
            open={editOpen === "interests"}
            onToggle={toggleEditSection}
          >
            <InterestPicker
              variant="edit"
              selected={profile.interests ?? []}
              onChange={(interests) => setProfile({ ...profile, interests, interestsTouched: true })}
            />
          </EditAccordion>

          <EditAccordion
            id="intent"
            title="Interested in"
            hint={intentHint(profile.intents)}
            open={editOpen === "intent"}
            onToggle={toggleEditSection}
          >
            <fieldset className="intent-fieldset intent-fieldset--flat">
              <legend>Up to {MAX_INTENT_SELECTIONS}</legend>
              {fastConnectionStatus ? (
                <p className="profile-fast-connection-status" role="status">
                  {fastConnectionStatus}
                </p>
              ) : null}
              <div className="intent-tags selectable">
                {INTENT_OPTIONS.map((opt) => {
                  const selected = profile.intents.includes(opt.id);
                  const disabled = !selected && profile.intents.length >= MAX_INTENT_SELECTIONS;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`intent-tag ${selected ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => handleIntentSelection(opt.id)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </EditAccordion>

          <EditAccordion
            id="details"
            title="Background"
            hint={detailsHint(profile)}
            open={editOpen === "details"}
            onToggle={toggleEditSection}
          >
            <p className="profile-form-row__hint">Optional — helps the right people find you.</p>
            <MatchPreferenceFields
              tribes={normalizeEthnicities(profile.ethnicities, profile.ethnicity)}
              onTribesChange={(ethnicities) => {
                const normalized = normalizeEthnicities(ethnicities);
                setProfile({
                  ...profile,
                  ethnicities: normalized,
                  ethnicity: normalized[0]
                });
              }}
              faith={profile.religion}
              onFaithChange={(religion) => setProfile({ ...profile, religion })}
              lifestyles={
                profile.lifestyles ?? (profile.lifestyle ? [profile.lifestyle] : [])
              }
              onLifestylesChange={(lifestyles) =>
                setProfile({
                  ...profile,
                  lifestyles,
                  lifestyle: lifestyles[0]
                })
              }
              occupation={profile.occupation ?? profile.occupations?.[0]}
              onOccupationChange={(occupation) =>
                setProfile({
                  ...profile,
                  occupation,
                  occupations: occupation ? [occupation] : []
                })
              }
              stateOfOrigin={profile.stateOfOrigin ?? profile.statesOfOrigin?.[0]}
              onStateOfOriginChange={(stateOfOrigin) =>
                setProfile({
                  ...profile,
                  stateOfOrigin,
                  statesOfOrigin: stateOfOrigin ? [stateOfOrigin] : []
                })
              }
              genotype={profile.genotype ?? profile.genotypes?.[0]}
              onGenotypeChange={(genotype) =>
                setProfile({
                  ...profile,
                  genotype,
                  genotypes: genotype ? [genotype] : []
                })
              }
              hasKidsOption={profile.hasKidsOptions?.[0]}
              onHasKidsOptionChange={(hasKidsOption) =>
                setProfile({
                  ...profile,
                  hasKidsOptions: hasKidsOption ? [hasKidsOption] : []
                })
              }
              wantsKidsOption={profile.wantsKidsOptions?.[0]}
              onWantsKidsOptionChange={(wantsKidsOption) =>
                setProfile({
                  ...profile,
                  wantsKidsOptions: wantsKidsOption ? [wantsKidsOption] : []
                })
              }
              bodyType={profile.bodyTypes?.[0]}
              onBodyTypeChange={(bodyType) =>
                setProfile({ ...profile, bodyTypes: bodyType ? [bodyType] : [] })
              }
            />
          </EditAccordion>

          <EditAccordion
            id="prompts"
            title="Profile prompts"
            hint={
              profile.profilePrompts?.filter((p) => p.answer.trim()).length
                ? `${profile.profilePrompts.filter((p) => p.answer.trim()).length} answered`
                : "Optional"
            }
            open={editOpen === "prompts"}
            onToggle={toggleEditSection}
          >
            <ProfilePromptsEditor
              prompts={profile.profilePrompts}
              onChange={(profilePrompts) => setProfile({ ...profile, profilePrompts })}
              onBlocked={showModMessage}
            />
          </EditAccordion>

          <EditAccordion
            id="voice"
            title="Voice greeting"
            hint={voiceHint(profile.voiceIntroUrl)}
            open={editOpen === "voice"}
            onToggle={toggleEditSection}
          >
            <VoiceIntroRecorder
              url={profile.voiceIntroUrl}
              onRecorded={async (voiceIntroUrl) => {
                const next = normalizeDatingProfile({ ...profile, voiceIntroUrl, premium: isPremium });
                setProfile(next);
                const synced = await syncMemberProfileWithResult(user, next);
                if (!synced.ok) {
                  showModMessage(USER_MESSAGES.voiceIntroSaveFailed);
                  return;
                }
                const canonical = await revalidateMemberProfileAfterUpdate(user, {
                  profile: synced.profile ?? next
                });
                setProfile({ ...canonical.profile, premium: isPremium });
              }}
              onClear={() => {
                const next = normalizeDatingProfile({
                  ...profile,
                  voiceIntroUrl: undefined,
                  premium: isPremium
                });
                setProfile(next);
                void syncMemberProfileWithResult(user, next).then(async (synced) => {
                  if (!synced.ok) return;
                  const canonical = await revalidateMemberProfileAfterUpdate(user, {
                    profile: synced.profile ?? next
                  });
                  setProfile({ ...canonical.profile, premium: isPremium });
                });
              }}
              onRejected={showModMessage}
            />
          </EditAccordion>

          <div className="profile-edit-save-bar">
            <button
              type="button"
              className="btn-primary btn-full"
              onClick={() => triggerSave("edit")}
              disabled={saveBusy}
            >
              {saveBusy ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
            {saveFeedback?.source === "edit" ? (
              <p
                className={`profile-save-feedback${saveFeedback.success ? " profile-save-feedback--success" : ""}`}
                role="status"
              >
                {saveFeedback.text}
              </p>
            ) : null}
          </div>
        </>
      )}

      {view === "settings" && (
        <>
          <button type="button" className="profile-back-link" onClick={settingsBack}>
            <ChevronLeft size={18} /> {settingsPanel === "hub" ? "Edit Profile" : "Settings"}
          </button>
          <h2 className="profile-screen-title">
            {settingsPanel === "hub"
              ? "Settings"
              : settingsPanel === "account"
                ? "Account"
                : settingsPanel === "privacy"
                  ? "Privacy & Safety"
                  : settingsPanel === "notifications"
                    ? "Notifications"
                    : settingsPanel === "preferences"
                      ? "Preferences"
                      : settingsPanel === "verification"
                        ? "Verification"
                        : settingsPanel === "subscription"
                          ? "Subscription"
                          : settingsPanel === "help"
                            ? "Help"
                            : settingsPanel === "about"
                              ? "About"
                              : "Settings"}
          </h2>

          {settingsPanel === "hub" && (
            <>
              <section className="card settings-hub-card">
                <SettingsRow
                  label={isPremium ? "Manage Signal Pass" : "Signal Pass"}
                  hint={isPremium ? PREMIUM_COPY.subscriptionManage : PREMIUM_COPY.settingsSignalPassHint}
                  onClick={() => setSettingsPanel("subscription")}
                />
                <SettingsRow label="Privacy & Safety" onClick={() => setSettingsPanel("privacy")} />
                <SettingsRow label="Notifications" onClick={() => setSettingsPanel("notifications")} />
                <SettingsRow label="Account" onClick={() => setSettingsPanel("account")} />
                <SettingsRow label="Safety Center" onClick={() => onOpenSafetyCenter?.()} />
                <SettingsRow label="Preferences" onClick={() => setSettingsPanel("preferences")} />
                <SettingsRow label="Verification" onClick={() => setSettingsPanel("verification")} />
                <SettingsRow
                  label={PREMIUM_COPY.helpSupport}
                  onClick={() => setSettingsPanel("help")}
                />
                <SettingsRow label="About" onClick={() => setSettingsPanel("about")} />
              </section>
              <section className="card settings-card settings-card--logout">
                <button type="button" className="settings-row settings-row--logout" onClick={handleLogout}>
                  <LogOut size={20} aria-hidden />
                  <span>Log out</span>
                </button>
              </section>
            </>
          )}

          {settingsPanel === "preferences" && (
            <section className="card match-prefs-card">
              <fieldset className="intent-fieldset">
                <legend>Preference mode</legend>
                <div className="discover-mode-toggle">
                  {(["flexible", "strict"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={prefs.preferenceMode === mode ? "active" : ""}
                      onClick={() => setPrefs({ ...prefs, preferenceMode: mode })}
                    >
                      {mode === "flexible" ? "Flexible" : "Strict"}
                    </button>
                  ))}
                </div>
              </fieldset>

              <MatchPreferenceFields
                religions={prefs.religions}
                onReligionsChange={(religions) => setPrefs({ ...prefs, religions })}
                ethnicities={prefs.ethnicities}
                onEthnicitiesChange={(ethnicities) => setPrefs({ ...prefs, ethnicities })}
                prefLifestyles={prefs.lifestyles}
                onPrefLifestylesChange={(lifestyles) =>
                  setPrefs({ ...prefs, lifestyles: normalizeLifestyleTraits(lifestyles) })
                }
                searchState={searchStateFromPrefs(prefs)}
                onSearchStateChange={(searchState) =>
                  setPrefs(withSearchStateChange(prefs, searchState))
                }
                searchCities={prefs.cities}
                onSearchCitiesChange={(cities) =>
                  setPrefs({
                    ...prefs,
                    cities: normalizeSearchCities(cities, searchStateFromPrefs(prefs))
                  })
                }
                ageMin={prefs.ageMin ?? 22}
                ageMax={prefs.ageMax ?? 35}
                onAgeRangeChange={(ageMin, ageMax) => setPrefs({ ...prefs, ageMin, ageMax })}
                occupation={prefs.occupations[0]}
                onOccupationChange={(occupation) =>
                  setPrefs({ ...prefs, occupations: occupation ? [occupation] : [] })
                }
                stateOfOrigin={prefs.statesOfOrigin[0]}
                onStateOfOriginChange={(stateOfOrigin) =>
                  setPrefs({ ...prefs, statesOfOrigin: stateOfOrigin ? [stateOfOrigin] : [] })
                }
                relationshipIntentions={prefs.relationshipIntentions}
                onRelationshipIntentionsChange={(relationshipIntentions) =>
                  setPrefs({ ...prefs, relationshipIntentions })
                }
                genotype={prefs.genotypes[0]}
                onGenotypeChange={(genotype) =>
                  setPrefs({ ...prefs, genotypes: genotype ? [genotype] : [] })
                }
                hasKidsOption={prefs.hasKids[0]}
                onHasKidsOptionChange={(hasKidsOption) =>
                  setPrefs({ ...prefs, hasKids: hasKidsOption ? [hasKidsOption] : [] })
                }
                wantsKidsOption={prefs.wantsKids[0]}
                onWantsKidsOptionChange={(wantsKidsOption) =>
                  setPrefs({ ...prefs, wantsKids: wantsKidsOption ? [wantsKidsOption] : [] })
                }
                bodyType={prefs.bodyTypes[0]}
                onBodyTypeChange={(bodyType) =>
                  setPrefs({ ...prefs, bodyTypes: bodyType ? [bodyType] : [] })
                }
                verificationPreferences={prefs.verificationPreferences}
                onVerificationPreferencesChange={(verificationPreferences) =>
                  setPrefs({ ...prefs, verificationPreferences, requireVerified: false })
                }
              />

              <button
                type="button"
                className="btn-primary btn-full"
                onClick={() => triggerSave("preferences")}
                disabled={saveBusy}
              >
                {saveBusy ? "Saving…" : saved && saveFeedback?.success ? "Saved" : BUTTON_COPY.save}
              </button>
              {saveFeedback?.source === "preferences" ? (
                <p
                  className={`profile-save-feedback profile-save-feedback--inline${
                    saveFeedback.success ? " profile-save-feedback--success" : ""
                  }`}
                  role="status"
                >
                  {saveFeedback.text}
                </p>
              ) : null}
            </section>
          )}

          {settingsPanel === "privacy" && (
            <>
              <TwoFactorSettingsCard user={user} onMessage={showModMessage} />
              <section className="card profile-privacy-card">
                {(
                  [
                    ["showReligion", "Show faith on profile"],
                    ["showEthnicity", "Show ethnic background on profile"],
                    ["showState", "Show state on profile"]
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="settings-row settings-row--toggle">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={profile.visibility?.[key] ?? false}
                      onChange={(e) => {
                        const next = {
                          ...profile,
                          visibility: { ...profile.visibility!, [key]: e.target.checked }
                        };
                        setProfile(next);
                        writeJson(STORAGE_KEYS.datingProfile, { ...next, premium: isPremium });
                      }}
                    />
                  </label>
                ))}
              </section>
              <details className="settings-advanced" open>
                <summary>Privacy & Safety controls</summary>
                <SafetySettingsCard
                  profile={profile}
                  onChange={(safetySettings: SafetySettings) => {
                    setProfile({ ...profile, safetySettings });
                    writeJson(STORAGE_KEYS.datingProfile, { ...profile, safetySettings, premium: isPremium });
                  }}
                />
              </details>
            </>
          )}

          {settingsPanel === "notifications" && (
            <section className="card settings-card settings-card--quiet">
              <p className="profile-overview-empty">
                Signal and conversation alerts appear in your notification center.
              </p>
            </section>
          )}

          {settingsPanel === "subscription" && (
            <section className="card settings-card">
              {isPremium ? (
                <>
                  <p className="profile-overview-empty">{PREMIUM_COPY.subscriptionActive}</p>
                  <p className="settings-help-hours">{PREMIUM_COPY.subscriptionManage}</p>
                </>
              ) : (
                <button type="button" className="settings-hub-row settings-hub-row--cta" onClick={onUpgrade}>
                  <span>
                    <strong>Signal Pass</strong>
                    <small>{PREMIUM_COPY.settingsSignalPassHint}</small>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              )}
            </section>
          )}

          {settingsPanel === "help" && (
            <section className="card settings-card settings-card--help">
              <p className="settings-help-intro">
                {getCms().supportWhatsapp
                  ? `Reach us on WhatsApp. ${getCms().supportResponseTime}.`
                  : `Reach us by email. ${getCms().supportResponseTime}.`}
              </p>
              <p className="settings-help-hours">{getCms().supportHours}</p>
              <ContactForm
                className="contact-form--embedded"
                initialName={user.name}
                initialEmail={user.email}
                defaultTopic="Account help"
                onSuccess={handleHelpComplete}
                successActionLabel="Back to dashboard"
              />
            </section>
          )}

          {settingsPanel === "about" && (
            <section className="card settings-card settings-card--quiet settings-about-card">
              <p className="settings-about__app">BamSignal</p>
              <p className="settings-about__version">
                Version {BUILD_VERSION} <span className="settings-about__code">({BUILD_CODE})</span>
              </p>
              <p className="settings-about__time">
                Built{" "}
                {(APP_BUILD_TIME || BUILD_TIME).slice(0, 19).replace("T", " ")} UTC
              </p>
              <p className="settings-about__label">{APP_BUILD_LABEL}</p>
              <p className="settings-about__meta">Bundle {APP_BUILD_ID}</p>
              <p className="settings-about__meta">Cache {CACHE_VERSION}</p>
            </section>
          )}

          {settingsPanel === "verification" && (
            <PhoneVerificationPanel
              user={user}
              phoneVerified={phoneVerified}
              profilePhoto={resolveProfileMainPhoto(profile) || undefined}
              verificationStatus={
                profile.verified
                  ? "approved"
                  : profile.verificationStatus || (verifyPending ? "pending" : "none")
              }
              onPhoneVerified={handlePhoneVerified}
              onSelfieSubmitted={handleSelfieSubmitted}
              onMessage={showModMessage}
            />
          )}

          {settingsPanel === "account" && (
            <>
              <ProfileAccountPanel
                user={user}
                profile={profile}
                isPremium={isPremium}
                onProfileChange={setProfile}
                onUsernameChange={(username) => {
                  const nextUser = { ...user, username };
                  writeJson(STORAGE_KEYS.userProfile, nextUser);
                  onUserChange(nextUser);
                }}
                onLogout={handleLogout}
                onMessage={showModMessage}
              />
              <section className="card settings-card">
                <button type="button" className="settings-row" onClick={onToggleTheme}>
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </button>
                <button type="button" className="settings-row settings-row--logout" onClick={handleLogout}>
                  <LogOut size={20} />
                  <span>Log out</span>
                </button>
              </section>
            </>
          )}
        </>
      )}

      <ProfileBoostSheet
        open={boostSheetOpen}
        onClose={() => setBoostSheetOpen(false)}
        onPurchase={handlePurchaseBoost}
        loading={boostCheckoutLoading}
        memberCity={memberCity}
      />

      <FastConnectionSheet
        open={fastConnectionSheetOpen}
        onClose={closeFastConnectionSheet}
        onContinuePayment={() => void continueFastConnectionPayment()}
        loading={fastConnectionLoading}
      />
    </div>
  );
}
