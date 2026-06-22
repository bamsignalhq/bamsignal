import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CONCIERGE_DASHBOARD_SUBTITLE,
  CONCIERGE_DASHBOARD_TITLE,
  CONCIERGE_MEMBER_FLAGS,
  CONCIERGE_PIPELINE
} from "../../../constants/conciergeConsultant";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../../../constants/signalConcierge";
import {
  fetchAdminConciergeMember,
  fetchAdminConciergeMembers,
  fetchAdminConciergeMemberActivity,
  fetchAdminConciergeConsultants,
  saveAdminConciergeMemberNote,
  saveAdminConciergeMemberStatus,
  transferAdminConciergeMember,
  journeyTransitionAdminMember
} from "../../../services/adminConcierge";
import type { ConciergeFollowUpTask, ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { EMPTY_CONCIERGE_FILTERS } from "../../../types/conciergeConsultant";
import type { ConciergeMemberFilters } from "../../../types/conciergeConsultant";
import { ConciergeMemberProfilePage } from "./ConciergeMemberProfilePage";
import { ConsultantSearchBar } from "./ConsultantSearchBar";
import { IntroductionEnginePage } from "./IntroductionEnginePage";
import { RelationshipFollowUpPage } from "./RelationshipFollowUpPage";
import { ConsultantDirectoryPage } from "./ConsultantDirectoryPage";
import { JourneyArchivePage } from "./JourneyArchivePage";
import { LegacyExperiencePage } from "./LegacyExperiencePage";
import { LegacyFamilyPage } from "./legacyFamilies/LegacyFamilyPage";
import { SuccessStoryPage } from "./SuccessStoryPage";
import { ConsultantPerformancePage } from "./ConsultantPerformancePage";
import { useAdminToast } from "../AdminToast";

type ConsultantView = "members" | "introductions" | "follow-up" | "consultants" | "performance" | "archive" | "legacy" | "families" | "stories";

type DashboardInsight = {
  id: string;
  label: string;
  count: number;
  hint: string;
};

function membersNeedingAttention(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  const now = Date.now();
  return members.filter((member) => {
    const hasPriorityFlag = member.flags.some(
      (flag) => flag === "high-priority" || flag === "sensitive-case"
    );
    const overdueTask = member.followUpTasks.some(
      (task) => !task.completed && new Date(task.dueAt).getTime() < now
    );
    return hasPriorityFlag || overdueTask;
  });
}

function openFollowUpTasks(members: ConciergeMemberRecord[]): ConciergeFollowUpTask[] {
  return members
    .flatMap((member) => member.followUpTasks)
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

function recentUpdates(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return [...members]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
}

export function ConsultantDashboardPage() {
  const { pushToast } = useAdminToast();
  const [view, setView] = useState<ConsultantView>("members");
  const [filters, setFilters] = useState<ConciergeMemberFilters>(EMPTY_CONCIERGE_FILTERS);
  const [members, setMembers] = useState<ConciergeMemberRecord[]>([]);
  const [allMembers, setAllMembers] = useState<ConciergeMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<ConciergeMemberRecord | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);
  const [consultants, setConsultants] = useState<
    { id: string; name: string; status?: string }[]
  >([]);
  const [memberActivity, setMemberActivity] = useState<
    import("../../../types/conciergeConsultantDirectory").ConciergeConsultantActivity[]
  >([]);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const [allResult, filteredResult] = await Promise.all([
      fetchAdminConciergeMembers(EMPTY_CONCIERGE_FILTERS),
      fetchAdminConciergeMembers(filters)
    ]);
    setAllMembers(allResult.members);
    setMembers(filteredResult.members);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    void fetchAdminConciergeConsultants().then((result) => {
      setConsultants(
        result.consultants.map((consultant) => ({
          id: consultant.id,
          name: consultant.name,
          status: consultant.status
        }))
      );
    });
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedMember(null);
      setMemberActivity([]);
      return;
    }
    void fetchAdminConciergeMember(selectedId).then((result) => {
      setSelectedMember(result.member);
    });
    void fetchAdminConciergeMemberActivity(selectedId).then((result) => {
      setMemberActivity(result.activity);
    });
  }, [selectedId, members]);

  const pipelineCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const status of CONCIERGE_PIPELINE) counts.set(status, 0);
    for (const member of allMembers) {
      counts.set(member.status, (counts.get(member.status) ?? 0) + 1);
    }
    return counts;
  }, [allMembers]);

  const insights = useMemo((): DashboardInsight[] => {
    const attention = membersNeedingAttention(allMembers);
    const followUps = openFollowUpTasks(allMembers);
    return [
      {
        id: "attention",
        label: "Members needing attention",
        count: attention.length,
        hint: "High priority, sensitive cases, or overdue follow-ups"
      },
      {
        id: "consultations",
        label: "Pending consultations",
        count: pipelineCounts.get("consultation-scheduled") ?? 0,
        hint: "Consultation scheduled"
      },
      {
        id: "active-search",
        label: "Active searches",
        count: pipelineCounts.get("active-search") ?? 0,
        hint: "Members actively being matched"
      },
      {
        id: "introductions",
        label: "Introductions in progress",
        count: pipelineCounts.get("introductions-in-progress") ?? 0,
        hint: "Ongoing introductions"
      },
      {
        id: "updates",
        label: "Recent updates",
        count: recentUpdates(allMembers).length,
        hint: "Latest member activity"
      },
      {
        id: "follow-up",
        label: "Follow-up reminders",
        count: followUps.length,
        hint: "Open consultant reminders"
      }
    ];
  }, [allMembers, pipelineCounts]);

  const handleAddNote = async (body: string) => {
    if (!selectedId) return;
    const result = await saveAdminConciergeMemberNote(selectedId, body);
    if (!result.ok) {
      pushToast("Could not save note.");
      return;
    }
    pushToast("Private note saved.");
    await loadMembers();
    const refreshed = await fetchAdminConciergeMember(selectedId);
    setSelectedMember(refreshed.member);
  };

  const handleJourneyTransition = async (consultantId: string, reason: string) => {
    if (!selectedId) return;
    const result = await journeyTransitionAdminMember(selectedId, consultantId, reason);
    if (!result.ok) {
      pushToast("Could not complete journey transition.");
      return;
    }
    pushToast("Journey transition complete — continuity preserved.");
    await loadMembers();
    const refreshed = await fetchAdminConciergeMember(selectedId);
    setSelectedMember(refreshed.member);
    const activity = await fetchAdminConciergeMemberActivity(selectedId);
    setMemberActivity(activity.activity);
  };

  const handleStatusChange = async (status: ConciergeMemberRecord["status"]) => {
    if (!selectedId) return;
    const result = await saveAdminConciergeMemberStatus(selectedId, status);
    if (!result.ok) {
      pushToast("Could not update status.");
      return;
    }
    pushToast("Member status updated.");
    await loadMembers();
    const refreshed = await fetchAdminConciergeMember(selectedId);
    setSelectedMember(refreshed.member);
  };

  const applyInsightFilter = (insightId: string) => {
    if (insightId === "consultations") {
      setFilters((current) => ({ ...current, status: "consultation-scheduled" }));
      return;
    }
    if (insightId === "active-search") {
      setFilters((current) => ({ ...current, status: "active-search" }));
      return;
    }
    if (insightId === "introductions") {
      setFilters((current) => ({ ...current, status: "introductions-in-progress" }));
      return;
    }
    if (insightId === "attention") {
      setFilters(EMPTY_CONCIERGE_FILTERS);
    }
  };

  return (
    <div className="concierge-consultant-dashboard">
      <header className="concierge-consultant-dashboard__head">
        <div>
          <h2>{CONCIERGE_DASHBOARD_TITLE}</h2>
          <p>{CONCIERGE_DASHBOARD_SUBTITLE}</p>
        </div>
        <div className="concierge-consultant-dashboard__tabs">
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "members" ? " is-active" : ""}`}
            onClick={() => setView("members")}
          >
            Members
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "consultants" ? " is-active" : ""}`}
            onClick={() => {
              setView("consultants");
              setSelectedConsultantId(null);
            }}
          >
            Consultants
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "introductions" ? " is-active" : ""}`}
            onClick={() => setView("introductions")}
          >
            Introductions
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "follow-up" ? " is-active" : ""}`}
            onClick={() => setView("follow-up")}
          >
            Follow-Up
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "performance" ? " is-active" : ""}`}
            onClick={() => setView("performance")}
          >
            Performance
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "archive" ? " is-active" : ""}`}
            onClick={() => setView("archive")}
          >
            Archive
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "legacy" ? " is-active" : ""}`}
            onClick={() => setView("legacy")}
          >
            Legacy Experience
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "families" ? " is-active" : ""}`}
            onClick={() => setView("families")}
          >
            Legacy Families
          </button>
          <button
            type="button"
            className={`concierge-consultant-dashboard__tab${view === "stories" ? " is-active" : ""}`}
            onClick={() => setView("stories")}
          >
            Stories
          </button>
        </div>
      </header>

      {view === "stories" ? <SuccessStoryPage /> : null}

      {view === "performance" ? <ConsultantPerformancePage /> : null}

      {view === "families" ? <LegacyFamilyPage /> : null}

      {view === "legacy" ? <LegacyExperiencePage /> : null}

      {view === "archive" ? <JourneyArchivePage /> : null}

      {view === "introductions" ? <IntroductionEnginePage /> : null}

      {view === "follow-up" ? <RelationshipFollowUpPage /> : null}

      {view === "consultants" ? (
        <ConsultantDirectoryPage
          selectedConsultantId={selectedConsultantId}
          onSelectConsultant={setSelectedConsultantId}
        />
      ) : null}

      {view === "members" ? (
        <>
          <section className="concierge-dashboard-insights" aria-label="Dashboard overview">
            {insights.map((insight, index) => (
              <button
                key={insight.id}
                type="button"
                className="concierge-dashboard-insight concierge-consultant-card--glass cc-reveal"
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => applyInsightFilter(insight.id)}
              >
                <strong>{insight.count}</strong>
                <span>{insight.label}</span>
                <p>{insight.hint}</p>
              </button>
            ))}
          </section>

          <section className="concierge-consultant-dashboard__pipeline" aria-label="Member journey pipeline">
            {CONCIERGE_PIPELINE.map((status) => (
              <button
                key={status}
                type="button"
                className={`concierge-consultant-pipeline__chip${
                  filters.status === status ? " concierge-consultant-pipeline__chip--active" : ""
                }`}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    status: current.status === status ? "all" : status
                  }))
                }
              >
                <span>{SIGNAL_CONCIERGE_STATUS_LABELS[status]}</span>
                <strong>{pipelineCounts.get(status) ?? 0}</strong>
              </button>
            ))}
          </section>

          <ConsultantSearchBar filters={filters} onChange={setFilters} />

          <div className="concierge-consultant-dashboard__body">
            <aside className="concierge-consultant-dashboard__list concierge-consultant-card--glass">
              <h3>Members</h3>
              {loading ? <p className="concierge-consultant__empty">Loading members…</p> : null}
              {!loading && members.length === 0 ? (
                <p className="concierge-consultant__empty">No members match these filters.</p>
              ) : null}
              <ul>
                {members.map((member) => (
                  <li key={member.id}>
                    <button
                      type="button"
                      className={`concierge-consultant-member-row${
                        selectedId === member.id ? " concierge-consultant-member-row--active" : ""
                      }`}
                      onClick={() => setSelectedId(member.id)}
                    >
                      <div>
                        <strong>{member.aboutYou.name}</strong>
                        <span>
                          {member.journeyId ? `${member.journeyId} · ` : ""}
                          {member.aboutYou.city} · {SIGNAL_CONCIERGE_STATUS_LABELS[member.status]}
                        </span>
                      </div>
                      {member.flags.length ? (
                        <div className="concierge-consultant-member-row__flags">
                          {member.flags.slice(0, 2).map((flag) => {
                            const label =
                              CONCIERGE_MEMBER_FLAGS.find((item) => item.id === flag)?.label ?? flag;
                            return (
                              <span key={flag} className="concierge-consultant-member-row__flag">
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="concierge-consultant-dashboard__detail">
              {selectedMember ? (
                <ConciergeMemberProfilePage
                  member={selectedMember}
                  consultants={consultants}
                  memberActivity={memberActivity}
                  onAddNote={handleAddNote}
                  onStatusChange={(status) => void handleStatusChange(status)}
                  onJourneyTransition={(consultantId, reason) =>
                    void handleJourneyTransition(consultantId, reason)
                  }
                />
              ) : (
                <div className="concierge-consultant-card concierge-consultant-card--glass concierge-consultant-dashboard__placeholder cc-reveal">
                  <h3>Select a member</h3>
                  <p>Review private profiles, journey, introductions, and follow-up reminders.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
