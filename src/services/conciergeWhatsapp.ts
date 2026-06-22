import type {
  WhatsappTemplateId,
  WhatsappTimelineEntry,
  WhatsappVariables
} from "../types/conciergeWhatsapp";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConsultationEvent } from "../types/calendar";
import { buildWhatsappPreview } from "../utils/whatsappNotificationLogic";
import {
  applyWhatsappSendResult,
  queueWhatsappNotificationDraft
} from "../utils/WhatsappNotificationEngine";
import { resolveConsultationPaymentMember } from "./consultationPayment";
import { apiUrl, supabase } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";

type SendPayload = {
  ok?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  messageId?: string;
  templateId?: WhatsappTemplateId;
  preview?: string;
  sendchampReference?: string;
  timeline?: WhatsappTimelineEntry[];
};

async function postConciergeWhatsapp(body: Record<string, unknown>): Promise<SendPayload> {
  const response = await fetch(apiUrl("/api/concierge-whatsapp?action=send"), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify(body)
  });
  return (await readResponseJson<SendPayload>(response)) ?? {};
}

export async function getAuthenticatedMemberPhone(): Promise<string> {
  if (!supabase) return "";
  const session = (await supabase.auth.getSession()).data.session;
  const user = session?.user;
  const phone =
    String(user?.phone || user?.user_metadata?.phone || user?.user_metadata?.verified_phone || "")
      .trim();
  return phone;
}

export async function sendConciergeWhatsappNotification(input: {
  templateId: WhatsappTemplateId;
  memberId: string;
  memberName: string;
  memberPhone?: string;
  journeyId?: string;
  variables?: WhatsappVariables;
  recordId?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string; recordId?: string }> {
  const memberPhone = String(input.memberPhone || (await getAuthenticatedMemberPhone())).trim();
  const preview = buildWhatsappPreview(input.templateId, input.variables ?? {});
  const recordId =
    input.recordId ?? `wa_${input.memberId}_${input.templateId}_${Date.now().toString(36)}`;

  const draft = queueWhatsappNotificationDraft({
    recordId,
    memberId: input.memberId,
    memberName: input.memberName,
    memberPhone,
    journeyId: input.journeyId,
    templateId: input.templateId,
    preview
  });

  if (!memberPhone) {
    return { ok: false, skipped: true, error: "missing_recipient", recordId: draft.id };
  }

  const payload = await postConciergeWhatsapp({
    templateId: input.templateId,
    memberId: input.memberId,
    memberName: input.memberName,
    memberPhone,
    journeyId: input.journeyId,
    messageId: draft.messageId,
    variables: input.variables ?? {}
  });

  if (payload.timeline?.length) {
    applyWhatsappSendResult({
      recordId: draft.id,
      timeline: payload.timeline,
      sendchampReference: payload.sendchampReference,
      preview: payload.preview,
      messageId: payload.messageId
    });
  }

  if (payload.ok) {
    return { ok: true, recordId: draft.id };
  }

  return {
    ok: false,
    skipped: payload.skipped,
    error: payload.error || payload.reason || "whatsapp_send_failed",
    recordId: draft.id
  };
}

export async function sendConsultationReminderWhatsapp(input: {
  application: SignalConciergeApplication;
  event: ConsultationEvent;
  member?: ConciergeMemberRecord;
  memberPhone?: string;
  consultantName: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const member = input.member ?? resolveConsultationPaymentMember(input.application);
  const firstName = member.aboutYou.name.split(/\s+/)[0] || member.aboutYou.name;
  return sendConciergeWhatsappNotification({
    templateId: "consultation-reminder",
    memberId: member.id,
    memberName: member.aboutYou.name,
    memberPhone: input.memberPhone,
    journeyId: input.application.journeyId,
    variables: {
      firstName,
      memberName: member.aboutYou.name,
      consultantName: input.consultantName,
      scheduledAt: input.event.scheduledAt,
      statusUrl: `${window.location.origin}/signal-concierge/status`
    }
  });
}

export async function sendMeetingStartingSoonWhatsapp(input: {
  member: ConciergeMemberRecord;
  memberPhone?: string;
  scheduledAt: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeWhatsappNotification({
    templateId: "meeting-starting-soon",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberPhone: input.memberPhone,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      scheduledAt: input.scheduledAt,
      statusUrl: `${window.location.origin}/signal-concierge/status`
    }
  });
}

export async function sendIntroductionAcceptedWhatsapp(input: {
  member: ConciergeMemberRecord;
  introductionName: string;
  memberPhone?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeWhatsappNotification({
    templateId: "introduction-accepted",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberPhone: input.memberPhone,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      introductionName: input.introductionName
    }
  });
}

export async function sendFollowUpReminderWhatsapp(input: {
  member: ConciergeMemberRecord;
  memberPhone?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeWhatsappNotification({
    templateId: "follow-up-reminder",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberPhone: input.memberPhone,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      statusUrl: `${window.location.origin}/signal-concierge/status`
    }
  });
}

export async function sendMilestoneCongratulationsWhatsapp(input: {
  member: ConciergeMemberRecord;
  milestoneLabel: string;
  memberPhone?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const firstName = input.member.aboutYou.name.split(/\s+/)[0] || input.member.aboutYou.name;
  return sendConciergeWhatsappNotification({
    templateId: "milestone-congratulations",
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    memberPhone: input.memberPhone,
    journeyId: input.member.journeyId,
    variables: {
      firstName,
      memberName: input.member.aboutYou.name,
      milestoneLabel: input.milestoneLabel
    }
  });
}
