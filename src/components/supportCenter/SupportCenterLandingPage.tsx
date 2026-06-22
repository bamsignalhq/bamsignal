import { SUPPORT_CENTER_TITLE, SUPPORT_TICKET_CATEGORIES } from "../../constants/supportCenter";
import { navigateToPath } from "../../constants/routes";
import { supportCenterPathForRoute } from "../../constants/supportCenterRoutes";
import { listKnowledgeBaseArticles } from "../../utils/supportCenterLogic";
import { KnowledgeBaseCard } from "./KnowledgeBaseCard";
import { SupportCategoryCard } from "./SupportCategoryCard";

export function SupportCenterLandingPage() {
  const articles = listKnowledgeBaseArticles().slice(0, 4);

  return (
    <div className="support-center-page support-center-landing">
      <section className="support-center-hero cc-reveal">
        <p className="support-center-hero__eyebrow">{SUPPORT_CENTER_TITLE}</p>
        <h1>Operational support with a clear home</h1>
        <p>
          Account, payments, consultations, scheduling, introductions, technical issues, and safety —
          tracked with priorities, statuses, and response metrics.
        </p>
        <div className="support-center-hero__actions">
          <button
            type="button"
            className="support-center-btn"
            onClick={() => navigateToPath(supportCenterPathForRoute("contact"))}
          >
            Contact support
          </button>
          <button
            type="button"
            className="support-center-btn support-center-btn--ghost"
            onClick={() => navigateToPath(supportCenterPathForRoute("knowledgeBase"))}
          >
            Browse knowledge base
          </button>
        </div>
      </section>

      <section className="support-center-section cc-reveal">
        <h2>Ticket categories</h2>
        <div className="support-category-grid">
          {SUPPORT_TICKET_CATEGORIES.map((category) => (
            <SupportCategoryCard key={category.id} categoryId={category.id} hint={category.hint} />
          ))}
        </div>
      </section>

      <section className="support-center-section cc-reveal">
        <div className="support-center-section__head">
          <h2>Popular articles</h2>
          <button
            type="button"
            className="support-center-btn support-center-btn--ghost"
            onClick={() => navigateToPath(supportCenterPathForRoute("knowledgeBase"))}
          >
            View all
          </button>
        </div>
        <div className="support-kb-grid">
          {articles.map((article) => (
            <KnowledgeBaseCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
