type BuildProfileLaterCardProps = {
  onStartDiscovering: () => void;
  onContinueBuilding: () => void;
  className?: string;
};

function ReadyIllustration() {
  return (
    <div className="build-profile-later__illustration" aria-hidden>
      <svg viewBox="0 0 200 150" className="build-profile-later__svg">
        <defs>
          <linearGradient id="buildLaterGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9b6dff" />
            <stop offset="100%" stopColor="#e91e8f" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="128" rx="70" ry="10" fill="rgba(155,109,255,0.2)" />
        <circle cx="100" cy="62" r="34" fill="url(#buildLaterGlow)" opacity="0.35" />
        <path
          d="M78 58c6 10 18 16 22 16s16-6 22-16"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="86" cy="54" r="4" fill="rgba(255,255,255,0.9)" />
        <circle cx="114" cy="54" r="4" fill="rgba(255,255,255,0.9)" />
        <path
          d="M44 96h112a12 12 0 0 1 12 12v8a12 12 0 0 1-12 12H88l-16 14v-14H44a12 12 0 0 1-12-12v-8a12 12 0 0 1 12-12z"
          fill="rgba(36,17,47,0.88)"
          stroke="rgba(233,30,143,0.45)"
        />
      </svg>
    </div>
  );
}

export function BuildProfileLaterCard({
  onStartDiscovering,
  onContinueBuilding,
  className = ""
}: BuildProfileLaterCardProps) {
  return (
    <div className={`build-profile-later-card ${className}`.trim()}>
      <ReadyIllustration />
      <h1 className="build-profile-later-card__title">You&apos;re ready to start discovering 🎉</h1>
      <p className="build-profile-later-card__subtext">
        You can continue building your profile anytime.
      </p>
      <p className="build-profile-later-card__hint">Better profiles receive more replies.</p>
      <div className="build-profile-later-card__actions">
        <button type="button" className="btn-primary btn-full" onClick={onStartDiscovering}>
          Start Discovering
        </button>
        <button type="button" className="btn-secondary btn-full" onClick={onContinueBuilding}>
          Continue Building Profile
        </button>
      </div>
    </div>
  );
}
