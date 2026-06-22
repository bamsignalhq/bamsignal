import { PREPARED_BALLROOM_HOSTS } from "../constants/ballroom";
import {
  listArchitectureBallroomCelebrations,
  listArchitectureBallroomEvents,
  listArchitectureBallroomSummits,
  type CelebrationCardViewModel,
  type EventCardViewModel,
  type SummitCardViewModel
} from "./ballroomLogic";

export type BallroomBundle = {
  events: EventCardViewModel[];
  summits: SummitCardViewModel[];
  celebrations: CelebrationCardViewModel[];
  hostCount: number;
};

export function getBallroomBundle(): BallroomBundle {
  return {
    events: listArchitectureBallroomEvents(),
    summits: listArchitectureBallroomSummits(),
    celebrations: listArchitectureBallroomCelebrations(),
    hostCount: PREPARED_BALLROOM_HOSTS.length
  };
}
