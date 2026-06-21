import { useState } from "react";
import { Zap } from "lucide-react";
import { BRAND } from "../../constants/copy";
import { AppLogo } from "../AppLogo";
import { TrustedMemberBadge } from "../trusted/TrustedMemberBadge";
import { isTrustedMember } from "../../utils/trustedMember";
import { BamEffect } from "./BamEffect";
import { LANDING_PREVIEW_PROFILES } from "../../data/landingProfiles";

type NearbySignalsTryProps = {
  onGuestAction: () => void;
};

export function NearbySignalsTry({ onGuestAction }: NearbySignalsTryProps) {
  const [phase, setPhase] = useState<"idle" | "firing" | "sent">("idle");
  const [profileIndex, setProfileIndex] = useState(0);
  const profile = LANDING_PREVIEW_PROFILES[profileIndex % LANDING_PREVIEW_PROFILES.length];
  const [sendCount, setSendCount] = useState(0);

  const ignore = () => {
    if (phase !== "idle") return;
    setProfileIndex((i) => i + 1);
  };

  const sendSignal = () => {
    if (phase !== "idle") return;
    setPhase("firing");
    window.setTimeout(() => {
      setPhase("sent");
      const isFirst = sendCount === 0;
      setSendCount((c) => c + 1);
      window.setTimeout(() => {
        setPhase("idle");
        setProfileIndex((i) => i + 1);
        if (isFirst) onGuestAction();
      }, 1800);
    }, 900);
  };

  return (
    <section className="world-discover" id="nearby-signals">
      <h2 className="world-section-title">Nearby Signals</h2>

      <div className={`world-discover-stage ${phase !== "idle" ? "world-discover-stage--active" : ""}`}>
        <div className={`world-discover-logo ${phase === "firing" ? "world-discover-logo--pulse" : ""}`}>
          <AppLogo size="md" showText={false} />
        </div>

        <article className={`world-discover-card ${phase === "firing" || phase === "sent" ? "world-discover-card--hit" : ""}`}>
          <div className="world-discover-photo">
            <img src={profile.photo} alt="" />
            <div className="world-discover-shade" />
            <div className="world-discover-meta">
              <h3>
                {profile.name}
                {isTrustedMember(profile) ? <TrustedMemberBadge size="sm" /> : null}
              </h3>
              <span className="world-discover-age">{profile.age}</span>
              <span className="world-discover-dist">{profile.distance}</span>
            </div>
          </div>
          {phase === "sent" && (
            <div className="world-discover-success">
              <Zap size={18} fill="currentColor" />
              {BRAND.signalSent}
            </div>
          )}
        </article>

        <BamEffect active={phase === "firing"} />

        {phase === "idle" && (
          <div className="world-discover-actions">
            <button type="button" className="world-btn-ignore" onClick={ignore}>
              Ignore
            </button>
            <button type="button" className="world-btn-signal" onClick={sendSignal}>
              <Zap size={20} fill="currentColor" />
              Send Signal
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
