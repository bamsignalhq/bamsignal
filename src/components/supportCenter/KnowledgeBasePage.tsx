import { useMemo, useState } from "react";
import {
  SUPPORT_TICKET_TYPES,
  SUPPORT_TICKET_TYPE_LABELS,
  type SupportTicketTypeId
} from "../../constants/supportCenter";
import { filterKnowledgeBaseByType, listKnowledgeBaseArticles } from "../../utils/supportCenterLogic";
import { KnowledgeBaseCard } from "./KnowledgeBaseCard";

export function KnowledgeBasePage() {
  const [typeId, setTypeId] = useState<SupportTicketTypeId | "all">("all");

  const articles = useMemo(() => {
    if (typeId === "all") return listKnowledgeBaseArticles();
    return filterKnowledgeBaseByType(typeId);
  }, [typeId]);

  return (
    <div className="support-center-page">
      <header className="support-center-page__head cc-reveal">
        <h1>Knowledge base</h1>
        <p>
          Self-service guides for technical support, billing, consultations, account recovery, profile
          issues, safety, and general questions.
        </p>
      </header>

      <div className="support-center-filters cc-reveal">
        <button
          type="button"
          className={`support-filter-chip${typeId === "all" ? " is-active" : ""}`}
          onClick={() => setTypeId("all")}
        >
          All topics
        </button>
        {SUPPORT_TICKET_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`support-filter-chip${typeId === type.id ? " is-active" : ""}`}
            onClick={() => setTypeId(type.id)}
          >
            {SUPPORT_TICKET_TYPE_LABELS[type.id]}
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
