/** Permanent journey milestone timeline — never deleted. */

const MILESTONE_ORDER = {
  met: 10,
  "relationship-formed": 20,
  exclusive: 30,
  engaged: 40,
  married: 50,
  "first-anniversary": 60,
  "five-years-together": 70,
  "ten-years-together": 80,
  "twenty-years-together": 90,
  "silver-anniversary": 100,
  "golden-anniversary": 110
};

export function createEmptyMilestoneTimeline(journeyId) {
  const now = new Date().toISOString();
  return {
    journeyId,
    milestones: [],
    updatedAt: now,
    futureCelebrations: {
      enabled: false,
      kinds: ["anniversary-gifts", "couple-events", "marriage-celebrations", "family-milestones"]
    }
  };
}

export function normalizeMilestones(milestones) {
  const map = new Map();
  for (const entry of milestones ?? []) {
    if (!entry?.id) continue;
    const existing = map.get(entry.id);
    if (!existing || entry.recordedAt >= existing.recordedAt) {
      map.set(entry.id, entry);
    }
  }
  return [...map.values()].sort((a, b) => {
    const orderDiff = MILESTONE_ORDER[a.id] - MILESTONE_ORDER[b.id];
    if (orderDiff !== 0) return orderDiff;
    return a.milestoneAt.localeCompare(b.milestoneAt);
  });
}

export function assertMilestonesIntegrity(previous, next) {
  if (!previous?.milestones?.length) return;
  const prevIds = new Set(previous.milestones.map((item) => item.id));
  const nextIds = new Set((next?.milestones ?? []).map((item) => item.id));
  for (const id of prevIds) {
    if (!nextIds.has(id)) {
      throw new Error(`Journey milestone removed: ${id}`);
    }
  }
}

export function addOrUpdateMilestone(timeline, input) {
  const now = new Date().toISOString();
  const milestones = normalizeMilestones(timeline.milestones);
  const existing = milestones.find((item) => item.id === input.milestoneId);
  const entry = {
    id: input.milestoneId,
    milestoneAt: input.milestoneAt,
    note: input.note ?? existing?.note,
    recordedAt: now,
    recordedBy: input.recordedBy ?? existing?.recordedBy
  };

  const nextMilestones = existing
    ? milestones.map((item) => (item.id === input.milestoneId ? entry : item))
    : [...milestones, entry];

  return {
    ...timeline,
    milestones: normalizeMilestones(nextMilestones),
    updatedAt: now
  };
}
