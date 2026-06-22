import {
  HOUSE_PIPELINE_ANONYMITY_RULES,
  HOUSE_PIPELINE_FUTURE_MODULES
} from "../../../../constants/houseInstituteDataPipeline";
import type { HouseInstituteDataPipelineBundle } from "../../../../types/houseInstituteDataPipeline";
import { InstitutionInsightCard } from "./InstitutionInsightCard";
import { LegacyResearchCard } from "./LegacyResearchCard";
import { ObservatoryFeedCard } from "./ObservatoryFeedCard";
import { ResearchPipelineCard } from "./ResearchPipelineCard";
import { TrendCategoryCard } from "./TrendCategoryCard";

type HouseInstituteDataPipelineSectionProps = {
  pipeline: HouseInstituteDataPipelineBundle;
};

export function HouseInstituteDataPipelineSection({ pipeline }: HouseInstituteDataPipelineSectionProps) {
  return (
    <>
      <section className="hins-page__section">
        <header className="bi-section-head">
          <h2>Data pipeline</h2>
          <p>Anonymous aggregates from journey outcomes — no identities, no private notes.</p>
        </header>
        <ResearchPipelineCard
          dataSources={pipeline.dataSources}
          bridgeSummary={pipeline.bridgeSummary}
          updatedAt={pipeline.updatedAt}
        />
      </section>

      <section className="hins-page__section">
        <header className="bi-section-head">
          <h2>Research outputs</h2>
          <p>Trend categories prepared for House Institute inquiry.</p>
        </header>
        <div className="hidp-page__grid">
          {pipeline.trendCategories.map((category) => (
            <TrendCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="hins-page__section hidp-page__split">
        <InstitutionInsightCard insights={pipeline.institutionInsights} />
        <LegacyResearchCard legacyResearch={pipeline.legacyResearch} />
      </section>

      <section className="hins-page__section">
        <ObservatoryFeedCard feed={pipeline.observatoryFeed} />
      </section>

      <section className="hins-page__future institute-glass">
        <h2>Anonymity rules</h2>
        <ul>
          {HOUSE_PIPELINE_ANONYMITY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="hins-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {HOUSE_PIPELINE_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
