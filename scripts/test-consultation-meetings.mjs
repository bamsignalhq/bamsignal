#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MEETING_INFRASTRUCTURE_CHANNELS,
  MEETING_INFRASTRUCTURE_DISABLED_CHANNELS,
  MEETING_INFRASTRUCTURE_TIMELINE_EVENTS,
  isDisabledMeetingChannel,
  isProfessionalMeetingChannel,
  zoomMeetingReady,
  zoomOAuthConfigured
} from "../server/services/zoomMeetingService.js";
import { googleMeetConfigured, googleMeetReady } from "../server/services/googleMeetService.js";

const MEETING_INFRASTRUCTURE_API_PATH = "/api/meeting-infrastructure";
const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

assert(MEETING_INFRASTRUCTURE_CHANNELS.length === 3, "supports zoom, google-meet, and phone");
assert(isProfessionalMeetingChannel("zoom"), "zoom is a professional channel");
assert(isProfessionalMeetingChannel("google-meet"), "google-meet is a professional channel");
assert(isProfessionalMeetingChannel("phone"), "phone is a professional channel");
assert(isDisabledMeetingChannel("whatsapp"), "whatsapp is disabled for consultations");
assert(isDisabledMeetingChannel("whatsapp-voice"), "whatsapp-voice is disabled for consultations");
assert(!isProfessionalMeetingChannel("whatsapp"), "whatsapp is not a professional channel");

assert(
  MEETING_INFRASTRUCTURE_TIMELINE_EVENTS.includes("meeting-link-generated") &&
    MEETING_INFRASTRUCTURE_TIMELINE_EVENTS.includes("meeting-invite-sent"),
  "timeline includes link generation and invite events"
);

assert(MEETING_INFRASTRUCTURE_API_PATH === "/api/meeting-infrastructure", "canonical API path");

const appSource = readFileSync(join(rootPath, "server/app.js"), "utf8");
assert(
  appSource.includes('"/api/meeting-infrastructure"') && appSource.includes('"/api/meeting-link"'),
  "both meeting API paths are mounted"
);

const zoomServiceSource = readFileSync(join(rootPath, "server/services/zoomService.js"), "utf8");
assert(zoomServiceSource.includes("zoomMeetingService.js"), "legacy zoom service delegates to zoomMeetingService");

const meetingLinkSource = readFileSync(join(rootPath, "server/routes/meetingLink.js"), "utf8");
assert(
  meetingLinkSource.includes("meetingInfrastructure.js"),
  "legacy meeting-link route delegates to meetingInfrastructure"
);

assert(typeof zoomOAuthConfigured === "function", "zoom OAuth helper exported");
assert(typeof googleMeetConfigured === "function", "google meet config helper exported");
assert(!zoomMeetingReady() || zoomOAuthConfigured(), "zoom ready implies configured");
assert(!googleMeetReady() || googleMeetConfigured(), "google meet ready implies configured");

if (failed) process.exit(1);
console.log("consultation meeting infrastructure tests ok");
