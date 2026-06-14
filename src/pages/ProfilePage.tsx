import { Camera, Crown, LogOut, Moon, ShieldCheck, Sun, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAX_INTENT_SELECTIONS, INTENT_OPTIONS } from "../constants/intents";
import { PREMIUM_FEATURES } from "../constants/plans";
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
import { ONBOARDING_CULTURAL_COPY, PREFERENCE_CULTURAL_COPY } from "../data/landingProfiles";
import { SafetySettingsCard } from "../components/SafetySettingsCard";
import { FEMALE_SAFETY_COPY, isFemaleGender } from "../constants/safety";
import { supabase } from "../services/supabase";
import {
  isUserVerificationApproved,
  isUserVerificationPending,
  submitVerificationRequest
} from "../utils/verificationQueue";
import { notifyVerificationApproved } from "../utils/notifyHelpers";
import { moderatePhotoUpload } from "../utils/mediaModeration";

const GENDERS: Gender[] = ["Man", "Woman", "Non-binary", "Prefer not to say"];
const LOOKING: LookingFor[] = ["Men", "Women", "Everyone"];

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
  const [section, setSection] = useState<"overview" | "edit" | "settings">("overview");
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
    await supabase?.auth.signOut().catch(() => undefined);
    onLogout();
  };

  const phoneVerified = Boolean(user.phoneVerified ?? user.phone);
  const verification = getVerificationTier(profile, isPremium, phoneVerified);

  return (
    <div className="page profile-page profile-page--fb">
      {modMessage && (
        <p className="profile-mod-toast" role="status">
          {modMessage}
        </p>
      )}
      <ProfileCoverHeader
        user={user}
        profile={profile}
        verification={verification}
        isPremium={isPremium}
        onEditPhoto={() => fileRef.current?.click()}
        onEditProfile={() => setSection("edit")}
        onOpenSettings={() => setSection("settings")}
      />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadPhoto} />

      <nav className="profile-section-nav" aria-label="Profile sections">
        {(
          [
            ["overview", "Overview"],
            ["edit", "Edit profile"],
            ["settings", "Settings"]
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={section === id ? "active" : ""}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {section === "overview" && (
        <>
          <section className="card profile-overview-card">
            <h3>About</h3>
            <p className="profile-overview-bio">{profile.bio || "Add a short bio so people know your vibe."}</p>
          </section>
          {profile.interests?.length > 0 && (
            <section className="card profile-overview-card">
              <h3>Interests</h3>
              <div className="intent-tags">
                {profile.interests.map((interest) => (
                  <span key={interest} className="intent-tag selected">
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {section === "edit" && (
      <>
      <section className="card profile-form-card">
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
          Religion <span className="label-optional">(optional)</span>
          <select
            value={profile.religion ?? "Prefer not to say"}
            onChange={(e) => setProfile({ ...profile, religion: e.target.value as Religion })}
          >
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ethnic background <span className="label-optional">(optional)</span>
          <select
            value={profile.ethnicity ?? "Prefer not to say"}
            onChange={(e) => setProfile({ ...profile, ethnicity: e.target.value as EthnicBackground })}
          >
            {ETHNIC_BACKGROUNDS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <label>
          Lifestyle circle <span className="label-optional">(optional)</span>
          <select
            value={profile.lifestyle ?? "Prefer not to say"}
            onChange={(e) => setProfile({ ...profile, lifestyle: e.target.value as SocialLifestyle })}
          >
            {SOCIAL_LIFESTYLES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
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
        <VoiceIntroRecorder
          url={profile.voiceIntroUrl}
          onRecorded={(url) => setProfile({ ...profile, voiceIntroUrl: url })}
          onClear={() => setProfile({ ...profile, voiceIntroUrl: undefined })}
          onRejected={showModMessage}
        />
        <label>
          Bio
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Love music, football and good conversations."
            rows={3}
          />
        </label>
        <fieldset className="intent-fieldset">
          <legend>Intent · up to {MAX_INTENT_SELECTIONS}</legend>
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
                {opt.emoji} {opt.label}
              </button>
              );
            })}
          </div>
        </fieldset>
        <InterestPicker
          selected={profile.interests ?? []}
          onChange={(interests) => setProfile({ ...profile, interests })}
        />
        <button type="button" className="btn-primary btn-full" onClick={save}>
          {saved ? "Saved ✓" : "Save profile"}
        </button>
      </section>
      </>
      )}

      {section === "settings" && (
      <>
      <section className="card settings-card">
        <h3>Settings</h3>
        <p className="match-prefs-note">Preferences, privacy, safety, and account.</p>
      </section>

      <section className="card match-prefs-card">
        <h3>Match preferences</h3>
        <p className="match-prefs-note">{PREFERENCE_CULTURAL_COPY}</p>

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
                {opt.emoji} {opt.label}
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
          <legend>Preferred lifestyle circle</legend>
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
          <legend>Preferred state / region</legend>
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

        <button type="button" className="btn-secondary btn-full" onClick={save}>
          Save preferences
        </button>
      </section>

      <section className="card profile-privacy-card">
        <h3>Privacy</h3>
        <p className="match-prefs-note">{ONBOARDING_CULTURAL_COPY}</p>
        {(
          [
            ["showReligion", "Show my religion on profile"],
            ["showEthnicity", "Show my ethnic background on profile"],
            ["showState", "Show my state of origin on profile"]
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="settings-row settings-row--toggle">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={profile.visibility?.[key] ?? false}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  visibility: { ...profile.visibility!, [key]: e.target.checked }
                })
              }
            />
          </label>
        ))}
      </section>

      <SafetySettingsCard
        profile={profile}
        onChange={(safetySettings: SafetySettings) => setProfile({ ...profile, safetySettings })}
      />

      {isFemaleGender(profile.gender) && (
        <section className="card safety-centre-card">
          <h3>{FEMALE_SAFETY_COPY.dashboardTitle}</h3>
          <p>{FEMALE_SAFETY_COPY.dashboardBody}</p>
        </section>
      )}

      <section className="card settings-card">
        <h3>Account</h3>
        <button type="button" className="settings-row" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </section>

      <section className="card verification-card">
        <ShieldCheck size={22} />
        <div>
          <h3>Selfie verification</h3>
          <p>Get a verified badge so matches know you're real.</p>
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
              ? "Pending review"
              : verifying
                ? "Submitting..."
                : "Verify now"}
        </button>
      </section>

      {!isPremium && (
        <section className="card premium-card">
          <h3>Upgrade your signal</h3>
          <ul className="premium-features">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <button type="button" className="btn-secondary btn-full" onClick={onUpgrade}>
            View signal passes
          </button>
        </section>
      )}

      <button type="button" className="btn-logout" onClick={handleLogout}>
        <LogOut size={18} /> Logout
      </button>

      {onOpenAdmin && (
        <button type="button" className="link-btn admin-link" onClick={onOpenAdmin}>
          Ops console (/hard)
        </button>
      )}
      </>
      )}
    </div>
  );
}
