import { ArrowLeft, ExternalLink, Mail, Phone, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { BACKGROUND_CHECK_DISCLAIMER } from "../constants/safety";
import {
  COMMUNITY_TRUST_HUB_SECTIONS,
  COMMUNITY_TRUST_MISSION,
  COMMUNITY_TRUST_REPORT_REASONS,
  COMMUNITY_TRUST_SAFETY_TIPS,
  NIGERIA_EMERGENCY_CONTACTS,
  SAFETY_INTERACTIONS,
  type CommunityTrustHubSectionId,
} from "../constants/communityTrust";
import { getCms } from "../constants/cms";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "../constants/support";
import { navigateToPath } from "../constants/routes";
import { whatsappHref } from "../utils/whatsapp";
import { BlockedUsersList, MemberReportsList } from "../components/safety/CommunityTrustPanels";
import { CommunityTrustEducation } from "../components/safety/CommunityTrustEducation";
import { MemberPageHead } from "../components/member";
import {
  getCommunityTrustMemberSnapshot,
  listMemberReports,
} from "../utils/communityTrustMetrics";
import { listBlockedUsers } from "../utils/safetyInteractions";
import { getTrustEducationView } from "../utils/trustEducation";
import { getDatingProfile } from "../utils/profile";

type SafetyCenterPageProps = {
  onBack: () => void;
  onOpenProfile?: () => void;
  onOpenVerification?: () => void;
};

export function SafetyCenterPage({ onBack, onOpenProfile, onOpenVerification }: SafetyCenterPageProps) {
  const supportWhatsapp = getCms().supportWhatsapp.trim();
  const [section, setSection] = useState<CommunityTrustHubSectionId>("safety_tips");
  const [blockedIds, setBlockedIds] = useState(() => listBlockedUsers());

  const trustView = useMemo(() => getTrustEducationView(getDatingProfile()), []);
  const memberSnapshot = useMemo(() => getCommunityTrustMemberSnapshot(), [blockedIds.length]);
  const reports = useMemo(() => listMemberReports(), []);

  return (
    <div className="page safety-center-page safety-center-page--clean community-trust-hub">
      <MemberPageHead
        className="safety-center-page__head"
        title="Safety Center"
        subtitle={COMMUNITY_TRUST_MISSION}
        onBack={onBack}
        backVariant="icon"
        backIcon={<ArrowLeft size={22} />}
      />

      <nav className="community-trust-hub__nav" aria-label="Safety sections">
        {COMMUNITY_TRUST_HUB_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`community-trust-hub__nav-btn ${section === item.id ? "active" : ""}`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="community-trust-hub__stats">
        <span>{memberSnapshot.blockedCount} blocked</span>
        <span>{memberSnapshot.reportsSubmitted} reports</span>
        <span>{memberSnapshot.mutedCount} muted</span>
      </div>

      {section === "safety_tips" ? (
        <section className="card community-trust-hub__panel">
          <h2 className="safety-center-card__title">Safety Tips</h2>
          <ul className="community-trust__tips">
            {COMMUNITY_TRUST_SAFETY_TIPS.map((tip) => (
              <li key={tip.title}>
                <strong>{tip.title}</strong>
                <p className="community-trust__muted">{tip.body}</p>
              </li>
            ))}
          </ul>
          <h3 className="community-trust__subtitle">Blocking tools</h3>
          <ul className="community-trust__tips">
            {SAFETY_INTERACTIONS.map((tool) => (
              <li key={tool.id}>
                <strong>{tool.label}</strong>
                <p className="community-trust__muted">{tool.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {section === "blocked_users" ? (
        <section className="card community-trust-hub__panel">
          <h2 className="safety-center-card__title">Blocked Users</h2>
          <BlockedUsersList
            blockedIds={blockedIds}
            onUnblock={(id) => setBlockedIds((prev) => prev.filter((item) => item !== id))}
          />
        </section>
      ) : null}

      {section === "reports" ? (
        <section className="card community-trust-hub__panel">
          <h2 className="safety-center-card__title">Your Reports</h2>
          <p className="community-trust__muted">Report types we act on:</p>
          <ul className="community-trust__report-types">
            {COMMUNITY_TRUST_REPORT_REASONS.map((reason) => (
              <li key={reason.id}>{reason.label}</li>
            ))}
          </ul>
          <MemberReportsList reports={reports} />
        </section>
      ) : null}

      {section === "verification" ? (
        <section className="card community-trust-hub__panel">
          <h2 className="safety-center-card__title">Verification</h2>
          <p className="community-trust__muted">
            {trustView.verified
              ? "You are verified — thank you for building trust."
              : "Verify your phone and profile to unlock trust badges and safer matches."}
          </p>
          {onOpenVerification ? (
            <button type="button" className="btn-primary btn-compact" onClick={onOpenVerification}>
              {trustView.verified ? "Review verification" : "Start verification"}
            </button>
          ) : null}
        </section>
      ) : null}

      {section === "emergency_help" ? (
        <section className="card community-trust-hub__panel">
          <h2 className="safety-center-card__title">Emergency Help</h2>
          <p className="community-trust__muted">
            If you are in immediate danger, contact local emergency services first.
          </p>
          <ul className="community-trust__emergency">
            {NIGERIA_EMERGENCY_CONTACTS.map((contact) => (
              <li key={contact.label}>
                <Phone size={16} aria-hidden />
                <span>{contact.label}</span>
                <a href={`tel:${contact.tel}`} className="community-trust__emergency-link">
                  {contact.number}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {section === "trust_education" ? (
        <section className="card community-trust-hub__panel">
          <h2 className="safety-center-card__title">Trust &amp; Standards</h2>
          <CommunityTrustEducation view={trustView} />
        </section>
      ) : null}

      <article className="card safety-center-card safety-center-card--support">
        <div>
          <h2 className="safety-center-card__title">Contact Support</h2>
          <p className="safety-center-card__body">
            {supportWhatsapp ? (
              <>
                WhatsApp:{" "}
                <a href={whatsappHref(supportWhatsapp)} target="_blank" rel="noopener noreferrer">
                  {supportWhatsapp}
                </a>
              </>
            ) : (
              <>
                Email us at <a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>
              </>
            )}
          </p>
        </div>
        {supportWhatsapp ? (
          <a
            className="btn-secondary btn-sm safety-center-card__link"
            href={whatsappHref(supportWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us <ExternalLink size={14} aria-hidden />
          </a>
        ) : (
          <a className="btn-secondary btn-sm safety-center-card__link" href={SUPPORT_MAILTO}>
            Email support <Mail size={14} aria-hidden />
          </a>
        )}
      </article>

      <article className="card safety-center-card safety-center-card--muted">
        <div className="safety-center-card__icon" aria-hidden>
          <Shield size={18} />
        </div>
        <h2 className="safety-center-card__title">Background checks</h2>
        <p className="safety-center-card__body safety-center-card__body--small">
          {BACKGROUND_CHECK_DISCLAIMER}
        </p>
      </article>

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
