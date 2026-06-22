import { useMemo } from "react";
import {
  BAMSIGNAL_INSIGHTS_FUTURE_CAPABILITIES,
  BAMSIGNAL_INSIGHTS_PURPOSE_COPY,
  BAMSIGNAL_INSIGHTS_RESERVED_COPY,
  BAMSIGNAL_INSIGHTS_SUBCOPY,
  BAMSIGNAL_INSIGHTS_TITLE,
  CONVERSATIONS_LABEL,
  INSIGHT_CONTENT_PILLARS,
  INSIGHTS_LABEL,
  PERSPECTIVES_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalInsights";
import { getBamSignalInsightsBundle } from "../../../utils/BamSignalInsightsEngine";
import { ExpertCard } from "./ExpertCard";
import { InsightArticleCard } from "./InsightArticleCard";
import { InterviewCard } from "./InterviewCard";
import { PodcastCard } from "./PodcastCard";

export function InsightsPage() {
  const bundle = useMemo(() => getBamSignalInsightsBundle(), []);

  return (
    <div className="bsi-page">
      <header className="bsi-page__hero institute-glass">
        <p className="bi-page__eyebrow">{INSIGHTS_LABEL}</p>
        <h1>{BAMSIGNAL_INSIGHTS_TITLE}</h1>
        <p>{BAMSIGNAL_INSIGHTS_SUBCOPY}</p>
        <p className="bsi-page__labels">
          {PERSPECTIVES_LABEL} · {CONVERSATIONS_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bsi-page__purpose">{BAMSIGNAL_INSIGHTS_PURPOSE_COPY}</p>
      </header>

      <section className="bsi-page__prepared institute-glass">
        <h2>Content pillars</h2>
        <p>{INSIGHT_CONTENT_PILLARS.length} pillars — architecture preview, never a blog or content feed.</p>
        <ul className="bsi-page__prepared-list">
          {bundle.pillars.map((pillar) => (
            <li key={pillar.id}>
              <strong>{pillar.label}</strong>
              <span>{pillar.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsi-page__section">
        <header className="bi-section-head">
          <h2>Articles</h2>
          <p>Perspectives prepared — not published yet.</p>
        </header>
        <div className="bsi-page__grid">
          {bundle.articles.map((article) => (
            <InsightArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="bsi-page__section">
        <header className="bi-section-head">
          <h2>Podcasts</h2>
          <p>Conversations reserved — dignity-first audio.</p>
        </header>
        <div className="bsi-page__grid">
          {bundle.podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      </section>

      <section className="bsi-page__section">
        <header className="bi-section-head">
          <h2>Interviews</h2>
          <p>Expert and member conversations — consent-first framing.</p>
        </header>
        <div className="bsi-page__grid">
          {bundle.interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      </section>

      <section className="bsi-page__section">
        <header className="bi-section-head">
          <h2>Experts</h2>
          <p>Trusted voices — perspectives without popularity scoring.</p>
        </header>
        <div className="bsi-page__grid">
          {bundle.experts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      </section>

      <section className="bsi-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {BAMSIGNAL_INSIGHTS_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="bsi-page__reserved">{BAMSIGNAL_INSIGHTS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
