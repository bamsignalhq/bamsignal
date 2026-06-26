import {
  PLATFORM_LOAD_JOURNEY_PHASES,
  PLATFORM_LOAD_JOURNEY_STEPS,
  PLATFORM_LOAD_JOURNEY_TYPES,
  PLATFORM_LOAD_THINK_MS
} from "../../../shared/platformLoadCertification.mjs";

function randomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function thinkDelayMs(kind = "default", fast = false) {
  if (fast) {
    if (kind === "page") {
      return randomBetween(PLATFORM_LOAD_THINK_MS.fastPageMin, PLATFORM_LOAD_THINK_MS.fastPageMax);
    }
    return randomBetween(PLATFORM_LOAD_THINK_MS.fastMin, PLATFORM_LOAD_THINK_MS.fastMax);
  }
  if (kind === "page") {
    return randomBetween(PLATFORM_LOAD_THINK_MS.pageReadMin, PLATFORM_LOAD_THINK_MS.pageReadMax);
  }
  return randomBetween(PLATFORM_LOAD_THINK_MS.min, PLATFORM_LOAD_THINK_MS.max);
}

export function assignJourneyType(memberIndex) {
  const roll = memberIndex % 100;
  let cursor = 0;
  for (const journey of PLATFORM_LOAD_JOURNEY_TYPES) {
    cursor += journey.weight;
    if (roll < cursor) return journey.id;
  }
  return PLATFORM_LOAD_JOURNEY_TYPES[0].id;
}

export function buildMemberJourney(memberIndex) {
  const journeyType = assignJourneyType(memberIndex);
  const phases = PLATFORM_LOAD_JOURNEY_PHASES[journeyType] || PLATFORM_LOAD_JOURNEY_PHASES["full-session"];
  const memberId = `loadcert_${String(memberIndex).padStart(4, "0")}`;
  const steps = [];

  for (const phase of phases) {
    const phaseSteps = PLATFORM_LOAD_JOURNEY_STEPS[phase] || [];
    for (const step of phaseSteps) {
      steps.push({
        ...step,
        phase,
        journeyType,
        memberId
      });
    }
  }

  const healthSteps = PLATFORM_LOAD_JOURNEY_STEPS.health || [];
  for (const step of healthSteps) {
    steps.push({ ...step, phase: "health", journeyType, memberId });
  }

  return {
    memberId,
    journeyType,
    phases,
    steps
  };
}

export function resolveStepBody(step, memberId) {
  if (!step.body) return undefined;
  const body = JSON.parse(JSON.stringify(step.body));
  if (typeof body.username === "string") {
    body.username = memberId;
  }
  if (typeof body.reference === "string") {
    body.reference = `loadcert_${memberId}_${Date.now()}`;
  }
  return body;
}

export function isExpectedStatus(step, status) {
  const expected = step.expect || (step.kind === "page" ? [200] : [200]);
  return expected.includes(status);
}
