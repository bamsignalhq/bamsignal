import type { CorridorStoryEntry, CorridorStoryTimelineEntry } from "../constants/corridorStories";
import {
  buildCorridorStoryTimeline,
  listArchitectureCorridorStories
} from "./corridorStoriesLogic";

export type CorridorStoriesBundle = {
  stories: CorridorStoryEntry[];
  timelinesByStoryId: Record<string, CorridorStoryTimelineEntry[]>;
};

export function getCorridorStoriesBundle(): CorridorStoriesBundle {
  const stories = listArchitectureCorridorStories();
  const timelinesByStoryId = Object.fromEntries(
    stories.map((story) => [story.storyId, buildCorridorStoryTimeline(story.storyId, story.recordedAt)])
  );
  return { stories, timelinesByStoryId };
}

export function getCorridorStory(storyId: string): CorridorStoryEntry | null {
  return listArchitectureCorridorStories().find((story) => story.storyId === storyId) ?? null;
}
