import {
  AI_ASSISTED_SUMMARY_FEATURES,
  AI_ASSISTED_VISIBILITY_ROLES
} from "../constants/aiAssistedConsultant";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type {
  AIAssistedDraftItem,
  AIAssistedInsight,
  AIAssistedMeetingPrep,
  AIAssistedMemberBundle,
  AIAssistedQuestion,
  AIAssistedSummarySection,
  AIAssistedWorkspaceBundle
} from "../types/aiAssistedConsultant";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";
import { listMeetingNotesForMember } from "./MeetingNotesEngine";

function draftId(prefix: string, index: number): string {
  return `ai_draft_${prefix}_${index}`;
}

function buildApplicationSummaryText(member: ConciergeMemberRecord): string {
  const review = getApplicationReviewSummaryForMember(member);
  const status = SIGNAL_CONCIERGE_STATUS_LABELS[member.status];
  return `${member.aboutYou.name} is ${status.toLowerCase()} in ${member.aboutYou.city}. ${
    member.story.whatYouHopeToBuild
      ? `They hope to build: ${member.story.whatYouHopeToBuild}.`
      : ""
  } Application review: ${review.statusLabel}. Draft only — consultant approves or declines.`;
}

function buildConsultationSummaryText(
  member: ConciergeMemberRecord,
  meetings: ConciergeScheduledMeeting[]
): string {
  const completed = member.timeline.filter((event) => event.type === "consultation-completed");
  const upcoming = meetings
    .filter(
      (meeting) =>
        meeting.memberId === member.id && new Date(meeting.scheduledAt).getTime() >= Date.now()
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  const notes = listMeetingNotesForMember(member.id).slice(-2);

  const parts = [
    `${completed.length} consultation${completed.length === 1 ? "" : "s"} completed on record.`,
    upcoming
      ? `Next session scheduled ${new Date(upcoming.scheduledAt).toLocaleString()}.`
      : "No upcoming consultation scheduled.",
    notes.length
      ? `Recent notes: ${notes.map((note) => note.title).join("; ")}.`
      : "No structured meeting notes yet.",
    "AI summarizes — consultant owns outcomes and next steps."
  ];

  return parts.join(" ");
}

function buildIntroductionSummaryText(member: ConciergeMemberRecord): string {
  if (member.introductions.length === 0) {
    return `${member.aboutYou.name} has no introductions yet. AI never introduces — consultant curates all matches.`;
  }

  const outcomes = member.introductions.map((intro) => intro.outcome).join(", ");
  const active = member.introductions.filter((intro) =>
    ["mutual-interest", "still-talking", "ongoing", "presented", "awaiting-response"].includes(
      intro.outcome
    )
  ).length;

  return `${member.introductions.length} introduction${
    member.introductions.length === 1 ? "" : "s"
  } on file (${active} active). Outcomes: ${outcomes}. Consultant decides every introduction — AI drafts context only.`;
}

function buildRelationshipSummaryText(member: ConciergeMemberRecord): string {
  const status = SIGNAL_CONCIERGE_STATUS_LABELS[member.status];
  const relationshipStatuses = new Set([
    "relationship",
    "matched",
    "exclusive",
    "engaged",
    "married",
    "legacy-archive"
  ]);

  if (!relationshipStatuses.has(member.status)) {
    return `${member.aboutYou.name} is not in an active relationship stage (${status}). Stewardship focus: preparation and search — consultant leads.`;
  }

  const openTasks = member.followUpTasks.filter((task) => !task.completed).length;
  return `${member.aboutYou.name} is ${status.toLowerCase()} with ${openTasks} open follow-up${
    openTasks === 1 ? "" : "s"
  }. AI observes — consultant celebrates milestones and sets pace.`;
}

function buildJourneySummaryText(member: ConciergeMemberRecord): string {
  const recent = member.timeline.slice(-4);
  if (recent.length === 0) {
    return `Journey timeline is forming for ${member.aboutYou.name}. Consultant documents milestones — AI does not advance status.`;
  }

  const highlights = recent
    .map((event) => `${event.label} (${new Date(event.at).toLocaleDateString()})`)
    .join(" · ");

  return `Recent journey: ${highlights}. Full stewardship history remains with the consultant and BamSignal archive.`;
}

function buildSummarySections(
  member: ConciergeMemberRecord,
  meetings: ConciergeScheduledMeeting[]
): AIAssistedSummarySection[] {
  const builders: Record<AIAssistedSummarySection["id"], string> = {
    application: buildApplicationSummaryText(member),
    consultation: buildConsultationSummaryText(member, meetings),
    introduction: buildIntroductionSummaryText(member),
    relationship: buildRelationshipSummaryText(member),
    journey: buildJourneySummaryText(member)
  };

  return AI_ASSISTED_SUMMARY_FEATURES.map((feature) => ({
    id: feature.id,
    label: feature.label,
    summary: builders[feature.id]
  }));
}

function buildCompatibilityAreas(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  const items: AIAssistedDraftItem[] = [];
  const { valuesLifestyle, relationshipGoals, aboutYou } = member;

  if (valuesLifestyle.faithImportance) {
    items.push({
      id: draftId("compat_faith", items.length),
      label: "Faith alignment",
      body: `Faith is ${valuesLifestyle.faithImportance.toLowerCase()} for ${aboutYou.name}. Partner preference: ${relationshipGoals.partnerPreferences || "not specified"}.`,
      capability: "compatibility-areas",
      requiresReview: true
    });
  }

  if (relationshipGoals.marriageTimeline) {
    items.push({
      id: draftId("compat_timeline", items.length),
      label: "Marriage timeline",
      body: `Timeline: ${relationshipGoals.marriageTimeline}. Deal-breakers noted: ${relationshipGoals.dealBreakers || "none recorded"}.`,
      capability: "compatibility-areas",
      requiresReview: true
    });
  }

  if (valuesLifestyle.threeWords) {
    items.push({
      id: draftId("compat_character", items.length),
      label: "Character signals",
      body: `Self-described as ${valuesLifestyle.threeWords}. Love language: ${valuesLifestyle.loveLanguage || "not specified"}.`,
      capability: "compatibility-areas",
      requiresReview: true
    });
  }

  if (member.voiceVibe?.completed) {
    items.push({
      id: draftId("compat_voice", items.length),
      label: "Voice Vibe",
      body: "Voice Vibe completed — listen before matching. AI does not score or approve compatibility.",
      capability: "compatibility-areas",
      requiresReview: true
    });
  }

  return items;
}

function buildObservations(member: ConciergeMemberRecord): AIAssistedInsight[] {
  const observations: AIAssistedInsight[] = [];
  const openTasks = member.followUpTasks.filter((task) => !task.completed);

  if (member.flags.includes("high-priority")) {
    observations.push({
      id: "observation_priority",
      title: "High-priority case",
      detail: "Flagged for elevated steward attention — consultant sets pace.",
      tone: "attention"
    });
  }

  if (member.flags.includes("sensitive-case")) {
    observations.push({
      id: "observation_sensitive",
      title: "Sensitive case",
      detail: "Handle with extra care. AI will not assign, introduce, or decide.",
      tone: "attention"
    });
  }

  if (openTasks.length > 0) {
    observations.push({
      id: "observation_followups",
      title: `${openTasks.length} open follow-up${openTasks.length === 1 ? "" : "s"}`,
      detail: `Next due: ${openTasks[0]?.title ?? "review tasks"}. Consultant owns scheduling.`,
      tone: "neutral"
    });
  }

  if (member.introductions.some((intro) => ["mutual-interest", "still-talking", "ongoing"].includes(intro.outcome))) {
    observations.push({
      id: "observation_intro_momentum",
      title: "Introduction momentum",
      detail: "Active introduction conversations — consultant guides next steps.",
      tone: "positive"
    });
  }

  const overdue = member.followUpTasks.some(
    (task) => !task.completed && new Date(task.dueAt).getTime() < Date.now()
  );
  if (overdue) {
    observations.push({
      id: "observation_overdue",
      title: "Overdue follow-up",
      detail: "A follow-up is past due — consultant should reach out with care.",
      tone: "attention"
    });
  }

  if (["relationship", "matched", "exclusive", "engaged"].includes(member.status)) {
    observations.push({
      id: "observation_relationship",
      title: "Relationship progress",
      detail: `${member.aboutYou.name} is in ${SIGNAL_CONCIERGE_STATUS_LABELS[member.status].toLowerCase()} — celebrate with human warmth.`,
      tone: "positive"
    });
  }

  if (!observations.length) {
    observations.push({
      id: "observation_steady",
      title: "Steady journey",
      detail: "No urgent flags. Consultant-led check-ins recommended.",
      tone: "neutral"
    });
  }

  return observations;
}

function buildSuggestedQuestions(member: ConciergeMemberRecord): AIAssistedQuestion[] {
  const questions: AIAssistedQuestion[] = [];

  if (member.status === "applied" || member.status === "under-review") {
    questions.push({
      id: "q_application",
      question: "What would make you feel fully ready to begin introductions?",
      context: "Application review — consultant decides approval, not AI."
    });
  }

  if (member.status === "active-search") {
    questions.push({
      id: "q_search",
      question: "Which qualities felt most important after your last conversation?",
      context: "Active search — refines consultant matching judgment."
    });
  }

  if (member.status === "introductions-in-progress") {
    questions.push({
      id: "q_intro",
      question: "How did the introduction feel — pace, values, and communication style?",
      context: "Post-introduction — consultant records outcome."
    });
  }

  if (member.relationshipGoals.dealBreakers) {
    questions.push({
      id: "q_dealbreakers",
      question: `You noted "${member.relationshipGoals.dealBreakers}" — has anything shifted?`,
      context: "Values check-in from application data."
    });
  }

  questions.push({
    id: "q_hope",
    question: "What does a good month of progress look like for you?",
    context: "Human-centered goal setting — consultant leads."
  });

  return questions.slice(0, 5);
}

function buildMeetingPreparation(
  member: ConciergeMemberRecord,
  meetings: ConciergeScheduledMeeting[]
): AIAssistedMeetingPrep {
  const upcoming = meetings
    .filter(
      (meeting) =>
        meeting.memberId === member.id && new Date(meeting.scheduledAt).getTime() >= Date.now()
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const journalThemes = member.communicationJournal
    .slice(-3)
    .map((entry) => entry.summary)
    .filter(Boolean);

  const noteTitles = listMeetingNotesForMember(member.id)
    .slice(-2)
    .map((note) => note.title);

  return {
    memberName: member.aboutYou.name,
    scheduledHint: upcoming
      ? `Upcoming: ${new Date(upcoming.scheduledAt).toLocaleString()}`
      : undefined,
    focusAreas: [
      SIGNAL_CONCIERGE_STATUS_LABELS[member.status],
      member.relationshipGoals.marriageTimeline
        ? `Timeline: ${member.relationshipGoals.marriageTimeline}`
        : "Clarify marriage timeline",
      member.flags.length ? `Flags: ${member.flags.join(", ")}` : "No priority flags"
    ],
    priorThemes: [...journalThemes, ...noteTitles].slice(0, 4),
    consultantReminders: [
      "You approve, reject, assign, and introduce — AI never decides.",
      "Document outcomes in meeting notes after the session.",
      "Every draft requires consultant review before action."
    ]
  };
}

function buildJourneyTimelineDrafts(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  return member.timeline.slice(-6).map((event, index) => ({
    id: draftId("timeline", index),
    label: event.label,
    body: event.detail
      ? `${event.detail} (${new Date(event.at).toLocaleDateString()})`
      : new Date(event.at).toLocaleDateString(),
    capability: "journey",
    requiresReview: true
  }));
}

function buildFollowUpTopics(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  const openTasks = member.followUpTasks.filter((task) => !task.completed);
  const suggestions: AIAssistedDraftItem[] = openTasks.map((task, index) => ({
    id: draftId("followup", index),
    label: task.title,
    body: `Due ${new Date(task.dueAt).toLocaleString()}. Consultant schedules and completes — AI suggests only.`,
    capability: "follow-up-topics",
    requiresReview: true
  }));

  const lastJournal = member.communicationJournal[member.communicationJournal.length - 1];
  if (lastJournal?.nextAction && !suggestions.some((item) => item.label === lastJournal.nextAction)) {
    suggestions.push({
      id: draftId("followup_journal", suggestions.length),
      label: "From last meeting",
      body: `${lastJournal.nextAction} — confirm with member before acting.`,
      capability: "follow-up-topics",
      requiresReview: true
    });
  }

  return suggestions;
}

function buildRelationshipHealthDrafts(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  const items: AIAssistedDraftItem[] = [];
  const now = Date.now();
  const overdue = member.followUpTasks.some(
    (task) => !task.completed && new Date(task.dueAt).getTime() < now
  );

  if (overdue) {
    items.push({
      id: draftId("health_overdue", items.length),
      label: "Overdue follow-up",
      body: "A follow-up is past due — consultant should reach out with care.",
      capability: "relationship-health",
      requiresReview: true
    });
  }

  if (member.introductions.length === 0 && member.status === "active-search") {
    items.push({
      id: draftId("health_search", items.length),
      label: "Search phase",
      body: "No introductions yet — consultant curates matches; AI does not introduce.",
      capability: "relationship-health",
      requiresReview: true
    });
  }

  return items;
}

export function buildAIAssistedMemberBundle(
  member: ConciergeMemberRecord,
  meetings: ConciergeScheduledMeeting[] = []
): AIAssistedMemberBundle {
  const summaries = buildSummarySections(member, meetings);
  const observations = buildObservations(member);
  const followUpTopics = buildFollowUpTopics(member);
  const suggestedQuestions = buildSuggestedQuestions(member);
  const compatibilityAreas = buildCompatibilityAreas(member);
  const journeySummary = buildJourneyTimelineDrafts(member);
  const relationshipHealth = buildRelationshipHealthDrafts(member);

  return {
    memberId: member.id,
    memberName: member.aboutYou.name,
    summaries,
    observations,
    followUpTopics,
    suggestedQuestions,
    compatibilityAreas,
    summary: summaries.find((section) => section.id === "application")?.summary ?? "",
    insights: observations,
    compatibilityObservations: compatibilityAreas,
    meetingPreparation: buildMeetingPreparation(member, meetings),
    journeySummary,
    followUpSuggestions: followUpTopics,
    relationshipHealth,
    updatedAt: new Date().toISOString()
  };
}

export function buildAIAssistedWorkspaceBundle(input: {
  members: ConciergeMemberRecord[];
  meetings: ConciergeScheduledMeeting[];
  selectedMemberId?: string | null;
}): AIAssistedWorkspaceBundle {
  const selectedMember = input.selectedMemberId
    ? input.members.find((member) => member.id === input.selectedMemberId) ?? input.members[0]
    : input.members[0];

  return {
    members: input.members.map((member) => ({
      id: member.id,
      name: member.aboutYou.name,
      status: member.status
    })),
    selected: selectedMember
      ? buildAIAssistedMemberBundle(selectedMember, input.meetings)
      : null,
    visibility: AI_ASSISTED_VISIBILITY_ROLES.map((role) => role.id),
    updatedAt: new Date().toISOString()
  };
}

export function assertAIAssistedWorkspaceRespectsRules(bundle: AIAssistedWorkspaceBundle): boolean {
  const serialized = JSON.stringify(bundle.selected ?? {}).toLowerCase();
  const forbiddenPhrases = [
    "ai approved",
    "ai rejected",
    "auto introduce",
    "ai introduces",
    "ai assigns",
    "approved by ai",
    "rejected by ai",
    "automated decision"
  ];
  return !forbiddenPhrases.some((phrase) => serialized.includes(phrase));
}
