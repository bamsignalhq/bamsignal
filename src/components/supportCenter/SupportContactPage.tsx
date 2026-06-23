import { SUPPORT_TICKET_TYPES } from "../../constants/supportCenter";
import { navigateToPath } from "../../constants/routes";
import { supportCenterPathForRoute } from "../../constants/supportCenterRoutes";
import { HelpCategoryCard } from "./HelpCategoryCard";

export function SupportContactPage() {
  return (
    <div className="support-center-page">
      <header className="support-center-page__head cc-reveal">
        <h1>Contact support</h1>
        <p>
          Email support@bamsignal.com with your username and ticket type. We aim to respond within a
          few hours on weekdays.
        </p>
      </header>

      <section className="support-contact-panel cc-reveal">
        <h2>Before you write</h2>
        <ul>
          <li>Include your BamSignal username (not email or phone in public channels).</li>
          <li>Choose the closest ticket type so routing is faster.</li>
          <li>For safety reports, use in-app reporting when possible — faster escalation.</li>
        </ul>
        <p>
          Billing issues: include your Paystack reference. Consultation issues: include journey or
          booking date.
        </p>
      </section>

      <section className="support-center-section cc-reveal">
        <h2>Ticket types</h2>
        <div className="support-category-grid">
          {SUPPORT_TICKET_TYPES.map((type) => (
            <HelpCategoryCard key={type.id} typeId={type.id} hint={type.hint} />
          ))}
        </div>
      </section>

      <footer className="support-contact-cta cc-reveal">
        <p>Track an existing request?</p>
        <button
          type="button"
          className="support-center-btn"
          onClick={() => navigateToPath(supportCenterPathForRoute("tickets"))}
        >
          View tickets
        </button>
      </footer>
    </div>
  );
}
