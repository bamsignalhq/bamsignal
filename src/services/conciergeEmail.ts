import type { ConciergeEmailTemplateId, ConciergeEmailVariables, EmailTimelineEntry } from "../types/conciergeEmail";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConsultationEvent } from "../types/calendar";
import type { MeetingLinkRecord } from "../types/meetingLink";
import { buildConciergeEmailPreview } from "../utils/emailNotificationLogic";
import {
  applyConciergeEmailSendResult,
  queueConciergeEmailDraft
} from "../utils/EmailNotificationEngine";
import { getAuthenticatedMemberEmail } from "./calendar";
import { resolveConsultationPaymentMember } from "./consultationPayment";
import { apiUrl } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";

type SendPayload = {
  ok?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  emailId?: string;
  templateId?: ConciergeEmailTemplateId;
  subject?: string;
  preview?: string;
  resendId?: string;
  timeline?: { status: string; at: string; detail?: string }[];
};

async function postConciergeEmail(body: Record<string, unknown>): Promise<SendPayload> {
  const response = await fetch(apiUrl("/api/concierge-email?action=send"), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify(body)
  });
  return (await readResponseJson<SendPayload>(response)) ?? {};
}

export async function sendConciergeJourneyEmail(input: {
  templateId: ConciergeEmailTemplateId;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  journeyId?: string;
  variables?: ConciergeEmailVariables;
  recordId?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string; recordId?: string }> {
  const memberEmail = String(input.memberEmail || (await getAuthenticatedMemberEmail())).trim().toLowerCase();
  const preview = buildConciergeEmailPreview(input.templateId, input.variables ?? {});
  const recordId =
    input.recordId ?? `email_${input.memberId}_${input.templateId}_${Date.now().toString(36)}`;

  const draft = queueConciergeEmailDraft({
    recordId,
    memberId: input.memberId,
    memberName: input.memberName,
    memberEmail,
    journeyId: input.journeyId,
    templateId: input.templateId,
    subject: preview.subject,
    preview: preview.preview
  });

  if (!memberEmail.includes("@")) {
    return { ok: false, skipped: true, error: "missing_recipient", recordId: draft.id };
  }

  const payload = await postConciergeEmail({
    templateId: input.templateId,
    memberId: input.memberId,
    memberName: input.memberName,
    memberEmail,
    journeyId: input.journeyId,
    emailId: draft.emailId,
    variables: input.variables ?? {}
  });

  if (payload.timeline?.length) {
    applyConciergeEmailSendResult({
      recordId: draft.id,
      timeline: payload.timeline as EmailTimelineEntry[],
      resendId: payload.resendId,
      subject: payload.subject,
      preview: payload.preview,
      emailId: payload.emailId
    });
  }

  if (payload.ok) {
    return { ok: true, recordId: draft.id };
  }

  return {
    ok: false,
    skipped: payload.skipped,
    error: payload.error || payload.reason || "email_send_failed",
    recordId: draft.id
  };
}

export async function sendApplicationReceivedEmail(input: {
  application: SignalConciergeApplication;
  member?: ConciergeMemberRecord;
  memberEmail?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const member = input.member ?? resolveConsultationPaymentMember(input.application);
  const firstName = member.aboutYou.name.split(/\s+/)[0] || member.aboutYou.name;
  return sendConciergeJourneyEmail({
    templateId: "application-received",
    memberId: member.id,
    memberName: member.aboutYou.name,
    memberEmail: input.memberEmail,
    journeyId: input.application.journeyId,
    variables: {
      firstName,
      memberName: member.aboutYou.name,
      journeyId: input.application.journeyId,
      statusUrl: `${window.location.origin}/signal-concierge/status`
    }
  });
}

export async function sendConsultationScheduledEmail(input: {
  application: SignalConciergeApplication;
  event: ConsultationEvent;
  member?: ConciergeMemberRecord;
  memberEmail?: string;
  consultantName: string;
  meetingLink?: MeetingLinkRecord;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const member = input.member ?? resolveConsultationPaymentMember(input.application);
  const firstName = member.aboutYou.name.split(/\s+/)[0] || member.aboutYou.name;
  const accessLink =
    input.meetingLink?.access?.joinUrl || input.event.googleEventLink || undefined;

  return sendConciergeJourneyEmail({
    templateId: "consultation-scheduled",
    memberId: member.id,
    memberName: member.aboutYou.name,
    memberEmail: input.memberEmail,
    journeyId: input.application.journeyId,
    variables: {
      firstName,
      memberName: member.aboutYou.name,
      consultantName: input.consultantName,
      scheduledAt: input.event.scheduledAt,
      meetingChannel: input.event.channel,
      meetingLink: accessLink,
      journeyId: input.application.journeyId,
      statusUrl: `${window.location.origin}/signal-concierge/status`
    }
  });
}

export async function sendConsultationReminderEmail(input: {
  member: ConciergeMemberRecord;
  memberEmail?: string;
  consultantName: string;
  scheduledAt: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeJourneyEmail({
    templateId: "consultation-reminder",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberEmail: input.memberEmail,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      consultantName: input.consultantName,
      scheduledAt: input.scheduledAt,
      journeyId: input.member.journeyId
    }
  });
}

export async function sendApplicationApprovedEmail(input: {
  member: ConciergeMemberRecord;
  memberEmail?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeJourneyEmail({
    templateId: "application-approved",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberEmail: input.memberEmail,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      journeyId: input.member.journeyId
    }
  });
}

export async function sendIntroductionPresentedEmail(input: {
  member: ConciergeMemberRecord;
  introductionName: string;
  memberEmail?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeJourneyEmail({
    templateId: "introduction-presented",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberEmail: input.memberEmail,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      introductionName: input.introductionName,
      journeyId: input.member.journeyId
    }
  });
}

export async function sendRelationshipMilestoneEmail(input: {
  member: ConciergeMemberRecord;
  milestoneLabel: string;
  memberEmail?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeJourneyEmail({
    templateId: "relationship-milestone",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberEmail: input.memberEmail,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      milestoneLabel: input.milestoneLabel,
      journeyId: input.member.journeyId
    }
  });
}

export async function sendArchiveCongratulationsEmail(input: {
  member: ConciergeMemberRecord;
  archiveNote?: string;
  memberEmail?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeJourneyEmail({
    templateId: "archive-congratulations",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberEmail: input.memberEmail,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      archiveNote: input.archiveNote,
      journeyId: input.member.journeyId
    }
  });
}
