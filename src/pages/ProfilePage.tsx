import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { MAX_INTENT_SELECTIONS, INTENT_OPTIONS, intentDisplay } from "../constants/intents";
import { DateOfBirthPicker } from "../components/DateOfBirthPicker";
import { PhotoUploadGrid } from "../components/PhotoUploadGrid";
import { CoverPhotoUpload } from "../components/CoverPhotoUpload";
import { PhoneVerificationPanel } from "../components/PhoneVerificationPanel";
import {
  ALL_NIGERIAN_CITIES,
  ETHNIC_BACKGROUNDS,
  FILTER_ETHNICITIES,
  FILTER_KIDS_PREFERENCES,
  FILTER_LIFESTYLES,
  FILTER_RELIGIONS,
  GENOTYPES,
  KIDS_PREFERENCES,
  NIGERIAN_STATES,
  OCCUPATIONS,
  citiesForState,
  RELIGIONS,
  SOCIAL_LIFESTYLES
} from "../constants/profileOptions";
import { ProfileCoverHeader } from "../components/ProfileCoverHeader";
import { ProfileIdentityStrip } from "../components/ProfileIdentityStrip";
import { ProfileDetailsList } from "../components/profile/ProfileDetailsList";
import { InterestPicker } from "../components/InterestPicker";
import { VoiceIntroRecorder } from "../components/VoiceIntro";
import { VoiceIntro } from "../components/VoiceIntro";
import type {
  DatingProfile,
  EthnicBackground,
  Gender,
  Genotype,
  IntentTag,
  KidsPreference,
  LookingFor,
  MatchPreferences,
  Occupation,
  Religion,
  SafetySettings,
  SocialLifestyle,
  Theme,
  UserProfile
} from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { getVerificationTier } from "../utils/verification";
import { normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { readJson, writeJson } from "../utils/storage";
import { SafetySettingsCard } from "../components/SafetySettingsCard";
import {
  isUserVerificationApproved,
  isUserVerificationPending
} from "../utils/verificationQueue";
import { notifyVerificationApproved } from "../utils/notifyHelpers";
import { StateCitySelect } from "../components/StateCitySelect";
import { MAX_PROFILE_PHOTOS, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import { isAdultDob } from "../utils/ageFromDob";
import { syncMemberProfileRemote } from "../services/cityHome";
import { hasFilledProfileDetails } from "../utils/profileDetails";

const GENDERS: Gender[] = ["Man", "Woman", "Non-binary"];
const LOOKING: LookingFor[] = ["Men", "Women"];

type ProfileView = "overview" | "edit" | "settings";
type SettingsPanel = "hub" | "preferences" | "privacy" | "account" | "notifications" | "verification";
type EditSection = "basic" | "photos" | "bio" | "interests" | "intent" | "details" | "voice";

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
  const [modMessage, setModMessage] = useState("");
  const [view, setView] = useState<ProfileView>("overview");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("hub");
  const [prefsStatePick, setPrefsStatePick] = useState(prefs.states[0] ?? "");
  const [editOpen, setEditOpen] = useState<EditSection | null>(null);
  const [verifySubmitted, setVerifySubmitted] = useState(
    () => profile.verificationStatus === "pending" || isUserVerificationPending(user.phone)
  );
  const verifyPending =
    verifySubmitted ||
    profile.verificationStatus === "pending" ||
    isUserVerificationPending(user.phone);

  useEffect(() => {
    if (profile.verified || !user.phone) return;
    if (isUserVerificationApproved(user.phone)) {
      setProfile((p) => ({ ...p, verified: true }));
      notifyVerificationApproved();
    }
  }, [user.phone, profile.verified]);

  const save = () => {
    const normalized = normalizeDatingProfile({ ...profile, premium: isPremium });
    writeJson(STORAGE_KEYS.datingProfile, normalized);
    writeJson(STORAGE_KEYS.matchPreferences, prefs);
    syncMemberProfileRemote(user, normalized);
    onUserChange({ ...user, name: user.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  const togglePref = <T extends string>(key: keyof MatchPreferences, value: T) => {
    setPrefs((p) => {
      const list = (p[key] as T[]) ?? [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...p, [key]: next };
    });
  };

  const togglePrefCity = (city: string) => {
    setPrefs((p) => ({
      ...p,
      cities: p.cities.includes(city) ? p.cities.filter((c) => c !== city) : [...p.cities, city]
    }));
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

          <div className="profile-overview-sections">
            <section className="profile-overview-block">
              <h3>About</h3>
              <p className="profile-overview-bio">
                {profile.bio || "Tell people a little about yourself."}
              </p>
            </section>

            <section className="profile-overview-block">
              <h3>Interests</h3>
              {profile.interests?.length > 0 ? (
                <div className="intent-tags">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="intent-tag selected">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="profile-overview-empty">Choose a few interests.</p>
              )}
            </section>

            <section className="profile-overview-block">
              <h3>Looking for</h3>
              {profile.intents.length > 0 ? (
                <div className="intent-tags">
                  {profile.intents.slice(0, MAX_INTENT_SELECTIONS).map((intent) => (
                    <span key={intent} className="intent-tag selected">
                      {intentDisplay(intent)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="profile-overview-empty">Add what you&apos;re open to.</p>
              )}
            </section>

            {hasFilledProfileDetails(profile) ? (
              <section className="profile-overview-block">
                <h3>Details</h3>
                <ProfileDetailsList profile={profile} />
              </section>
            ) : null}

            <section className="profile-overview-block">
              <h3>Voice intro</h3>
              {profile.voiceIntroUrl ? (
                <VoiceIntro url={profile.voiceIntroUrl} />
              ) : (
                <p className="profile-overview-empty">Record a short intro.</p>
              )}
            </section>
          </div>

          <div className="profile-edit-cta">
            <button type="button" className="btn-primary btn-full" onClick={() => setView("edit")}>
              Edit Profile
            </button>
          </div>

          <div className="profile-overview-footer">
            <button type="button" className="profile-logout-link" onClick={handleLogout}>
              <LogOut size={16} aria-hidden />
              Log out
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
              <div className="profile-form-row profile-form-row--dob">
                <DateOfBirthPicker
                  value={profile.dateOfBirth ?? ""}
                  onChange={(iso, age) =>
                    setProfile((p) => ({
                      ...p,
                      dateOfBirth: iso,
                      age: age ?? p.age
                    }))
                  }
                />
              </div>
              <fieldset className="intent-fieldset profile-form-row">
                <legend>Gender</legend>
                <div className="intent-tags selectable">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`intent-tag ${profile.gender === g ? "selected" : ""}`}
                      onClick={() => setProfile({ ...profile, gender: g })}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="profile-form-row profile-form-row--location">
                <span className="profile-form-row__label">Location</span>
                <StateCitySelect
                  state={profile.state ?? ""}
                  city={profile.city}
                  onLocationChange={(state, city) => setProfile({ ...profile, state, city })}
                />
              </div>
              <fieldset className="intent-fieldset profile-form-row">
                <legend>Interested in</legend>
                <div className="intent-tags selectable">
                  {LOOKING.map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={`intent-tag ${profile.lookingFor === l ? "selected" : ""}`}
                      onClick={() => setProfile({ ...profile, lookingFor: l })}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
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
              profilePhotos={profile.photos}
              onChange={(coverPhoto) => {
                setProfile((p) => {
                  const next = normalizeDatingProfile({
                    ...p,
                    coverPhoto,
                    coverPhotoExplicit: Boolean(coverPhoto)
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
              coverPhoto={profile.coverPhoto}
              onChange={(photos) => {
                setProfile((p) => {
                  const next = normalizeDatingProfile({ ...p, photos });
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
              selected={profile.interests ?? []}
              onChange={(interests) => setProfile({ ...profile, interests })}
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
            title="Details"
            hint={detailsHint(profile)}
            open={editOpen === "details"}
            onToggle={toggleEditSection}
          >
            <p className="profile-form-row__hint">Optional — helps people find you in Advanced Search.</p>

            <fieldset className="intent-fieldset profile-form-row">
              <legend>Tribe</legend>
              <div className="intent-tags selectable match-prefs-scroll">
                {ETHNIC_BACKGROUNDS.map((tribe) => (
                  <button
                    key={tribe}
                    type="button"
                    className={`intent-tag ${profile.ethnicity === tribe ? "selected" : ""}`}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        ethnicity: profile.ethnicity === tribe ? undefined : (tribe as EthnicBackground)
                      })
                    }
                  >
                    {tribe}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset profile-form-row">
              <legend>Religion</legend>
              <div className="intent-tags selectable">
                {RELIGIONS.map((religion) => (
                  <button
                    key={religion}
                    type="button"
                    className={`intent-tag ${profile.religion === religion ? "selected" : ""}`}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        religion: profile.religion === religion ? undefined : (religion as Religion)
                      })
                    }
                  >
                    {religion}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset profile-form-row">
              <legend>Occupation</legend>
              <div className="intent-tags selectable match-prefs-scroll">
                {OCCUPATIONS.map((occupation) => (
                  <button
                    key={occupation}
                    type="button"
                    className={`intent-tag ${profile.occupation === occupation ? "selected" : ""}`}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        occupation:
                          profile.occupation === occupation ? undefined : (occupation as Occupation)
                      })
                    }
                  >
                    {occupation}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset profile-form-row">
              <legend>State of origin</legend>
              <div className="intent-tags selectable match-prefs-scroll">
                {NIGERIAN_STATES.map((origin) => (
                  <button
                    key={origin}
                    type="button"
                    className={`intent-tag ${profile.stateOfOrigin === origin ? "selected" : ""}`}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        stateOfOrigin: profile.stateOfOrigin === origin ? undefined : origin
                      })
                    }
                  >
                    {origin === "FCT" ? "Abuja" : origin}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset profile-form-row">
              <legend>Genotype</legend>
              <div className="intent-tags selectable">
                {GENOTYPES.map((genotype) => (
                  <button
                    key={genotype}
                    type="button"
                    className={`intent-tag ${profile.genotype === genotype ? "selected" : ""}`}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        genotype: profile.genotype === genotype ? undefined : (genotype as Genotype)
                      })
                    }
                  >
                    {genotype}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset profile-form-row">
              <legend>Has kids / Wants kids</legend>
              <div className="intent-tags selectable">
                {KIDS_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    className={`intent-tag ${profile.kidsPreference === pref ? "selected" : ""}`}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        kidsPreference:
                          profile.kidsPreference === pref ? undefined : (pref as KidsPreference)
                      })
                    }
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </fieldset>
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
            <button type="button" className="btn-primary btn-full" onClick={save}>
              {saved ? "Saved" : "Save"}
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
              : settingsPanel === "preferences"
                ? "Compatibility Preferences"
                : settingsPanel === "privacy"
                  ? "Privacy"
                  : settingsPanel === "notifications"
                    ? "Notifications"
                    : settingsPanel === "verification"
                      ? "Verification"
                      : "Account"}
          </h2>

          {settingsPanel === "hub" && (
            <>
              <section className="card settings-hub-card">
                <SettingsRow label="Compatibility Preferences" onClick={() => setSettingsPanel("preferences")} />
                <SettingsRow label="Privacy" onClick={() => setSettingsPanel("privacy")} />
                <SettingsRow label="Notifications" onClick={() => setSettingsPanel("notifications")} />
                <SettingsRow label="Verification" onClick={() => setSettingsPanel("verification")} />
                <SettingsRow label="Account" onClick={() => setSettingsPanel("account")} />
              </section>
              <div className="settings-hub-footer">
                <button type="button" className="profile-logout-link" onClick={handleLogout}>
                  <LogOut size={16} aria-hidden />
                  Log out
                </button>
              </div>
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

              <fieldset className="intent-fieldset">
                <legend>Preferred intent</legend>
                <div className="intent-tags selectable">
                  {INTENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`intent-tag ${prefs.intents.includes(opt.id) ? "selected" : ""}`}
                      onClick={() => togglePref("intents", opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="intent-fieldset">
                <legend>Faith</legend>
                <div className="intent-tags selectable">
                  {FILTER_RELIGIONS.map((religion) => (
                    <button
                      key={religion}
                      type="button"
                      className={`intent-tag ${prefs.religions.includes(religion) ? "selected" : ""}`}
                      onClick={() => togglePref("religions", religion)}
                    >
                      {religion}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="intent-fieldset">
                <legend>Preferred background</legend>
                <div className="intent-tags selectable match-prefs-scroll">
                  {FILTER_ETHNICITIES.map((ethnicity) => (
                    <button
                      key={ethnicity}
                      type="button"
                      className={`intent-tag ${prefs.ethnicities.includes(ethnicity) ? "selected" : ""}`}
                      onClick={() => togglePref("ethnicities", ethnicity)}
                    >
                      {ethnicity}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="intent-fieldset">
                <legend>Preferred lifestyle</legend>
                <div className="intent-tags selectable">
                  {FILTER_LIFESTYLES.map((lifestyle) => (
                    <button
                      key={lifestyle}
                      type="button"
                      className={`intent-tag ${prefs.lifestyles.includes(lifestyle) ? "selected" : ""}`}
                      onClick={() => togglePref("lifestyles", lifestyle)}
                    >
                      {lifestyle}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="intent-fieldset">
                <legend>Preferred state</legend>
                <div className="intent-tags selectable match-prefs-scroll">
                  {NIGERIAN_STATES.map((state) => (
                    <button
                      key={state}
                      type="button"
                      className={`intent-tag ${prefs.states.includes(state) ? "selected" : ""}`}
                      onClick={() => {
                        togglePref("states", state);
                        setPrefsStatePick(state);
                      }}
                    >
                      {state === "FCT" ? "Abuja" : state}
                    </button>
                  ))}
                </div>
              </fieldset>

              {prefsStatePick && (
                <fieldset className="intent-fieldset">
                  <legend>Preferred city in {prefsStatePick === "FCT" ? "Abuja" : prefsStatePick}</legend>
                  <div className="intent-tags selectable match-prefs-scroll">
                    {citiesForState(prefsStatePick).map((city) => (
                      <button
                        key={city}
                        type="button"
                        className={`intent-tag ${prefs.cities.includes(city) ? "selected" : ""}`}
                        onClick={() => togglePrefCity(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <fieldset className="intent-fieldset">
                <legend>Kids preference</legend>
                <div className="intent-tags selectable">
                  {FILTER_KIDS_PREFERENCES.map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      className={`intent-tag ${(prefs.kidsPreferences ?? []).includes(pref) ? "selected" : ""}`}
                      onClick={() => togglePref("kidsPreferences", pref)}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="settings-row settings-row--toggle">
                <span>
                  <strong>Verified only</strong>
                  <small>Prioritize verified profiles on Home</small>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(prefs.requireVerified)}
                  onChange={(e) => setPrefs({ ...prefs, requireVerified: e.target.checked })}
                />
              </label>

              <div className="match-prefs-age">
                <label>
                  Age from
                  <input
                    type="number"
                    min={18}
                    max={99}
                    placeholder="18"
                    value={prefs.ageMin ?? ""}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        ageMin: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                  />
                </label>
                <label>
                  Age to
                  <input
                    type="number"
                    min={18}
                    max={99}
                    placeholder="45"
                    value={prefs.ageMax ?? ""}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        ageMax: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                  />
                </label>
              </div>

              <button type="button" className="btn-primary btn-full" onClick={save}>
                Save preferences
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
              <details className="settings-advanced">
                <summary>Safety controls</summary>
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
                Signal, match, and activity alerts appear in your notification center.
              </p>
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
              <section className="card settings-card">
                {!isPremium && (
                  <button type="button" className="settings-row" onClick={onUpgrade}>
                    <span>Signal Pass</span>
                  </button>
                )}
                <button type="button" className="settings-row" onClick={onToggleTheme}>
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </button>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
