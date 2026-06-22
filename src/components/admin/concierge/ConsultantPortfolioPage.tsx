import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CONCIERGE_CONSULTANT_ROLE_LABELS,
  CONCIERGE_PORTFOLIO_TITLE
} from "../../../constants/conciergeConsultantRoles";
import {
  CONCIERGE_COMMUNICATION_POLICY_COPY,
  CONCIERGE_CONSULTANT_METRIC_LABELS,
  CONCIERGE_PROFESSIONAL_CHANNEL_LABELS
} from "../../../constants/conciergeConsultantCommunication";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../../../constants/signalConcierge";
import {
  assignAdminConciergeMember,
  executeAdminConsultantExitProtocol,
  fetchAdminConciergeConsultantPortfolio,
  fetchAdminConciergeConsultants,
  transferAdminConciergeMember
} from "../../../services/adminConcierge";
import type { ConciergeConsultantActivity, ConciergeScheduledMeeting } from "../../../types/conciergeConsultantDirectory";
import type { ConciergeConsultantMetrics, ConciergeConsultantRecord } from "../../../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import {
  portfolioAssignedMembers,
  portfolioIntroductionsInProgress,
  portfolioOpenFollowUps,
  portfolioPendingConsultations,
  portfolioRelationshipUpdates,
  portfolioSuccessStories
} from "../../../utils/conciergeConsultantMetrics";
import { ConsultantExitProtocolCard } from "./ConsultantExitProtocolCard";
import { ConsultantActivityTimeline } from "./ConsultantActivityTimeline";
import { ConsultantAssignmentsCard } from "./ConsultantAssignmentsCard";
import { ConsultantRoleBadge } from "./ConsultantRoleBadge";
import { ConsultantSummaryCard } from "./ConsultantSummaryCard";
import { FollowUpTasksCard } from "./FollowUpTasksCard";
import { IntroductionHistoryCard } from "./IntroductionHistoryCard";
import { PrivateNotesCard } from "./PrivateNotesCard";
import { useAdminToast } from "../AdminToast";

type ConsultantPortfolioPageProps = {
  consultantId: string;
  mode?: "admin" | "portfolio";
  onBack?: () => void;
};

