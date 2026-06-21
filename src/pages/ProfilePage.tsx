import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Moon, Settings, Sun } from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { profileIntentLabel } from "../constants/intents";
import { WHAT_BRINGS_ME_HERE_TITLE } from "../constants/relationshipIntent";
import { WhatBringsYouHerePicker } from "../components/relationshipIntent/WhatBringsYouHerePicker";
import { WhatBringsYouHereEmptyCard } from "../components/relationshipIntent/WhatBringsYouHereEmptyCard";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import {
  LazyCoverPhotoUpload,
  LazyPhotoUploadGrid,
  LazyProfileAccountPanel,
  LazySafetySettingsCard,
  LazyTwoFactorSettingsCard
} from "../components/lazyProfileUi";
import { VoiceVibeEmptyCard } from "../components/voice/VoiceVibeEmptyCard";
import { VoiceVibeWaveformCard } from "../components/voice/VoiceVibeWaveformCard";
import { TrustedMemberFlow } from "../components/trusted/TrustedMemberFlow";
import { WhyTrustedMemberCard } from "../components/trusted/WhyTrustedMemberCard";
import { MatchPreferenceFields } from "../components/preferences/MatchPreferenceFields";
import { TapSelectField } from "../components/TapSelectField";
import { searchStateFromPrefs, withSearchStateChange, normalizeSearchCities } from "../utils/searchLocationPrefs";
import {
  citiesForState,
  cityBelongsToState,
  NIGERIAN_STATES,
  normalizeEthnicities,
  normalizeLifestyleTraits,
  normalizeOccupations,
  normalizeStatesOfOrigin,
  normalizeGenotypes,
  normalizeHasKidsOptions,
  normalizeWantsKidsOptions,
  normalizeBodyTypes,
  stateDisplayLabel
} from "../constants/profileOptions";
import { ProfileCoverHeader } from "../components/ProfileCoverHeader";
import { ProfilePhotoProgressCard } from "../components/profilePhoto/ProfilePhotoProgressCard";
import { ProfileStrengthCard } from "../components/profile/ProfileStrengthCard";
import { ActivityHighlightsCard } from "../components/activity/ActivityHighlightsCard";
import { SavedProfilesPreview } from "../components/savedProfiles/SavedProfilesPreview";
import { buildActivityHighlights } from "../utils/buildActivityHighlights";
import { IncompleteProfileChecklist } from "../components/profile/IncompleteProfileChecklist";
import { ProfileInterestsPreview } from "../components/profile/ProfileInterestsPreview";
import { MoreAboutMePicker } from "../components/moreAboutMe/MoreAboutMePicker";
import { MoreAboutMeEmptyCard } from "../components/moreAboutMe/MoreAboutMeEmptyCard";
import { normalizeMoreAboutMeInterests } from "../utils/moreAboutMe";
import { MORE_ABOUT_ME_TITLE } from "../constants/moreAboutMe";
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
import { navigateToPath } from "../constants/routes";
import { getVoiceVibeDuration, getVoiceVibeUrl, hasVoiceVibe } from "../utils/voiceVibe";
import { getVerificationTier } from "../utils/verification";
import { isTrustedMember, isTrustedMemberPending } from "../utils/trustedMember";
import { normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { resolveProfileMainPhoto } from "../utils/mainPhoto";
import {
  CONTACT_LEAK_BLOCK_MESSAGE,
  validateDisplayName,
  validateProfileContactLeaks,
  validateUserText
} from "../utils/contactGuard";
import { readJson, writeJson } from "../utils/storage";
import {
  isUserVerificationApproved,
  isUserVerificationPending
} from "../utils/verificationQueue";
import { notifyVerificationApproved } from "../utils/notifyHelpers";
import { MAX_PROFILE_PHOTOS } from "../constants/photos";
import { persistCoverPhotoChange } from "../utils/persistCoverPhoto";
import { syncMemberProfileRemote, syncMemberProfileWithResult } from "../services/cityHome";
import { revalidateMemberProfileAfterUpdate } from "../services/memberProfileSync";
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
import {
  FastConnectionPurchaseHistory,
  type FastConnectionPurchaseRecord
} from "../components/profile/FastConnectionPurchaseHistory";
import { fetchFastConnectionPurchaseHistory } from "../services/fastConnectionPool";

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
  const count = normalizeMoreAboutMeInterests(interests).length;
  if (!count) return "Not added yet";
  return `${count} selected`;
}

