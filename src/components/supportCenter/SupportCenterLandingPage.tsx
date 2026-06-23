import { SUPPORT_CENTER_TITLE, SUPPORT_TICKET_TYPES } from "../../constants/supportCenter";
import { navigateToPath } from "../../constants/routes";
import { supportCenterPathForRoute } from "../../constants/supportCenterRoutes";
import { listKnowledgeBaseArticles } from "../../utils/supportCenterLogic";
import { HelpCategoryCard } from "./HelpCategoryCard";
import { KnowledgeBaseCard } from "./KnowledgeBaseCard";

export function SupportCenterLandingPage() {
  const articles = listKnowledgeBaseArticles().slice(0, 4);

  return (
    <div className="support-center-page support-center-landing">
      <section className="support-center-hero cc-reveal">
        <p className="support-center-hero__eyebrow">{SUPPORT_CENTER_TITLE}</p>
        <h1>Help center for members</h1>
        <p>
          Technical support, billing, consultation issues, account recovery, profile issues, safety
          reports, general questions, and feedback — with a clear path to contact support.
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
        <h2>How can we help?</h2>
        <div className="support-category-grid">
          {SUPPORT_TICKET_TYPES.map((type) => (
            <HelpCategoryCard key={type.id} typeId={type.id} hint={type.hint} />
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
