import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type {
  AIAssistedDraftItem,
  AIAssistedInsight,
  AIAssistedMeetingPrep,
  AIAssistedMemberBundle,
  AIAssistedQuestion,
  AIAssistedWorkspaceBundle
} from "../types/aiAssistedConsultant";
import { getApplicationReviewSummaryForMember } from "./ApplicationApprovalEngine";
import { listMeetingNotesForMember } from "./MeetingNotesEngine";

function draftId(prefix: string, index: number): string {
  return `ai_draft_${prefix}_${index}`;
}

function buildApplicationSummary(member: ConciergeMemberRecord): string {
  const review = getApplicationReviewSummaryForMember(member);
  const status = SIGNAL_CONCIERGE_STATUS_LABELS[member.status];
  return `${member.aboutYou.name} is ${status.toLowerCase()} in ${member.aboutYou.city}. ${
    member.story.whatYouHopeToBuild
      ? `They hope to build: ${member.story.whatYouHopeToBuild}.`
      : ""
  } Application review: ${review.statusLabel}. This is a draft — consultant confirms before any decision.`;
}

function buildCompatibilityObservations(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  const items: AIAssistedDraftItem[] = [];
  const { valuesLifestyle, relationshipGoals, aboutYou } = member;

  if (valuesLifestyle.faithImportance) {
    items.push({
      id: draftId("compat_faith", items.length),
      label: "Faith alignment",
      body: `Faith is ${valuesLifestyle.faithImportance.toLowerCase()} for ${aboutYou.name}. Partner preference: ${relationshipGoals.partnerPreferences || "not specified"}.`,
      capability: "compatibility-observations",
      requiresReview: true
    });
  }

  if (relationshipGoals.marriageTimeline) {
    items.push({
      id: draftId("compat_timeline", items.length),
      label: "Marriage timeline",
      body: `Timeline: ${relationshipGoals.marriageTimeline}. Deal-breakers noted: ${relationshipGoals.dealBreakers || "none recorded"}.`,
      capability: "compatibility-observations",
      requiresReview: true
    });
  }

  if (valuesLifestyle.threeWords) {
    items.push({
      id: draftId("compat_character", items.length),
      label: "Character signals",
      body: `Self-described as ${valuesLifestyle.threeWords}. Love language: ${valuesLifestyle.loveLanguage || "not specified"}.`,
      capability: "compatibility-observations",
      requiresReview: true
    });
  }

  if (member.voiceVibe?.completed) {
    items.push({
      id: draftId("compat_voice", items.length),
      label: "Voice Vibe",
      body: "Voice Vibe completed — listen before matching. AI does not score compatibility.",
      capability: "compatibility-observations",
      requiresReview: true
    });
  }

  return items;
}

function buildInsights(member: ConciergeMemberRecord): AIAssistedInsight[] {
  const insights: AIAssistedInsight[] = [];
  const openTasks = member.followUpTasks.filter((task) => !task.completed);

  if (member.flags.includes("high-priority")) {
    insights.push({
      id: "insight_priority",
      title: "High-priority case",
      detail: "Flagged for elevated steward attention — consultant sets pace.",
      tone: "attention"
    });
  }

  if (member.flags.includes("sensitive-case")) {
    insights.push({
      id: "insight_sensitive",
      title: "Sensitive case",
      detail: "Handle with extra care. AI will not auto-message or introduce.",
      tone: "attention"
    });
  }

  if (openTasks.length > 0) {
    insights.push({
      id: "insight_followups",
      title: `${openTasks.length} open follow-up${openTasks.length === 1 ? "" : "s"}`,
      detail: `Next due: ${openTasks[0]?.title ?? "review tasks"}. Consultant owns scheduling.`,
      tone: "neutral"
    });
  }

  if (member.introductions.some((intro) => ["mutual-interest", "still-talking", "ongoing"].includes(intro.outcome))) {
    insights.push({
      id: "insight_intro_momentum",
      title: "Introduction momentum",
      detail: "Active introduction conversations — consultant guides next steps.",
      tone: "positive"
    });
  }

  if (!insights.length) {
    insights.push({
      id: "insight_steady",
      title: "Steady journey",
      detail: "No urgent flags. Consultant-led check-ins recommended.",
      tone: "neutral"
    });
  }

  return insights;
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
      "You approve all next steps — AI does not send introductions.",
      "Document outcomes in meeting notes after the session.",
      "WhatsApp is never used for consultant ↔ member relationships."
    ]
  };
}