function intentHint(intents: IntentTag[]): string {
  const relationship = relationshipIntentsFrom(intents);
  if (!relationship.length) return "Not set yet";
  if (relationship.length === 1) return profileIntentLabel(relationship[0]);
  return `${relationship.length} selected`;
}

function voiceHint(url?: string): string {
  return url ? "Added" : "Not added yet";
}

function openVoiceVibePage() {
  navigateToPath("/voice-vibe");
}

function openTrustedMemberPage() {
  navigateToPath("/trusted-member");
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
  const [fastConnectionPurchases, setFastConnectionPurchases] = useState<FastConnectionPurchaseRecord[]>([]);
  const [fastConnectionHistoryLoading, setFastConnectionHistoryLoading] = useState(false);

  const profileCityOptions = useMemo(
    () => (profile.state ? citiesForState(profile.state) : []),
    [profile.state]
  );

  useEffect(() => {
    if (settingsPanel !== "subscription") return;
    setFastConnectionHistoryLoading(true);
    void fetchFastConnectionPurchaseHistory(user).then((result) => {
      setFastConnectionPurchases(result.purchases || []);
      setFastConnectionHistoryLoading(false);
    });
  }, [settingsPanel, user]);

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
    void syncMemberProfileWithResult(user, normalized, { patchScope: "photos" }).then(async (synced) => {
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
      const synced = await syncMemberProfileWithResult(user, normalized, { patchScope: "profile" });
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
    openTrustedMemberPage();
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
      syncMemberProfileRemote(user, next, { patchScope: "profile" });
      return next;
    });
    setVerifySubmitted(true);
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

  useEffect(() => {
    const pending = localStorage.getItem(STORAGE_KEYS.profileEditSection);
    if (pending === "photos") {
      localStorage.removeItem(STORAGE_KEYS.profileEditSection);
      openEdit("photos");
    }
  }, []);

  const phoneVerified = Boolean(user.phoneVerified);
  const verification = getVerificationTier(profile, isPremium, phoneVerified);

  const activityHighlights = useMemo(
    () =>
      buildActivityHighlights(profile, {
        phoneVerified,
        isPremium
      }),
    [profile, phoneVerified, isPremium]
  );

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
            onAddVoiceVibe={openVoiceVibePage}
          />

          <ActivityHighlightsCard
            highlights={activityHighlights}
            variant="profile"
            className="profile-page__activity-highlights"
          />

          <SavedProfilesPreview viewerCity={profile.city} />

          <ProfilePhotoProgressCard
            profile={profile}
            onAddPhotos={() => openEdit("photos")}
            className="profile-page__photo-progress"
          />

          <ProfileStrengthCard
            profile={profile}
            phoneVerified={phoneVerified}
            isPremium={isPremium}
            className="profile-page__strength"
            onImprove={() => setView("edit")}
          />

          <IncompleteProfileChecklist
            profile={profile}
            phoneVerified={phoneVerified}
            isPremium={isPremium}
          />

          {!isTrustedMember(profile) ? (
            isTrustedMemberPending(profile) ? (
              <section className="profile-trusted-empty card">
                <p className="profile-trusted-empty__label">Review in progress</p>
                <p className="why-trusted-member-card__hint">
                  Your verification photo remains private and is never shown publicly.
                </p>
              </section>
            ) : (
              <WhyTrustedMemberCard onBecome={openTrustedMemberPage} />
            )
          ) : null}

          {!relationshipIntentsFrom(profile.intents).length ? (
            <WhatBringsYouHereEmptyCard onSet={() => openEdit("intent")} />
          ) : null}

          {!normalizeMoreAboutMeInterests(profile.interests).length ? (
            <MoreAboutMeEmptyCard onAdd={() => openEdit("interests")} />
          ) : null}

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

            {normalizeMoreAboutMeInterests(profile.interests).length > 0 ? (
              <ProfileOverviewCard title={MORE_ABOUT_ME_TITLE} onEdit={() => openEdit("interests")}>
                <ProfileInterestsPreview interests={profile.interests} variant="premium" />
              </ProfileOverviewCard>
            ) : null}

            {relationshipIntentsFrom(profile.intents).length > 0 ? (
              <ProfileOverviewCard title={WHAT_BRINGS_ME_HERE_TITLE} onEdit={() => openEdit("intent")}>
                <div className="profile-premium-pills profile-premium-pills--intent">
                  {relationshipIntentsFrom(profile.intents).map((intent) => (
                    <span key={intent} className="profile-premium-pill profile-premium-pill--outline">
                      {profileIntentLabel(intent)}
                    </span>
                  ))}
                </div>
              </ProfileOverviewCard>
            ) : null}

            <ProfileOverviewCard title="Voice Vibe" onEdit={openVoiceVibePage}>
              {hasVoiceVibe(profile) && getVoiceVibeUrl(profile) ? (
                <VoiceVibeWaveformCard
                  url={getVoiceVibeUrl(profile)!}
                  duration={getVoiceVibeDuration(profile)}
                  variant="card"
                />
              ) : (
                <VoiceVibeEmptyCard onAdd={openVoiceVibePage} />
              )}
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
            <Suspense fallback={null}>
              <LazyCoverPhotoUpload
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
            </Suspense>
            <h4 className="profile-form-row__label">Profile photos</h4>
            <Suspense fallback={null}>
              <LazyPhotoUploadGrid
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
            </Suspense>
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
            title={MORE_ABOUT_ME_TITLE}
            hint={interestsHint(profile.interests)}
            open={editOpen === "interests"}
            onToggle={toggleEditSection}
          >
            <MoreAboutMePicker
              selected={profile.interests ?? []}
              onChange={(interests) => setProfile({ ...profile, interests, interestsTouched: true })}
            />
          </EditAccordion>

          <EditAccordion
            id="intent"
            title={WHAT_BRINGS_ME_HERE_TITLE}
            hint={intentHint(profile.intents)}
            open={editOpen === "intent"}
            onToggle={toggleEditSection}
          >
            {fastConnectionStatus ? (
              <p className="profile-fast-connection-status" role="status">
                {fastConnectionStatus}
              </p>
            ) : null}
            <WhatBringsYouHerePicker
              value={profile.intents}
              showHeader={false}
              onChange={(intents) => setProfile({ ...profile, intents })}
              onLimitMessage={showModMessage}
            />
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
              occupations={normalizeOccupations(profile.occupations, profile.occupation)}
              onOccupationsChange={(occupations) => {
                const normalized = normalizeOccupations(occupations);
                setProfile({
                  ...profile,
                  occupations: normalized,
                  occupation: normalized[0]
                });
              }}
              statesOfOrigin={normalizeStatesOfOrigin(profile.statesOfOrigin, profile.stateOfOrigin)}
              onStatesOfOriginChange={(statesOfOrigin) => {
                const normalized = normalizeStatesOfOrigin(statesOfOrigin);
                setProfile({
                  ...profile,
                  statesOfOrigin: normalized,
                  stateOfOrigin: normalized[0]
                });
              }}
              genotypes={normalizeGenotypes(profile.genotypes, profile.genotype)}
              onGenotypesChange={(genotypes) => {
                const normalized = normalizeGenotypes(genotypes);
                setProfile({
                  ...profile,
                  genotypes: normalized,
                  genotype: normalized[0]
                });
              }}
              hasKids={normalizeHasKidsOptions(profile.hasKidsOptions)}
              onHasKidsChange={(hasKids) =>
                setProfile({
                  ...profile,
                  hasKidsOptions: normalizeHasKidsOptions(hasKids)
                })
              }
              wantsKids={normalizeWantsKidsOptions(profile.wantsKidsOptions)}
              onWantsKidsChange={(wantsKids) =>
                setProfile({
                  ...profile,
                  wantsKidsOptions: normalizeWantsKidsOptions(wantsKids)
                })
              }
              bodyTypes={normalizeBodyTypes(profile.bodyTypes)}
              onBodyTypesChange={(bodyTypes) =>
                setProfile({ ...profile, bodyTypes: normalizeBodyTypes(bodyTypes) })
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
            title="Voice Vibe"
            hint={voiceHint(getVoiceVibeUrl(profile))}
            open={editOpen === "voice"}
            onToggle={toggleEditSection}
          >
            <p className="profile-edit-voice-copy">
              Record a short Voice Vibe so people can hear your personality before they signal you.
            </p>
            <button type="button" className="btn-primary" onClick={openVoiceVibePage}>
              {hasVoiceVibe(profile) ? "Manage Voice Vibe" : "Add Voice Vibe"}
            </button>
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
                        ? "Trusted Member"
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
                <SettingsRow label="Trusted Member" onClick={() => setSettingsPanel("verification")} />
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
                occupations={prefs.occupations}
                onOccupationsChange={(occupations) =>
                  setPrefs({ ...prefs, occupations: normalizeOccupations(occupations) })
                }
                statesOfOrigin={prefs.statesOfOrigin}
                onStatesOfOriginChange={(statesOfOrigin) =>
                  setPrefs({ ...prefs, statesOfOrigin: normalizeStatesOfOrigin(statesOfOrigin) })
                }
                relationshipIntentions={prefs.relationshipIntentions}
                onRelationshipIntentionsChange={(relationshipIntentions) =>
                  setPrefs({ ...prefs, relationshipIntentions })
                }
                genotypes={prefs.genotypes}
                onGenotypesChange={(genotypes) =>
                  setPrefs({ ...prefs, genotypes: normalizeGenotypes(genotypes) })
                }
                hasKids={prefs.hasKids}
                onHasKidsChange={(hasKids) =>
                  setPrefs({ ...prefs, hasKids: normalizeHasKidsOptions(hasKids) })
                }
                wantsKids={prefs.wantsKids}
                onWantsKidsChange={(wantsKids) =>
                  setPrefs({ ...prefs, wantsKids: normalizeWantsKidsOptions(wantsKids) })
                }
                bodyTypes={prefs.bodyTypes}
                onBodyTypesChange={(bodyTypes) =>
                  setPrefs({ ...prefs, bodyTypes: normalizeBodyTypes(bodyTypes) })
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
              <Suspense fallback={null}>
                <LazyTwoFactorSettingsCard user={user} onMessage={showModMessage} />
              </Suspense>
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
                <Suspense fallback={null}>
                  <LazySafetySettingsCard
                  profile={profile}
                  onChange={(safetySettings: SafetySettings) => {
                    setProfile({ ...profile, safetySettings });
                    writeJson(STORAGE_KEYS.datingProfile, { ...profile, safetySettings, premium: isPremium });
                  }}
                  />
                </Suspense>
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
              <FastConnectionPurchaseHistory
                purchases={fastConnectionPurchases}
                loading={fastConnectionHistoryLoading}
              />
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
            <TrustedMemberFlow
              user={user}
              phoneVerified={phoneVerified}
              profilePhoto={resolveProfileMainPhoto(profile) || undefined}
              verificationStatus={
                profile.verified
                  ? "approved"
                  : profile.verificationStatus || (verifyPending ? "pending" : "none")
              }
              verified={profile.verified}
              verificationSelfie={profile.verificationSelfie}
              onPhoneVerified={handlePhoneVerified}
              onSelfieSubmitted={handleSelfieSubmitted}
              onMessage={showModMessage}
              onComplete={() => setSettingsPanel("hub")}
            />
          )}

          {settingsPanel === "account" && (
            <>
              <Suspense fallback={null}>
                <LazyProfileAccountPanel
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
              </Suspense>
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
