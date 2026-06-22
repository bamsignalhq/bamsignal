import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AI_ASSISTED_AUTHORITY_COPY,
  AI_ASSISTED_CAPABILITIES,
  AI_ASSISTED_CONSULTANT_BRAND,
  AI_ASSISTED_FUTURE_MODULES,
  AI_ASSISTED_RULES,
  AI_ASSISTED_CONSULTANT_TAGLINE
} from "../../constants/aiAssistedConsultant";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../../constants/signalConcierge";
import type { SignalConciergeStatus } from "../../constants/signalConcierge";
import { EMPTY_CONCIERGE_FILTERS } from "../../types/conciergeConsultant";
import { fetchAdminConciergeConsultantPortfolio, fetchAdminConciergeMembers } from "../../services/adminConcierge";
import type { ConciergeMemberRecord } from "../../types/conciergeConsultant";
import type { ConciergeScheduledMeeting } from "../../types/conciergeConsultantDirectory";
import type { AIAssistedWorkspaceBundle } from "../../types/aiAssistedConsultant";
import { buildAIAssistedWorkspaceBundle } from "../../utils/aiAssistedConsultantLogic";
import { AISummaryCard } from "./AISummaryCard";
import { AIInsightsCard } from "./AIInsightsCard";
import { CompatibilityObservationsCard } from "./CompatibilityObservationsCard";
import { JourneySummaryCard } from "./JourneySummaryCard";
import { MeetingPreparationCard } from "./MeetingPreparationCard";
import { SuggestedQuestionsCard } from "./SuggestedQuestionsCard";

type AIAssistedConsultantWorkspacePageProps = {
  consultantId?: string;
  mode?: "portfolio" | "admin";
};

export function AIAssistedConsultantWorkspacePage({
  consultantId,
  mode = "portfolio"
}: AIAssistedConsultantWorkspacePageProps) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<ConciergeMemberRecord[]>([]);
  const [meetings, setMeetings] = useState<ConciergeScheduledMeeting[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    let loadedMembers: ConciergeMemberRecord[] = [];
    let loadedMeetings: ConciergeScheduledMeeting[] = [];
    if (mode === "admin" || !consultantId) {
      const result = await fetchAdminConciergeMembers(EMPTY_CONCIERGE_FILTERS);
      loadedMembers = result.members;
    } else {
      const result = await fetchAdminConciergeConsultantPortfolio(consultantId);
      loadedMembers = result.members;
      loadedMeetings = result.meetings;
    }
    setMembers(loadedMembers);
    setMeetings(loadedMeetings);
    setSelectedMemberId((current) => current ?? loadedMembers[0]?.id ?? null);
    setLoading(false);
  }, [consultantId, mode]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const bundle = useMemo<AIAssistedWorkspaceBundle>(
    () =>
      buildAIAssistedWorkspaceBundle({
        members,
        meetings,
        selectedMemberId
      }),
    [members, meetings, selectedMemberId]
  );

  const selected = bundle.selected;
  const capabilityList = useMemo(() => AI_ASSISTED_CAPABILITIES.map((item) => item.label).join(" · "), []);

  if (loading) {
    return (
      <div className="ai-assist-workspace">
        <p className="concierge-consultant__empty">Loading AI-assisted workspace…</p>
      </div>
    );
  }

  return (
    <div className="ai-assist-workspace">
      <header className="ai-assist-workspace__head">
        <p className="ai-assist-workspace__eyebrow">{AI_ASSISTED_CONSULTANT_BRAND}</p>
        <h2>Consultant Assistance</h2>
        <p>{AI_ASSISTED_CONSULTANT_TAGLINE}</p>
        <p className="ai-assist-workspace__authority">{AI_ASSISTED_AUTHORITY_COPY}</p>
      </header>

      <aside className="ai-assist-workspace__rules" aria-label="AI assistance rules">
        <ul>
          {AI_ASSISTED_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </aside>

      <div className="ai-assist-workspace__picker">
        <label htmlFor="ai-assist-member-select">
          <span>Member</span>
          <select
            id="ai-assist-member-select"
            value={selectedMemberId ?? ""}
            onChange={(event) => setSelectedMemberId(event.target.value || null)}
          >
            {bundle.members.length === 0 ? <option value="">No assigned members</option> : null}
            {bundle.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ·{" "}
                {SIGNAL_CONCIERGE_STATUS_LABELS[member.status as SignalConciergeStatus] ?? member.status}
              </option>
            ))}
          </select>
        </label>
        <p className="ai-assist-workspace__capabilities">{capabilityList}</p>
      </div>

      {selected ? (
        <div className="ai-assist-workspace__grid">
          <AISummaryCard memberName={selected.memberName} summary={selected.summary} />
          <AIInsightsCard insights={selected.insights} />
          <CompatibilityObservationsCard observations={selected.compatibilityObservations} />
          <SuggestedQuestionsCard questions={selected.suggestedQuestions} />
          <MeetingPreparationCard preparation={selected.meetingPreparation} />
          <JourneySummaryCard
            timeline={selected.journeySummary}
            followUps={selected.followUpSuggestions}
            relationshipHealth={selected.relationshipHealth}
          />
        </div>
      ) : (
        <p className="concierge-consultant__empty">Select a member to view AI-assisted drafts.</p>
      )}

      <aside className="ai-assist-future" aria-label="Future AI modules">
        <p className="ai-assist-future__label">Future-ready</p>
        <ul>
          {AI_ASSISTED_FUTURE_MODULES.map((module) => (
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