function PortfolioSection({
  title,
  hint,
  children
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="consultant-portfolio-section concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{title}</h3>
        {hint ? <p>{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}

function MemberChipList({ members }: { members: ConciergeMemberRecord[] }) {
  if (!members.length) {
    return <p className="concierge-consultant__empty">Nothing here right now.</p>;
  }
  return (
    <ul className="consultant-portfolio-member-chips">
      {members.map((member) => (
        <li key={member.id}>
          <strong>{member.aboutYou.name}</strong>
          <span>
            {member.aboutYou.city} · {SIGNAL_CONCIERGE_STATUS_LABELS[member.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}

function UpcomingMeetingsList({ meetings }: { meetings: ConciergeScheduledMeeting[] }) {
  const upcoming = meetings.filter((meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now());
  if (!upcoming.length) {
    return <p className="concierge-consultant__empty">No upcoming meetings scheduled.</p>;
  }
  return (
    <ul className="consultant-portfolio-meetings">
      {upcoming.map((meeting) => (
        <li key={meeting.id}>
          <strong>{meeting.memberName}</strong>
          <span>{CONCIERGE_PROFESSIONAL_CHANNEL_LABELS[meeting.channel]}</span>
          <time dateTime={meeting.scheduledAt}>
            {new Date(meeting.scheduledAt).toLocaleString()}
          </time>
          {meeting.notes ? <p>{meeting.notes}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function MetricsGrid({ metrics }: { metrics: ConciergeConsultantMetrics }) {
  const entries = Object.entries(CONCIERGE_CONSULTANT_METRIC_LABELS) as [
    keyof ConciergeConsultantMetrics,
    string
  ][];
  return (
    <div className="consultant-portfolio-metrics">
      {entries.map(([key, label]) => {
        const value = metrics[key];
        const display =
          value === null
            ? "—"
            : key === "memberSatisfaction"
              ? `${value}%`
              : key === "responseTimeHours"
                ? `${value}h`
                : String(value);
        return (
          <div key={key} className="consultant-portfolio-metrics__item">
            <strong>{display}</strong>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ConsultantPortfolioPage({
  consultantId,
  mode = "admin",
  onBack
}: ConsultantPortfolioPageProps) {
  const { pushToast } = useAdminToast();
  const [consultant, setConsultant] = useState<ConciergeConsultantRecord | null>(null);
  const [members, setMembers] = useState<ConciergeMemberRecord[]>([]);
  const [activity, setActivity] = useState<ConciergeConsultantActivity[]>([]);
  const [meetings, setMeetings] = useState<ConciergeScheduledMeeting[]>([]);
  const [metrics, setMetrics] = useState<ConciergeConsultantMetrics | null>(null);
  const [allConsultants, setAllConsultants] = useState<ConciergeConsultantRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [portfolio, directory] = await Promise.all([
      fetchAdminConciergeConsultantPortfolio(consultantId),
      fetchAdminConciergeConsultants()
    ]);
    setConsultant(portfolio.consultant);
    setMembers(portfolio.members);
    setActivity(portfolio.activity);
    setMeetings(portfolio.meetings);
    setMetrics(portfolio.metrics);
    setAllConsultants(directory.consultants);
    setLoading(false);
  }, [consultantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const assigned = useMemo(() => portfolioAssignedMembers(members), [members]);
  const pendingConsultations = useMemo(() => portfolioPendingConsultations(members), [members]);
  const introductions = useMemo(() => portfolioIntroductionsInProgress(members), [members]);
  const followUps = useMemo(() => portfolioOpenFollowUps(members), [members]);
  const relationshipUpdates = useMemo(() => portfolioRelationshipUpdates(members), [members]);
  const successStories = useMemo(() => portfolioSuccessStories(members), [members]);

  const handleAssign = async (memberId: string, targetConsultantId: string) => {
    const result = await assignAdminConciergeMember(memberId, targetConsultantId);
    if (!result.ok) {
      pushToast("Could not assign member.");
      return;
    }
    pushToast("Member assigned.");
    await load();
  };

  const handleTransfer = async (memberId: string, targetConsultantId: string) => {
    if (targetConsultantId === consultantId) return;
    const result = await transferAdminConciergeMember(memberId, targetConsultantId);
    if (!result.ok) {
      pushToast("Could not transfer member.");
      return;
    }
    pushToast("Member transferred.");
    await load();
  };

  const handleExitProtocol = async (input: { reason: string; successorConsultantId?: string }) => {
    const result = await executeAdminConsultantExitProtocol({
      consultantId,
      reason: input.reason,
      successorConsultantId: input.successorConsultantId
    });
    if (!result.consultant) {
      pushToast("Exit protocol could not start.");
      return;
    }
    pushToast(
      result.journeysTransitioned
        ? `Exit protocol complete — ${result.journeysTransitioned} journey transition(s).`
        : "Exit protocol started — portfolio frozen for admin review."
    );
    await load();
  };

  if (loading) {
    return <p className="concierge-consultant__empty">Loading portfolio…</p>;
  }

  if (!consultant || !metrics) {
    return <p className="concierge-consultant__empty">Consultant not found.</p>;
  }

  const title = mode === "portfolio" ? CONCIERGE_PORTFOLIO_TITLE : `${consultant.name} · Portfolio`;

  return (
    <div className="consultant-portfolio-page">
      <header className="consultant-portfolio-page__head">
        <div>
          {onBack ? (
            <button type="button" className="consultant-portfolio-page__back" onClick={onBack}>
              ← Back
            </button>
          ) : null}
          <h2>{title}</h2>
          <p>{consultant.email}</p>
          <div className="consultant-portfolio-page__roles">
            <ConsultantRoleBadge role={consultant.primaryRole} primary />
            {consultant.roles
              .filter((role) => role !== consultant.primaryRole)
              .map((role) => (
                <ConsultantRoleBadge key={role} role={role} />
              ))}
          </div>
          <p className="consultant-portfolio-page__role-copy">
            {CONCIERGE_CONSULTANT_ROLE_LABELS[consultant.primaryRole]}
          </p>
        </div>
        {mode === "portfolio" ? (
          <p className="consultant-portfolio-page__policy">{CONCIERGE_COMMUNICATION_POLICY_COPY}</p>
        ) : null}
      </header>

      {mode === "admin" && consultant ? (
        <ConsultantExitProtocolCard
          consultant={consultant}
          memberCount={members.length}
          consultants={allConsultants.map((item) => ({ id: item.id, name: item.name }))}
          onExecute={(input) => void handleExitProtocol(input)}
        />
      ) : null}

      {metrics ? (
        <PortfolioSection title="Consultant metrics" hint="Tracked for accountability — no silent actions.">
          <MetricsGrid metrics={metrics} />
        </PortfolioSection>
      ) : null}

      <div className="consultant-portfolio-page__grid">
        <PortfolioSection title="Assigned members">
          <MemberChipList members={assigned} />
        </PortfolioSection>
        <PortfolioSection title="Pending consultations">
          <MemberChipList members={pendingConsultations} />
        </PortfolioSection>
        <PortfolioSection title="Introductions in progress">
          <MemberChipList members={introductions} />
        </PortfolioSection>
        <PortfolioSection title="Follow-ups" hint={`${followUps.length} open reminders`}>
          {followUps.length ? (
            <ul className="consultant-portfolio-followups">
              {followUps.map(({ member, task }) => (
                <li key={task.id}>
                  <strong>{member.aboutYou.name}</strong>
                  <span>{task.title}</span>
                  <time dateTime={task.dueAt}>Due {new Date(task.dueAt).toLocaleDateString()}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="concierge-consultant__empty">No open follow-ups.</p>
          )}
        </PortfolioSection>
        <PortfolioSection title="Upcoming meetings" hint="Scheduled and logged — professional channels only.">
          <UpcomingMeetingsList meetings={meetings} />
        </PortfolioSection>
        <PortfolioSection title="Relationship updates">
          <MemberChipList members={relationshipUpdates} />
        </PortfolioSection>
        <PortfolioSection title="Success stories">
          <MemberChipList members={successStories} />
        </PortfolioSection>
      </div>

      {mode === "admin" ? (
        <ConsultantAssignmentsCard
          members={members}
          consultants={allConsultants.map((item) => ({ id: item.id, name: item.name }))}
          onAssign={handleAssign}
          onTransfer={handleTransfer}
        />
      ) : null}

      <div className="consultant-portfolio-page__columns">
        <PortfolioSection title="Activity" hint="Who did it, when, and what changed.">
          <ConsultantActivityTimeline events={activity} />
        </PortfolioSection>
        <PortfolioSection title="Member summaries" hint="Manual summaries — future AI-ready.">
          {members
            .filter((member) => member.consultantSummary?.lines.length)
            .map((member) => (
              <div key={member.id} className="consultant-portfolio-page__member-summary">
                <h4>{member.aboutYou.name}</h4>
                <ConsultantSummaryCard summary={member.consultantSummary} />
              </div>
            ))}
          {!members.some((member) => member.consultantSummary?.lines.length) ? (
            <p className="concierge-consultant__empty">No summaries yet.</p>
          ) : null}
        </PortfolioSection>
      </div>

      <div className="consultant-portfolio-page__columns">
        {members.map((member) => (
          <div key={member.id} className="consultant-portfolio-page__member-detail">
            <h3>{member.aboutYou.name}</h3>
            <ConsultantSummaryCard summary={member.consultantSummary} />
            <PrivateNotesCard notes={member.privateNotes} />
            <IntroductionHistoryCard introductions={member.introductions} />
            <FollowUpTasksCard tasks={member.followUpTasks} />
          </div>
        ))}
      </div>
    </div>
  );
}