function buildJourneySummary(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  return member.timeline.slice(-6).map((event, index) => ({
    id: draftId("timeline", index),
    label: event.label,
    body: event.detail
      ? `${event.detail} (${new Date(event.at).toLocaleDateString()})`
      : new Date(event.at).toLocaleDateString(),
    capability: "timeline-summaries",
    requiresReview: true
  }));
}

function buildFollowUpSuggestions(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  const openTasks = member.followUpTasks.filter((task) => !task.completed);
  const suggestions: AIAssistedDraftItem[] = openTasks.map((task, index) => ({
    id: draftId("followup", index),
    label: task.title,
    body: `Due ${new Date(task.dueAt).toLocaleString()}. Consultant schedules and completes — AI suggests only.`,
    capability: "follow-up-suggestions",
    requiresReview: true
  }));

  const lastJournal = member.communicationJournal[member.communicationJournal.length - 1];
  if (lastJournal?.nextAction && !suggestions.some((item) => item.label === lastJournal.nextAction)) {
    suggestions.push({
      id: draftId("followup_journal", suggestions.length),
      label: "From last meeting",
      body: `${lastJournal.nextAction} — confirm with member before acting.`,
      capability: "follow-up-suggestions",
      requiresReview: true
    });
  }

  return suggestions;
}

function buildRelationshipHealth(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
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

  if (["relationship", "matched", "exclusive", "engaged"].includes(member.status)) {
    items.push({
      id: draftId("health_progress", items.length),
      label: "Relationship progress",
      body: `${member.aboutYou.name} is in ${SIGNAL_CONCIERGE_STATUS_LABELS[member.status].toLowerCase()} — celebrate milestones with human warmth.`,
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

  if (!items.length) {
    items.push({
      id: draftId("health_steady", 0),
      label: "Journey steady",
      body: "No health alerts detected from timeline and tasks.",
      capability: "relationship-health",
      requiresReview: true
    });
  }

  return items;
}

function buildMeetingSummaries(member: ConciergeMemberRecord): AIAssistedDraftItem[] {
  return member.communicationJournal.slice(-3).map((entry, index) => ({
    id: draftId("meeting", index),
    label: `${entry.platform} · ${new Date(entry.date).toLocaleDateString()}`,
    body: [entry.summary, entry.outcome ? `Outcome: ${entry.outcome}` : null, entry.nextAction ? `Suggested next: ${entry.nextAction}` : null]
      .filter(Boolean)
      .join(" "),
    capability: "meeting-summaries",
    requiresReview: true
  }));
}

export function buildAIAssistedMemberBundle(
  member: ConciergeMemberRecord,
  meetings: ConciergeScheduledMeeting[] = []
): AIAssistedMemberBundle {
  const meetingSummaries = buildMeetingSummaries(member);

  return {
    memberId: member.id,
    memberName: member.aboutYou.name,
    summary: buildApplicationSummary(member),
    insights: buildInsights(member),
    compatibilityObservations: buildCompatibilityObservations(member),
    suggestedQuestions: buildSuggestedQuestions(member),
    meetingPreparation: buildMeetingPreparation(member, meetings),
    journeySummary: buildJourneySummary(member),
    followUpSuggestions: buildFollowUpSuggestions(member),
    relationshipHealth: buildRelationshipHealth(member),
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
    updatedAt: new Date().toISOString()
  };
}

export function assertAIAssistedWorkspaceRespectsRules(bundle: AIAssistedWorkspaceBundle): boolean {
  const serialized = JSON.stringify(bundle.selected ?? {}).toLowerCase();
  const forbiddenPhrases = ["ai approved", "auto introduce", "ai introduces", "approved by ai"];
  return !forbiddenPhrases.some((phrase) => serialized.includes(phrase));
}
