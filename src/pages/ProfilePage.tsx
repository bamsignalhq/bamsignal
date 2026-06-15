import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Moon, ShieldCheck, Sun, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MAX_INTENT_SELECTIONS, INTENT_OPTIONS, intentDisplay } from "../constants/intents";
import { StateCitySelect } from "../components/StateCitySelect";
import {
  ALL_NIGERIAN_CITIES,
  ETHNIC_BACKGROUNDS,
  FILTER_ETHNICITIES,
  FILTER_LIFESTYLES,
  FILTER_RELIGIONS,
  NIGERIAN_STATES,
  RELIGIONS,
  SOCIAL_LIFESTYLES
} from "../constants/profileOptions";
import { ProfileCoverHeader } from "../components/ProfileCoverHeader";
import { InterestPicker } from "../components/InterestPicker";
import { VoiceIntroRecorder } from "../components/VoiceIntro";
import { VoiceIntro } from "../components/VoiceIntro";
import { WhyThisProfile } from "../components/WhyThisProfile";
import type {
  DatingProfile,
  EthnicBackground,
  Gender,
  IntentTag,
  LookingFor,
  MatchPreferences,
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
  isUserVerificationPending,
  submitVerificationRequest
} from "../utils/verificationQueue";
import { notifyVerificationApproved } from "../utils/notifyHelpers";
import { moderatePhotoUpload } from "../utils/mediaModeration";
import { getOwnProfileHighlights } from "../utils/profileHighlights";
import { getOwnCompatibilitySummary } from "../utils/profileCompatSummary";
import { ShowcaseImage } from "../components/ShowcaseImage";

const GENDERS: Gender[] = ["Man", "Woman", "Non-binary", "Prefer not to say"];
const LOOKING: LookingFor[] = ["Men", "Women", "Everyone"];

type ProfileView = "overview" | "edit" | "settings";
type SettingsPanel = "hub" | "preferences" | "privacy" | "safety" | "account" | "payments" | "notifications";
type EditSection = "basic" | "photos" | "bio" | "interests" | "intent" | "voice";

