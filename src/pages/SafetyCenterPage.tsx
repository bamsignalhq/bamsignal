import { ArrowLeft, ExternalLink, Shield } from "lucide-react";
import {
  BACKGROUND_CHECK_DISCLAIMER,
  SAFETY_CENTER_SECTIONS,
  SUPPORT_WHATSAPP,
  SUPPORT_WHATSAPP_URL
} from "../constants/safety";
import { navigateToPath } from "../constants/routes";

type SafetyCenterPageProps = {
  onBack: () => void;
  onOpenProfile?: () => void;
};

export function SafetyCenterPage({ onBack, onOpenProfile }: SafetyCenterPageProps) {
  return (
    <div className="page safety-center-page safety-center-page--clean">
      <header className="safety-center-page__head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1>Safety Center</h1>
          <p>Tools and tips to stay safe on BamSignal.</p>
        </div>
      </header>

      <div className="safety-center-cards">
        {SAFETY_CENTER_SECTIONS.map((section) => (
          <article key={section.title} className="card safety-center-card">
            <div className="safety-center-card__icon" aria-hidden>
              <Shield size={18} />
            </div>
            <div>
              <h2 className="safety-center-card__title">{section.title}</h2>
              <p className="safety-center-card__body">{section.body}</p>
            </div>
          </article>
        ))}

        <article className="card safety-center-card safety-center-card--support">
          <div>
            <h2 className="safety-center-card__title">Contact Support</h2>
            <p className="safety-center-card__body">
              WhatsApp:{" "}
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                {SUPPORT_WHATSAPP}
              </a>
            </p>
          </div>
          <a
            className="btn-secondary btn-sm safety-center-card__link"
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us <ExternalLink size={14} aria-hidden />
          </a>
        </article>

        <article className="card safety-center-card safety-center-card--muted">
          <h2 className="safety-center-card__title">Background checks</h2>
          <p className="safety-center-card__body safety-center-card__body--small">
            {BACKGROUND_CHECK_DISCLAIMER}
          </p>
        </article>
      </div>

      <div className="safety-center-clean__links">
        <button type="button" className="link-btn" onClick={() => navigateToPath("/safety")}>
          Community guidelines
        </button>
        <button type="button" className="link-btn" onClick={() => navigateToPath("/terms")}>
          Terms of Service
        </button>
        {onOpenProfile ? (
          <button type="button" className="link-btn" onClick={onOpenProfile}>
            Privacy &amp; safety settings
          </button>
        ) : null}
      </div>
    </div>
  );
}
