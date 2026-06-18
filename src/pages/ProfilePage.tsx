import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MAX_INTENT_SELECTIONS, INTENT_OPTIONS, intentDisplay, profileIntentLabel } from "../constants/intents";
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
  normalizeLifestyleTraits,
  stateDisplayLabel
} from "../constants/profileOptions";
import { ProfileCoverHeader } from "../components/ProfileCoverHeader";
import { ProfileIdentityStrip } from "../components/ProfileIdentityStrip";
import { ProfileInterestsPreview } from "../components/profile/ProfileInterestsPreview";
import { ProfileDetailsList } from "../components/profile/ProfileDetailsList";
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
import { BUTTON_COPY } from "../constants/copy";
import { getCms } from "../constants/cms";
import { USER_MESSAGES } from "../constants/userMessages";
import { getVerificationTier } from "../utils/verification";
import { normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
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
import { MAX_PROFILE_PHOTOS, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import { safeCoverPhoto } from "../utils/safeProfile";
import { syncMemberProfileRemote } from "../services/cityHome";
import { ProfileAccountPanel } from "../components/profile/ProfileAccountPanel";
import { ProfilePromptsEditor, ProfilePromptsDisplay } from "../components/profile/ProfilePromptsEditor";
import { hasFilledProfileDetails } from "../utils/profileDetails";

type ProfileView = "overview" | "edit" | "settings";
type SettingsPanel = "hub" | "account" | "privacy" | "notifications" | "preferences" | "verification" | "subscription" | "help";
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
  const count = [
    profile.ethnicity,
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

function SettingsRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="settings-hub-row" onClick={onClick}>
      <span>
        <strong>{label}</strong>
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
  onUpgrade
}: ProfilePageProps) {
  const [profile, setProfile] = useState<DatingProfile>(() =>
    normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}))
  );
  const [prefs, setPrefs] = useState<MatchPreferences>(() =>
    normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}))
  );
  const [saved, setSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [modMessage, setModMessage] = useState("");
  const [view, setView] = useState<ProfileView>("overview");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("hub");
  const [editOpen, setEditOpen] = useState<EditSection | null>(null);
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

  const save = async () => {
    if (saveBusy) return;
    const nameError = validateDisplayName(user.name);
    if (nameError) {
      showModMessage(nameError);
      return;
    }
    const bioError = validateUserText(profile.bio);
    if (bioError) {
      showModMessage(bioError);
      return;
    }
    const profileLeak = validateProfileContactLeaks(profile, user);
    if (profileLeak.blocked) {
      showModMessage(CONTACT_LEAK_BLOCK_MESSAGE);
      return;
    }
    setSaveBusy(true);
    try {
      const normalized = normalizeDatingProfile({ ...profile, premium: isPremium });
      writeJson(STORAGE_KEYS.datingProfile, normalized);
      writeJson(STORAGE_KEYS.matchPreferences, prefs);
      const synced = await syncMemberProfileRemote(user, normalized);
      onUserChange({ ...user, name: user.name });
      if (!synced) {
        showModMessage(USER_MESSAGES.profileSaveFailed);
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaveBusy(false);
    }
  };

  const showModMessage = (msg: string) => {
    setModMessage(msg);
    window.setTimeout(() => setModMessage(""), 4000);
  };

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
    setProfile((p) => {
      if (p.intents.includes(intent)) {
        return { ...p, intents: p.intents.filter((i) => i !== intent) };
      }
      if (p.intents.length >= MAX_INTENT_SELECTIONS) return p;
      return { ...p, intents: [...p.intents, intent] };
    });
  };

  const handleLogout = async () => {
    onLogout();
  };

  const openSettings = (panel: SettingsPanel = "hub") => {
    setSettingsPanel(panel);
    setView("settings");
  };

  const toggleEditSection = (id: EditSection) => {
    setEditOpen((current) => (current === id ? null : id));
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

  return (
    <div className={`page profile-page profile-page--hero member-content-pad ${view === "edit" ? "profile-page--editing" : ""}`}>
      {modMessage && (
        <p className="profile-mod-toast" role="status">
          {modMessage}
        </p>
      )}

      {view === "overview" && (
        <>
          <ProfileCoverHeader user={user} profile={profile} verification={verification} coverOnly />
          <ProfileIdentityStrip user={user} profile={profile} verification={verification} />

          <div className="profile-overview-sections profile-overview-sections--clean">
            {profile.bio?.trim() ? (
              <section className="profile-overview-block">
                <h3>About</h3>
                <p className="profile-overview-bio">{profile.bio}</p>
              </section>
            ) : null}

            {profile.interests?.length > 0 ? (
              <section className="profile-overview-block profile-read-section">
                <h3 className="profile-read__heading">Interests</h3>
                <ProfileInterestsPreview interests={profile.interests} />
              </section>
            ) : null}

            {profile.intents.length > 0 ? (
              <section className="profile-overview-block profile-read-section">
                <h3 className="profile-read__heading">Looking For</h3>
                <div className="profile-read-chips">
                  {profile.intents.slice(0, MAX_INTENT_SELECTIONS).map((intent) => (
                    <span key={intent} className="profile-read-chip profile-read-chip--intent">
                      {profileIntentLabel(intent)}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {hasFilledProfileDetails(profile) ? (
              <section className="profile-overview-block profile-overview-block--facts">
                <ProfileDetailsList profile={profile} variant="chips" />
              </section>
            ) : null}
          {profile.profilePrompts?.filter((p) => p.answer.trim()).length ? (
            <section className="profile-overview-block">
              <h3>Prompts</h3>
              <ProfilePromptsDisplay prompts={profile.profilePrompts} />
            </section>
          ) : null}

            {profile.voiceIntroUrl ? (
              <section className="profile-overview-block">
                <h3>Voice intro</h3>
                <VoiceIntro url={profile.voiceIntroUrl} label="Listen" />
              </section>
            ) : null}
          </div>

          <div className="profile-edit-cta profile-edit-cta--split">
            <button type="button" className="btn-primary btn-full" onClick={() => setView("edit")}>
              Edit profile
            </button>
            <button type="button" className="btn-secondary btn-full" onClick={() => openSettings()}>
              Settings
            </button>
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
            <h4 className="profile-form-row__label">Cover photo</h4>
            <CoverPhotoUpload
              coverPhoto={profile.coverPhoto}
              photoMeta={profile.photoMeta}
              profilePhotos={profile.photos}
              onChange={(coverPhoto, nextPhotoMeta) => {
                setProfile((p) => {
                  const persistable = safeCoverPhoto(coverPhoto);
                  const next = normalizeDatingProfile({
                    ...p,
                    coverPhoto: persistable,
                    coverPhotoExplicit: Boolean(persistable),
                    photoMeta: nextPhotoMeta ?? p.photoMeta
                  });
                  if (!writeJson(STORAGE_KEYS.datingProfile, next)) {
                    showModMessage(PHOTO_UPLOAD_FAIL);
                    return p;
                  }
                  syncMemberProfileRemote(user, next);
                  return next;
                });
              }}
              onModerationMessage={showModMessage}
            />
            <h4 className="profile-form-row__label">Profile photos</h4>
            <PhotoUploadGrid
              photos={profile.photos}
              photoMeta={profile.photoMeta}
              coverPhoto={profile.coverPhoto}
              onChange={(photos, nextPhotoMeta) => {
                setProfile((p) => {
                  const next = normalizeDatingProfile({
                    ...p,
                    photos,
                    photoMeta: nextPhotoMeta ?? p.photoMeta
                  });
                  if (!writeJson(STORAGE_KEYS.datingProfile, next)) {
                    showModMessage(PHOTO_UPLOAD_FAIL);
                    return p;
                  }
                  syncMemberProfileRemote(user, next);
                  return next;
                });
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
                      onClick={() => toggleIntent(opt.id)}
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
              tribe={profile.ethnicity}
              onTribeChange={(ethnicity) => setProfile({ ...profile, ethnicity })}
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
              occupations={
                profile.occupations ?? (profile.occupation ? [profile.occupation] : [])
              }
              onOccupationsChange={(occupations) =>
                setProfile({
                  ...profile,
                  occupations,
                  occupation: occupations[0]
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
              genotypes={profile.genotypes ?? (profile.genotype ? [profile.genotype] : [])}
              onGenotypesChange={(genotypes) =>
                setProfile({
                  ...profile,
                  genotypes,
                  genotype: genotypes[0]
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
              onRecorded={(url) => setProfile({ ...profile, voiceIntroUrl: url })}
              onClear={() => setProfile({ ...profile, voiceIntroUrl: undefined })}
              onRejected={showModMessage}
            />
          </EditAccordion>

          <div className="profile-edit-save-bar">
            <button type="button" className="btn-primary btn-full" onClick={() => void save()} disabled={saveBusy}>
              {saveBusy ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
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
                            : "Settings"}
          </h2>

          {settingsPanel === "hub" && (
            <>
              <section className="card settings-hub-card">
                <SettingsRow label="Account" onClick={() => setSettingsPanel("account")} />
                <SettingsRow label="Privacy & Safety" onClick={() => setSettingsPanel("privacy")} />
                <SettingsRow label="Notifications" onClick={() => setSettingsPanel("notifications")} />
                <SettingsRow label="Preferences" onClick={() => setSettingsPanel("preferences")} />
                <SettingsRow label="Verification" onClick={() => setSettingsPanel("verification")} />
                <SettingsRow label="Subscription" onClick={() => setSettingsPanel("subscription")} />
                <SettingsRow label="Help" onClick={() => setSettingsPanel("help")} />
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
                onOccupationsChange={(occupations) => setPrefs({ ...prefs, occupations })}
                statesOfOrigin={prefs.statesOfOrigin}
                onStatesOfOriginChange={(statesOfOrigin) => setPrefs({ ...prefs, statesOfOrigin })}
                relationshipIntentions={prefs.relationshipIntentions}
                onRelationshipIntentionsChange={(relationshipIntentions) =>
                  setPrefs({ ...prefs, relationshipIntentions })
                }
                genotypes={prefs.genotypes}
                onGenotypesChange={(genotypes) => setPrefs({ ...prefs, genotypes })}
                hasKids={prefs.hasKids}
                onHasKidsChange={(hasKids) => setPrefs({ ...prefs, hasKids })}
                wantsKids={prefs.wantsKids}
                onWantsKidsChange={(wantsKids) => setPrefs({ ...prefs, wantsKids })}
                bodyTypes={prefs.bodyTypes}
                onBodyTypesChange={(bodyTypes) => setPrefs({ ...prefs, bodyTypes })}
                verificationPreferences={prefs.verificationPreferences}
                onVerificationPreferencesChange={(verificationPreferences) =>
                  setPrefs({ ...prefs, verificationPreferences, requireVerified: false })
                }
              />

              <button type="button" className="btn-primary btn-full" onClick={save}>
                {BUTTON_COPY.save}
              </button>
            </section>
          )}

          {settingsPanel === "privacy" && (
            <>
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
                <p className="profile-overview-empty">Signal Pass is active on your account.</p>
              ) : (
                <button type="button" className="settings-row" onClick={onUpgrade}>
                  <span>Get Signal Pass</span>
                </button>
              )}
            </section>
          )}

          {settingsPanel === "help" && (
            <section className="card settings-card settings-card--quiet">
              <p className="profile-overview-empty">
                {getCms().supportWhatsapp
                  ? `Reach us on WhatsApp. ${getCms().supportResponseTime}.`
                  : `We're here to help. ${getCms().supportResponseTime}.`}
              </p>
              <p className="profile-overview-empty">{getCms().supportHours}</p>
            </section>
          )}

          {settingsPanel === "verification" && (
            <PhoneVerificationPanel
              user={user}
              phoneVerified={phoneVerified}
              profilePhoto={profile.photos[0]}
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
    </div>
  );
}
