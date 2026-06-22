import { useMemo } from "react";
import {
  INSTITUTIONAL_KNOWLEDGE_BASE_LABEL,
  INSTITUTIONAL_KNOWLEDGE_BASE_PURPOSE_COPY,
  INSTITUTIONAL_KNOWLEDGE_BASE_RESERVED_COPY,
  INSTITUTIONAL_KNOWLEDGE_BASE_SUBCOPY,
  INSTITUTIONAL_KNOWLEDGE_BASE_TITLE,
  INSTITUTIONAL_KNOWLEDGE_FUTURE_MODULES,
  KNOWLEDGE_CATEGORIES,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/institutionalKnowledgeBase";
import { getInstitutionalKnowledgeBaseBundle } from "../../../utils/InstitutionalKnowledgeBaseEngine";
import { InstitutionMemoryCard } from "./InstitutionMemoryCard";
import { KnowledgeArticleCard } from "./KnowledgeArticleCard";
import { KnowledgeCategoryCard } from "./KnowledgeCategoryCard";
import { KnowledgeTimelineCard } from "./KnowledgeTimelineCard";

export function KnowledgeBasePage() {
  const bundle = useMemo(() => getInstitutionalKnowledgeBaseBundle(), []);

  return (
    <div className="ikb-page">
      <header className="ikb-page__hero institute-glass">
        <p className="bi-page__eyebrow">{INSTITUTIONAL_KNOWLEDGE_BASE_LABEL}</p>
        <h1>{INSTITUTIONAL_KNOWLEDGE_BASE_TITLE}</h1>
        <p>{INSTITUTIONAL_KNOWLEDGE_BASE_SUBCOPY}</p>
        <p className="ikb-page__labels">
          {UNDERSTANDING_RELATIONSHIPS_LABEL} · Institutional Memory · Century Stewardship
        </p>
        <p className="ikb-page__purpose">{INSTITUTIONAL_KNOWLEDGE_BASE_PURPOSE_COPY}</p>
      </header>

      <section className="ikb-page__section">
        <InstitutionMemoryCard memory={bundle.institutionMemory} />
      </section>

      <section className="ikb-page__prepared institute-glass">
        <h2>Knowledge categories</h2>
        <p>{bundle.categoryCount} categories — architecture preview, not search or assistants.</p>
        <ul className="ikb-page__prepared-list">
          {KNOWLEDGE_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ikb-page__section">
        <header className="bi-section-head">
          <h2>Categories</h2>
          <p>Mission through Culture — central institutional memory, never scattered silos.</p>
        </header>
        <div className="ikb-page__grid">
          {bundle.categories.map((category) => (
            <KnowledgeCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="ikb-page__section">
        <header className="bi-section-head">
          <h2>Knowledge articles</h2>
          <p>Prepared articles — lessons and principles documented, not published yet.</p>
        </header>
        <div className="ikb-page__grid">
          {bundle.articles.map((article) => (
            <KnowledgeArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="ikb-page__section">
        <KnowledgeTimelineCard entries={bundle.timeline} />
      </section>

      <section className="ikb-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {INSTITUTIONAL_KNOWLEDGE_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ikb-page__reserved-note institute-glass">
        <p>{INSTITUTIONAL_KNOWLEDGE_BASE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
