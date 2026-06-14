import { useState } from "react";
import { Zap } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { VerifiedBadge } from "../VerifiedBadge";
import { LANDING_PREVIEW_PROFILES } from "../../data/landingProfiles";

type SignalExperienceProps = {
  onGuestAction: () => void;
};

export function SignalExperience({ onGuestAction }: SignalExperienceProps) {
  const [phase, setPhase] = useState<"idle" | "firing">("idle");
  const profile = LANDING_PREVIEW_PROFILES[0];

  const sendSignal = () => {
    if (phase === "firing") return;
    setPhase("firing");
    window.setTimeout(() => {
      setPhase("idle");
      onGuestAction();
    }, 1400);
  };

  return (
    <section className="exp-signal">
      <div className={`exp-signal-stage ${phase === "firing" ? "exp-signal-stage--firing" : ""}`}>
        <div className={`exp-signal-logo ${phase === "firing" ? "exp-signal-logo--pulse" : ""}`}>
          <AppLogo size="lg" showText={false} />
        </div>

        <article className={`exp-signal-profile ${phase === "firing" ? "exp-signal-profile--hit" : ""}`}>
          <div className="exp-signal-photo">
            <img src={profile.photo} alt="" />
            <div className="exp-signal-photo-shade" />
            <div className="exp-signal-photo-meta">
              <h3>
                {profile.name}
                {profile.verified && <VerifiedBadge size="sm" />}
              </h3>
              <span>
                {profile.age} · {profile.city}
              </span>
            </div>
          </div>
        </article>

        {phase === "firing" && (
          <>
            <div className="exp-signal-wave exp-signal-wave--1" />
            <div className="exp-signal-wave exp-signal-wave--2" />
            <div className="exp-signal-wave exp-signal-wave--3" />
            <span className="exp-signal-bam" aria-hidden>
              BAM
            </span>
          </>
        )}

        <button
          type="button"
          className="exp-signal-btn"
          onClick={sendSignal}
          disabled={phase === "firing"}
        >
          <Zap size={22} fill="currentColor" />
          Send Signal
        </button>
      </div>
    </section>
  );
}
