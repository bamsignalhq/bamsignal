import { ArrowLeft, Shield, ShieldAlert, Eye, LifeBuoy, BookOpen } from "lucide-react";
import { useState } from "react";
import { navigateToPath } from "../constants/routes";
import { SafetySettingsCard } from "../components/SafetySettingsCard";
import type { DatingProfile } from "../types";
import { getDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { writeJson } from "../utils/storage";
import { STORAGE_KEYS } from "../constants/limits";

type SafetyCenterPageProps = {
  onBack: () => void;
  onOpenProfile: () => void;
};

export function SafetyCenterPage({ onBack, onOpenProfile }: SafetyCenterPageProps) {
  const [profile, setProfile] = useState(() => normalizeDatingProfile(getDatingProfile()));

  const saveSafety = (next: DatingProfile) => {
    setProfile(next);
    writeJson(STORAGE_KEYS.datingProfile, next);
  };

  return (
    <div className="page safety-center-page">
      <header className="safety-center-page__head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <Shield className="safety-center-page__icon" size={28} aria-hidden />
          <h1>Safety Center</h1>
          <p>Trust is the product. Control who sees you and how people reach you.</p>
        </div>
      </header>

      <nav className="safety-center-grid" aria-label="Safety tools">
        <button type="button" className="safety-center-card card" onClick={onOpenProfile}>
          <ShieldAlert size={22} aria-hidden />
          <div>
            <strong>Block User</strong>
            <span>Block from profile or chat — they won&apos;t see you again.</span>
          </div>
        </button>
        <button type="button" className="safety-center-card card" onClick={onOpenProfile}>
          <Shield size={22} aria-hidden />
          <div>
            <strong>Report User</strong>
            <span>Report fake profiles, scams, or harassment.</span>
          </div>
        </button>
        <section className="safety-center-card card safety-center-card--wide">
          <Eye size={22} aria-hidden />
          <div className="safety-center-card__privacy">
            <strong>Privacy Controls</strong>
            <SafetySettingsCard
              profile={profile}
              onChange={(settings) => saveSafety({ ...profile, safetySettings: settings })}
            />
          </div>
        </section>
        <button
          type="button"
          className="safety-center-card card"
          onClick={() => navigateToPath("/contact")}
        >
          <LifeBuoy size={22} aria-hidden />
          <div>
            <strong>Contact Support</strong>
            <span>Reach our team for urgent safety issues.</span>
          </div>
        </button>
        <button
          type="button"
          className="safety-center-card card"
          onClick={() => navigateToPath("/safety")}
        >
          <BookOpen size={22} aria-hidden />
          <div>
            <strong>Community Guidelines</strong>
            <span>How we keep BamSignal respectful and real.</span>
          </div>
        </button>
      </nav>
    </div>
  );
}
