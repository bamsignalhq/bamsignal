import { ShieldCheck } from "lucide-react";
import {
  DM_CONTROL_OPTIONS,
  FEMALE_SAFETY_COPY,
  PRIVACY_VISIBILITY_OPTIONS,
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

function PrivacyOptionList({
  legend,
  value,
  onSelect
}: {
  legend: string;
  value: ActivityVisibility;
  onSelect: (next: ActivityVisibility) => void;
}) {
  return (
    <fieldset className="intent-fieldset">
      <legend>{legend}</legend>
      <div className="safety-option-list">
        {PRIVACY_VISIBILITY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`safety-option ${value === opt.id ? "selected" : ""}`}
            onClick={() => onSelect(opt.id)}
          >
            <strong>{opt.label}</strong>
            <span>{opt.hint}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function SafetySettingsCard({ profile, onChange, variant = "profile" }: SafetySettingsCardProps) {
  const safety = resolveSafetySettings(profile);
  const isFemale = isFemaleGender(profile.gender);

  const update = (patch: Partial<SafetySettings>) => {
    onChange({ ...safety, ...patch });
  };

  const lastSeen = safety.lastSeenVisibility ?? "connections_only";
  const onlineStatus = safety.onlineStatusVisibility ?? "connections_only";
  const readReceiptsOn = safety.readReceiptsEnabled !== false;

  return (
    <section className={`card safety-settings-card ${isFemale ? "safety-settings-card--female" : ""}`}>
      <header className="safety-settings-head">
        <ShieldCheck size={22} />
        <div>
          <h3>{variant === "onboarding" ? FEMALE_SAFETY_COPY.onboardingTitle : "Safety"}</h3>
          <p>
            {variant === "onboarding"
              ? FEMALE_SAFETY_COPY.onboardingBody
              : "Control who can signal, message, and see your activity."}
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

      <PrivacyOptionList
        legend="Last seen"
        value={lastSeen}
        onSelect={(next) => update({ lastSeenVisibility: next })}
      />

      <PrivacyOptionList
        legend="Online status"
        value={onlineStatus}
        onSelect={(next) => update({ onlineStatusVisibility: next })}
      />

      <fieldset className="intent-fieldset">
        <legend>Read receipts</legend>
        <div className="safety-option-list">
          {(
            [
              { id: true, label: "On", hint: "Connections can see when you've read messages" },
              { id: false, label: "Off", hint: "Neither side sees read receipts" }
            ] as const
          ).map((opt) => (
            <button
              key={String(opt.id)}
              type="button"
              className={`safety-option ${readReceiptsOn === opt.id ? "selected" : ""}`}
              onClick={() => update({ readReceiptsEnabled: opt.id })}
            >
              <strong>{opt.label}</strong>
              <span>{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <p className="safety-settings-note">{FEMALE_SAFETY_COPY.screenshotNotice}</p>

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
    </section>
  );
}