type ProfilePageProps = {
  user: UserProfile;
  isPremium: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onUserChange: (user: UserProfile) => void;
  onLogout: () => void;
  onUpgrade: () => void;
  onOpenAdmin?: () => void;
};

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
  onUpgrade,
  onOpenAdmin
}: ProfilePageProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<DatingProfile>(() =>
    normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}))
  );
  const [prefs, setPrefs] = useState<MatchPreferences>(() =>
    normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}))
  );
  const [saved, setSaved] = useState(false);
  const [modMessage, setModMessage] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [view, setView] = useState<ProfileView>("overview");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("hub");
  const [editOpen, setEditOpen] = useState<EditSection | null>(null);
  const verifyPending = isUserVerificationPending(user.phone);

  useEffect(() => {
    if (profile.verified || !user.phone) return;
    if (isUserVerificationApproved(user.phone)) {
      setProfile((p) => ({ ...p, verified: true }));
      notifyVerificationApproved();
    }
  }, [user.phone, profile.verified]);

  const save = () => {
    writeJson(STORAGE_KEYS.datingProfile, { ...profile, premium: isPremium });
    writeJson(STORAGE_KEYS.matchPreferences, prefs);
    onUserChange({ ...user, name: user.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const showModMessage = (msg: string) => {
    setModMessage(msg);
    window.setTimeout(() => setModMessage(""), 4000);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const verdict = await moderatePhotoUpload(file);
    if (!verdict.allowed) {
      showModMessage(verdict.message);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setProfile((p) => ({ ...p, photos: [...p.photos, url].slice(0, 6) }));
    };
    reader.readAsDataURL(file);
  };

  const startSelfieVerification = () => {
    if (verifyPending) return;
    setVerifying(true);
    submitVerificationRequest(user.name || "Member", user.phone || "unknown");
    window.setTimeout(() => setVerifying(false), 600);
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

  const phoneVerified = Boolean(user.phoneVerified ?? user.phone);
  const verification = getVerificationTier(profile, isPremium, phoneVerified);
  const profileHighlights = getOwnProfileHighlights(profile);
  const compatibilitySummary = getOwnCompatibilitySummary(profile, prefs);

  const settingsBack = () => {
    if (settingsPanel === "hub") {
      setView("overview");
    } else {
      setSettingsPanel("hub");
    }
  };

  return (
    <div className={`page profile-page profile-page--hero ${view === "edit" ? "profile-page--editing" : ""}`}>
      {modMessage && (
        <p className="profile-mod-toast" role="status">
          {modMessage}
        </p>
      )}

      {view === "overview" && (
        <>
          <ProfileCoverHeader user={user} profile={profile} verification={verification} />

          <div className="profile-overview-actions">
            <button type="button" className="btn-primary btn-full" onClick={() => setView("edit")}>
              Edit Profile
            </button>
            <button type="button" className="link-btn profile-settings-link" onClick={() => openSettings()}>
              Settings
            </button>
          </div>

          <div className="profile-overview-sections">
            <section className="profile-overview-card">
              <h3>Bio</h3>
              <p className="profile-overview-bio">{profile.bio || "Add a short bio in Edit Profile."}</p>
            </section>

            <section className="profile-overview-card">
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
                <p className="profile-overview-empty">Add interests in Edit Profile.</p>
              )}
            </section>

            <section className="profile-overview-card">
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
                <p className="profile-overview-empty">Add what you&apos;re looking for in Edit Profile.</p>
              )}
            </section>

            {profile.voiceIntroUrl && (
              <section className="profile-overview-card">
                <h3>Voice intro</h3>
                <VoiceIntro url={profile.voiceIntroUrl} />
              </section>
            )}

            {(profileHighlights.length > 0 || compatibilitySummary) && (
              <section className="profile-overview-card profile-overview-card--insight">
                {profileHighlights.length > 0 && <WhyThisProfile reasons={profileHighlights} />}
                {compatibilitySummary ? (
                  <p className="profile-overview-compat">{compatibilitySummary}</p>
                ) : null}
              </section>
            )}
          </div>
        </>
      )}

      {view === "edit" && (
        <>
          <button type="button" className="profile-back-link" onClick={() => setView("overview")}>
            <ChevronLeft size={18} /> Profile
          </button>
          <h2 className="profile-screen-title">Edit Profile</h2>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadPhoto} />

          <EditAccordion
            id="basic"
            title="Basic info"
            open={editOpen === "basic"}
            onToggle={toggleEditSection}
          >
            <label>
              Name
              <input value={user.name} onChange={(e) => onUserChange({ ...user, name: e.target.value })} />
            </label>
            <label>
              Age
              <input
                type="number"
                min={18}
                max={99}
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              />
            </label>
            <label>
              Gender
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <StateCitySelect
              state={profile.state ?? ""}
              city={profile.city}
              onLocationChange={(state, city) => setProfile({ ...profile, state, city })}
            />
            <label>
              Looking for
              <select
                value={profile.lookingFor}
                onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value as LookingFor })}
              >
                {LOOKING.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </EditAccordion>

          <EditAccordion
            id="photos"
            title="Photos"
            hint={`${profile.photos.length}/6`}
            open={editOpen === "photos"}
            onToggle={toggleEditSection}
          >
            <div className="profile-photo-grid">
              {profile.photos.map((photo, index) => (
                <div key={`${photo.slice(0, 24)}-${index}`} className="profile-photo-grid__item">
                  <ShowcaseImage src={photo} alt="" className="profile-photo-grid__img--face" />
                  <button
                    type="button"
                    className="profile-photo-grid__remove"
                    onClick={() =>
                      setProfile((p) => ({ ...p, photos: p.photos.filter((_, i) => i !== index) }))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {profile.photos.length < 6 && (
              <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                <Upload size={16} /> Add Photo
              </button>
            )}
          </EditAccordion>

          <EditAccordion
            id="bio"
            title="Bio"
            open={editOpen === "bio"}
            onToggle={toggleEditSection}
          >
            <label>
              Bio
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="A few lines about you"
                rows={4}
              />
            </label>
          </EditAccordion>

          <EditAccordion
            id="interests"
            title="Interests"
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
            title="Looking for"
            open={editOpen === "intent"}
            onToggle={toggleEditSection}
          >
            <fieldset className="intent-fieldset">
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
            id="voice"
            title="Voice intro"
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
            <ChevronLeft size={18} /> {settingsPanel === "hub" ? "Profile" : "Settings"}
          </button>
          <h2 className="profile-screen-title">
            {settingsPanel === "hub"
              ? "Settings"
              : settingsPanel === "preferences"
                ? "Preferences"
                : settingsPanel === "privacy"
                  ? "Privacy"
                  : settingsPanel === "safety"
                    ? "Safety"
                    : settingsPanel === "notifications"
                      ? "Notifications"
                      : settingsPanel === "payments"
                        ? "Payments"
                        : "Account"}
          </h2>

          {settingsPanel === "hub" && (
            <section className="card settings-hub-card">
              <SettingsRow label="Preferences" onClick={() => setSettingsPanel("preferences")} />
              <SettingsRow label="Privacy" onClick={() => setSettingsPanel("privacy")} />
              <SettingsRow label="Safety" onClick={() => setSettingsPanel("safety")} />
              <SettingsRow label="Notifications" onClick={() => setSettingsPanel("notifications")} />
              {!isPremium && <SettingsRow label="Payments" onClick={() => setSettingsPanel("payments")} />}
              <SettingsRow label="Account" onClick={() => setSettingsPanel("account")} />
            </section>
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
                <legend>Preferred religion</legend>
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
                <legend>Preferred city</legend>
                <div className="intent-tags selectable">
                  {ALL_NIGERIAN_CITIES.map((city) => (
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

              <fieldset className="intent-fieldset">
                <legend>Preferred state</legend>
                <div className="intent-tags selectable match-prefs-scroll">
                  {NIGERIAN_STATES.map((state) => (
                    <button
                      key={state}
                      type="button"
                      className={`intent-tag ${prefs.states.includes(state) ? "selected" : ""}`}
                      onClick={() => togglePref("states", state)}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </fieldset>

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

          {settingsPanel === "notifications" && (
            <section className="card settings-card settings-card--quiet">
              <p className="profile-overview-empty">
                Signal, match, and activity alerts appear in your notification center.
              </p>
            </section>
          )}

          {settingsPanel === "privacy" && (
            <section className="card profile-privacy-card">
              {(
                [
                  ["showReligion", "Show religion on profile"],
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
          )}

          {settingsPanel === "safety" && (
            <SafetySettingsCard
              profile={profile}
              onChange={(safetySettings: SafetySettings) => {
                setProfile({ ...profile, safetySettings });
                writeJson(STORAGE_KEYS.datingProfile, { ...profile, safetySettings, premium: isPremium });
              }}
            />
          )}

          {settingsPanel === "payments" && !isPremium && (
            <section className="card settings-card">
              <button type="button" className="btn-primary btn-full" onClick={onUpgrade}>
                Signal Pass
              </button>
            </section>
          )}

          {settingsPanel === "account" && (
            <>
              <section className="card verification-card verification-card--compact">
                <ShieldCheck size={22} />
                <div>
                  <h3>Verification</h3>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={startSelfieVerification}
                  disabled={profile.verified || verifying || verifyPending}
                >
                  {profile.verified
                    ? "Verified"
                    : verifyPending
                      ? "Pending"
                      : verifying
                        ? "Submitting…"
                        : "Verify"}
                </button>
              </section>

              <section className="card settings-card">
                <button type="button" className="settings-row" onClick={onToggleTheme}>
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </button>
              </section>

              <button type="button" className="btn-logout" onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>

              {onOpenAdmin && (
                <button type="button" className="link-btn admin-link" onClick={onOpenAdmin}>
                  Ops console
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
