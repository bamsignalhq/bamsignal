import { ShieldCheck } from "lucide-react";
import {
  ACTIVITY_VISIBILITY_OPTIONS,
  DM_CONTROL_OPTIONS,
  FEMALE_SAFETY_COPY,
  WHO_CAN_SIGNAL_OPTIONS,
  isFemaleGender
} from "../constants/safety";
import type { ActivityVisibility, DatingProfile, DmControl, SafetySettings, WhoCanSignalMe } from "../types";
import { resolveSafetySettings } from "../utils/safety";

type SafetySettingsCardProps = {
  profile: DatingProfile;
  onChange: (settings: SafetySettings) => void;
  variant?: "profile" | "onboarding";
};

export function SafetySettingsCard({ profile, onChange, variant = "profile" }: SafetySettingsCardProps) {
  const safety = resolveSafetySettings(profile);
  const isFemale = isFemaleGender(profile.gender);

  const update = (patch: Partial<SafetySettings>) => {
    onChange({ ...safety, ...patch });
  };

  return (
    <section className={`card safety-settings-card ${isFemale ? "safety-settings-card--female" : ""}`}>
      <header className="safety-settings-head">
        <ShieldCheck size={22} />
        <div>
          <h3>{variant === "onboarding" ? FEMALE_SAFETY_COPY.onboardingTitle : "Safety"}</h3>
          <p>
            {variant === "onboarding"
              ? FEMALE_SAFETY_COPY.onboardingBody
              : "Control who can signal and message you."}
          </p>
        </div>
      </header>

      {isFemale && (
        <div className="safety-female-banner">
          <strong>Women-first protection</strong>
          <span>
            We've enabled stronger defaults for you — verified-only signals and preference matching. Adjust anytime.
          </span>
        </div>
      )}

      <fieldset className="intent-fieldset">
        <legend>Who can signal me?</legend>
        <div className="safety-option-list">
          {WHO_CAN_SIGNAL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`safety-option ${safety.whoCanSignalMe === opt.id ? "selected" : ""}`}
              onClick={() => update({ whoCanSignalMe: opt.id as WhoCanSignalMe })}
            >
              <strong>{opt.label}</strong>
              <span>{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="intent-fieldset">
        <legend>Who can message me</legend>
        <div className="safety-option-list">
          {DM_CONTROL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`safety-option ${safety.dmControl === opt.id ? "selected" : ""}`}
              onClick={() => update({ dmControl: opt.id as DmControl })}
            >
              <strong>{opt.label}</strong>
              <span>{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="intent-fieldset">
        <legend>Show activity status</legend>
        <div className="safety-option-list">
          {ACTIVITY_VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`safety-option ${(safety.activityVisibility ?? "matches_only") === opt.id ? "selected" : ""}`}
              onClick={() => update({ activityVisibility: opt.id as ActivityVisibility })}
            >
              <strong>{opt.label}</strong>
              <span>{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="settings-row settings-row--toggle safety-toggle-row">
        <span>
          <strong>Pause discovery</strong>
          <small>Hide your profile from Nearby Signals temporarily</small>
        </span>
        <input
          type="checkbox"
          checked={Boolean(safety.hideFromDiscovery)}
          onChange={(e) => update({ hideFromDiscovery: e.target.checked })}
        />
      </label>
    </section>
  );
}
