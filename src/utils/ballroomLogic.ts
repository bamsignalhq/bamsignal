import type { PreparedBallroomHostDefinition, PreparedBallroomHostId } from "../constants/ballroom";
import {
  BALLROOM_CELEBRATION_LABEL,
  BALLROOM_EVENT_LABEL,
  BALLROOM_SUMMIT_LABEL,
  PREPARED_BALLROOM_HOSTS
} from "../constants/ballroom";

export type EventCardViewModel = {
  id: PreparedBallroomHostId;
  title: string;
  description: string;
  eventLabel: string;
  statusLabel: string;
};

export type SummitCardViewModel = {
  id: PreparedBallroomHostId;
  title: string;
  description: string;
  summitLabel: string;
  statusLabel: string;
};

export type CelebrationCardViewModel = {
  id: PreparedBallroomHostId;
  title: string;
  description: string;
  celebrationLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildEventCardViewModel(host: PreparedBallroomHostDefinition): EventCardViewModel {
  return {
    id: host.id,
    title: host.title,
    description: host.description,
    eventLabel: BALLROOM_EVENT_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildSummitCardViewModel(host: PreparedBallroomHostDefinition): SummitCardViewModel {
  return {
    id: host.id,
    title: host.title,
    description: host.description,
    summitLabel: BALLROOM_SUMMIT_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCelebrationCardViewModel(
  host: PreparedBallroomHostDefinition
): CelebrationCardViewModel {
  return {
    id: host.id,
    title: host.title,
    description: host.description,
    celebrationLabel: BALLROOM_CELEBRATION_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureBallroomEvents(): EventCardViewModel[] {
  return PREPARED_BALLROOM_HOSTS.filter((host) => host.kind === "event").map(buildEventCardViewModel);
}

export function listArchitectureBallroomSummits(): SummitCardViewModel[] {
  return PREPARED_BALLROOM_HOSTS.filter((host) => host.kind === "summit").map(buildSummitCardViewModel);
}

export function listArchitectureBallroomCelebrations(): CelebrationCardViewModel[] {
  return PREPARED_BALLROOM_HOSTS.filter((host) => host.kind === "celebration").map(
    buildCelebrationCardViewModel
  );
}
