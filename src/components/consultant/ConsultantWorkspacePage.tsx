import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CONSULTANT_CRM_BRAND,
  CONSULTANT_CRM_FUTURE_MODULES,
  CONSULTANT_CRM_SECTIONS,
  CONSULTANT_CRM_TAGLINE,
  CONSULTANT_CRM_VIEWS,
  type ConsultantCrmSectionId,
  type ConsultantCrmViewId
} from "../../constants/consultantCrm";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../../constants/signalConcierge";
import { fetchAdminConciergeConsultantPortfolio } from "../../services/adminConcierge";
import type { ConsultantCrmBundle } from "../../types/consultantCrm";
import type { ConciergeMemberRecord } from "../../types/conciergeConsultant";
import type { IntroductionRecord } from "../../types/conciergeIntroduction";
import { listIntroductionRecords } from "../../utils/conciergeIntroductionStore";
import {
  buildConsultantCrmBundle,
  filterCrmSectionRows,
  openPaymentRowsForMembers,
  resolveCrmViewSection
} from "../../utils/consultantCrmLogic";
import { ConsultantActivityCard } from "./ConsultantActivityCard";
import { ConsultantAgendaCard } from "./ConsultantAgendaCard";
import { ConsultantPipelineCard } from "./ConsultantPipelineCard";
import { ConsultantTasksCard } from "./ConsultantTasksCard";

type ConsultantWorkspacePageProps = {
  consultantId: string;
};

const PIPELINE_TO_SECTION: Record<string, ConsultantCrmSectionId> = {
  applications: "applications",
  consultations: "consultations",
  "active-search": "members",
  introductions: "introductions",
  "follow-ups": "follow-ups",
  relationships: "members"
};

const VIEW_TO_SECTION: Record<ConsultantCrmViewId, ConsultantCrmSectionId> = {
  "my-members": "members",
  "my-meetings": "consultations",
  "pending-applications": "applications",
  "pending-introductions": "introductions",
  "follow-ups": "follow-ups",
  "health-alerts": "members"
};

function emptyBundle(consultantId: string): ConsultantCrmBundle {
  return buildConsultantCrmBundle({
    consultantId,
    members: [],
    meetings: [],
    activity: [],
    introductions: [],
    payments: []
  });
}

export function ConsultantWorkspacePage({ consultantId }: ConsultantWorkspacePageProps) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<ConciergeMemberRecord[]>([]);
  const [bundle, setBundle] = useState<ConsultantCrmBundle>(() => emptyBundle(consultantId));
  const [activeSection, setActiveSection] = useState<ConsultantCrmSectionId>("members");
  const [activeView, setActiveView] = useState<ConsultantCrmViewId | null>(null);
  const [introductions] = useState<IntroductionRecord[]>(() => listIntroductionRecords());

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminConciergeConsultantPortfolio(consultantId);
    setMembers(result.members);
    setBundle(
      buildConsultantCrmBundle({
        consultantId,
        members: result.members,
        meetings: result.meetings,
        activity: result.activity,
        introductions,
        payments: openPaymentRowsForMembers(result.members)
      })
    );
    setLoading(false);
  }, [consultantId, introductions]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const sectionRows = useMemo(
    () =>
      filterCrmSectionRows(bundle, activeSection, activeView, members, consultantId, introductions),
    [bundle, activeSection, activeView, members, consultantId, introductions]
  );

  const handleViewSelect = (viewId: ConsultantCrmViewId) => {
    setActiveView((current) => (current === viewId ? null : viewId));
    setActiveSection(VIEW_TO_SECTION[viewId]);
  };

  const handlePipelineSelect = (stageId: string) => {
    const section = PIPELINE_TO_SECTION[stageId];
    if (section) setActiveSection(section);
    setActiveView(null);
  };

  if (loading) {
    return (
      <div className="consultant-crm">
        <p className="concierge-consultant__empty">Loading workspace…</p>
      </div>
    );
  }

  return (
    <div className="consultant-crm">
      <header className="consultant-crm__head">
        <div>
          <p className="consultant-crm__eyebrow">{CONSULTANT_CRM_BRAND}</p>
          <h2>Workspace</h2>
          <p>{CONSULTANT_CRM_TAGLINE}</p>
        </div>
      </header>

      <div className="consultant-crm__views" role="toolbar" aria-label="CRM views">
        {CONSULTANT_CRM_VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            className={`consultant-crm__view-chip${activeView === view.id ? " consultant-crm__view-chip--active" : ""}`}
            onClick={() => handleViewSelect(view.id)}
            aria-pressed={activeView === view.id}
          >
            {view.label}
          </button>
        ))}
      </div>

      <div className="consultant-crm__cards">
        <ConsultantPipelineCard stages={bundle.pipeline} onStageSelect={handlePipelineSelect} />
        <ConsultantTasksCard tasks={bundle.tasks} />
        <ConsultantAgendaCard agenda={bundle.agenda} />
        <ConsultantActivityCard activity={bundle.activity} />
      </div>

      <div className="consultant-crm__sections" role="tablist" aria-label="CRM sections">
        {CONSULTANT_CRM_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            className={`consultant-crm__section-tab${activeSection === section.id ? " consultant-crm__section-tab--active" : ""}`}
            onClick={() => {
              setActiveSection(section.id);
              if (activeView && resolveCrmViewSection(activeView) !== section.id) {
                setActiveView(null);
              }
            }}
          >
            <span>{section.label}</span>
            <em>{bundle.sectionCounts[section.id]}</em>
          </button>
        ))}
      </div>

      <section className="consultant-crm-section concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{CONSULTANT_CRM_SECTIONS.find((section) => section.id === activeSection)?.label}</h3>
          <p>
            {activeView
              ? CONSULTANT_CRM_VIEWS.find((view) => view.id === activeView)?.label
              : "All items in this section"}
          </p>
        </header>
        {sectionRows.length === 0 ? (
          <p className="concierge-consultant__empty">Nothing here right now.</p>
        ) : (
          <ul className="consultant-crm-section__rows">
            {sectionRows.map((row) => (
              <li key={row.id}>
                <strong>{row.primary}</strong>
                <span>{row.secondary}</span>
                {row.meta ? (
                  <em>
                    {activeSection === "members" && row.meta in SIGNAL_CONCIERGE_STATUS_LABELS
                      ? SIGNAL_CONCIERGE_STATUS_LABELS[
                          row.meta as keyof typeof SIGNAL_CONCIERGE_STATUS_LABELS
                        ]
                      : row.meta}
                  </em>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="consultant-crm-future" aria-label="Future CRM modules">
        <p className="consultant-crm-future__label">Future-ready</p>
        <ul>
          {CONSULTANT_CRM_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
