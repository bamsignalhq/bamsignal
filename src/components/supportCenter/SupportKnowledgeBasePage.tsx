import { useMemo, useState } from "react";
import { SUPPORT_TICKET_CATEGORIES, SUPPORT_TICKET_CATEGORY_LABELS } from "../../constants/supportCenter";
import type { SupportTicketCategoryId } from "../../constants/supportCenter";
import { filterKnowledgeBaseByCategory, listKnowledgeBaseArticles } from "../../utils/supportCenterLogic";
import { KnowledgeBaseCard } from "./KnowledgeBaseCard";

export function SupportKnowledgeBasePage() {
  const [categoryId, setCategoryId] = useState<SupportTicketCategoryId | "all">("all");

  const articles = useMemo(() => {
    if (categoryId === "all") return listKnowledgeBaseArticles();
    return filterKnowledgeBaseByCategory(categoryId);
  }, [categoryId]);

  return (
    <div className="support-center-page">
      <header className="support-center-page__head cc-reveal">
        <h1>Knowledge base</h1>
        <p>Self-service guides for account, payments, concierge, safety, and technical issues.</p>
      </header>

      <div className="support-center-filters cc-reveal">
        <button
          type="button"
          className={`support-filter-chip${categoryId === "all" ? " is-active" : ""}`}
          onClick={() => setCategoryId("all")}
        >
          All topics
        </button>
        {SUPPORT_TICKET_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`support-filter-chip${categoryId === category.id ? " is-active" : ""}`}
            onClick={() => setCategoryId(category.id)}
          >
            {SUPPORT_TICKET_CATEGORY_LABELS[category.id]}
          </button>
        ))}
      </div>

      <div className="support-kb-grid">
        {articles.map((article) => (
          <KnowledgeBaseCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
