#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSULTATION_SCHEDULING_TIMELINE_EVENTS,
  DEFAULT_AVAILABILITY_DAYS,
  DEFAULT_AVAILABILITY_HOURS,
  DEFAULT_SLOT_DURATION_MINUTES,
  buildAvailabilitySlotsFromConfig,
  googleOAuthConfigured,
  normalizeAvailabilityConfig
} from "../server/services/googleCalendarService.js";

const CONSULTATION_SCHEDULING_API_PATH = "/api/consultation-scheduling";
const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

assert(
  CONSULTATION_SCHEDULING_TIMELINE_EVENTS.includes("slot-selected") &&
    CONSULTATION_SCHEDULING_TIMELINE_EVENTS.includes("consultation-confirmed"),
  "scheduling timeline includes required events"
);

const config = normalizeAvailabilityConfig({
  timezone: "Africa/Lagos",
  availableDays: DEFAULT_AVAILABILITY_DAYS,
  availableHours: DEFAULT_AVAILABILITY_HOURS,
  durationMinutes: DEFAULT_SLOT_DURATION_MINUTES
});
assert(config.availableDays.length === 5, "default availability uses weekdays");
assert(config.availableHours.length === 3, "default availability uses three daily hours");

const availability = buildAvailabilitySlotsFromConfig({
  consultantId: "consultant_1",
  consultantName: "Ada",
  timezone: "Africa/Lagos",
  bookedStartsAt: [],
  availabilityConfig: config
});
assert(availability.slots.length > 0, "builds bookable slots from config");
assert(availability.slots.every((slot) => slot.durationMinutes === DEFAULT_SLOT_DURATION_MINUTES), "slots use configured duration");

const blackout = buildAvailabilitySlotsFromConfig({
  consultantId: "consultant_1",
  consultantName: "Ada",
  timezone: "Africa/Lagos",
  availabilityConfig: {
    ...config,
    blackoutPeriods: [
      {
        startsAt: availability.slots[0].startsAt,
        endsAt: availability.slots[0].endsAt
      }
    ]
  }
});
assert(
  !blackout.slots.some((slot) => slot.startsAt === availability.slots[0].startsAt),
  "blackout periods remove blocked slots"
);

assert(CONSULTATION_SCHEDULING_API_PATH === "/api/consultation-scheduling", "canonical scheduling API path");

const appSource = readFileSync(join(rootPath, "server/app.js"), "utf8");
assert(
  appSource.includes('"/api/consultation-scheduling"') && appSource.includes('"/api/calendar"'),
  "both scheduling API paths are mounted"
);

const calendarServiceSource = readFileSync(join(rootPath, "server/services/calendarService.js"), "utf8");
assert(
  calendarServiceSource.includes("googleCalendarService.js"),
  "legacy calendar service delegates to googleCalendarService"
);

assert(typeof googleOAuthConfigured === "function", "google OAuth helper is exported");

if (failed) process.exit(1);
console.log("consultation scheduling tests ok");
