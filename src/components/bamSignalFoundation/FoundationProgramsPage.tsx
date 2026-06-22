import { useMemo } from "react";
import {
  BAMSIGNAL_FOUNDATION_RESERVED_COPY,
  GIVING_BACK_LABEL,
  IMPACT_LABEL,
  SUPPORTING_FAMILIES_LABEL
} from "../../constants/bamSignalFoundation";
import { getBamSignalFoundationBundle } from "../../utils/BamSignalFoundationEngine";
import type { FoundationProgramViewModel } from "../../utils/bamSignalFoundationLogic";
import { FamilySupportCard } from "./FamilySupportCard";
import { ScholarshipProgramCard } from "./ScholarshipProgramCard";
import { WidowsSupportCard } from "./WidowsSupportCard";

function StandardProgramCard({ program }: { program: FoundationProgramViewModel }) {
  return (
    <article className="bf-program-card foundation-glass">
      <header className="bf-program-card__head">
        <h3>{program.title}</h3>
        <span className="bf-program-card__badge">{IMPACT_LABEL}</span>
      </header>
      <p className="bf-program-card__labels">
        {GIVING_BACK_LABEL} · {SUPPORTING_FAMILIES_LABEL}
      </p>
      <p className="bf-program-card__description">{program.description}</p>
      <p className="bf-program-card__status">{program.statusLabel}</p>
    </article>
  );
}

function renderProgramCard(program: FoundationProgramViewModel) {
  switch (program.cardKind) {
    case "scholarship":
      return <ScholarshipProgramCard key={program.id} program={program} />;
    case "widows":
      return <WidowsSupportCard key={program.id} program={program} />;
    case "family":
      return <FamilySupportCard key={program.id} program={program} />;
    default:
      return <StandardProgramCard key={program.id} program={program} />;
  }
}

export function FoundationProgramsPage() {
  const bundle = useMemo(() => getBamSignalFoundationBundle(), []);

  return (
    <div className="bf-page">
      <header className="bf-page__hero foundation-glass">
        <p className="bf-page__eyebrow">{IMPACT_LABEL}</p>
        <h1>Foundation Programs</h1>
        <p>Social impact programs prepared — not enabled yet.</p>
      </header>

      <section className="bf-page__section">
        <header className="bf-section-head">
          <h2>All programs</h2>
          <p>Alphabetical — never a marketing campaign.</p>
        </header>
        <div className="bf-page__grid">{bundle.programs.map(renderProgramCard)}</div>
      </section>

      <p className="bf-page__reserved foundation-glass">{BAMSIGNAL_FOUNDATION_RESERVED_COPY}</p>
    </div>
  );
}
