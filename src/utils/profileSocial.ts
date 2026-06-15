import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type ProfileSocialEntry = {
  profileId: string;
  name: string;
  photo: string;
  at: string;
};

type SocialStore = {
  likes: ProfileSocialEntry[];
  follows: ProfileSocialEntry[];
  incomingLikes: ProfileSocialEntry[];
  incomingFollows: ProfileSocialEntry[];
};

function store(): SocialStore {
  return readJson<SocialStore>(STORAGE_KEYS.profileSocial, {
    likes: [],
    follows: [],
    incomingLikes: [],
    incomingFollows: []
  });
}

function save(next: SocialStore): void {
  writeJson(STORAGE_KEYS.profileSocial, next);
}

export function likeProfile(entry: ProfileSocialEntry): boolean {
  const data = store();
  if (data.likes.some((l) => l.profileId === entry.profileId)) return false;
  save({ ...data, likes: [entry, ...data.likes] });
  return true;
}

export function followProfile(entry: ProfileSocialEntry): boolean {
  const data = store();
  if (data.follows.some((f) => f.profileId === entry.profileId)) return false;
  save({ ...data, follows: [entry, ...data.follows] });
  return true;
}

export function hasLikedProfile(profileId: string): boolean {
  return store().likes.some((l) => l.profileId === profileId);
}

export function hasFollowedProfile(profileId: string): boolean {
  return store().follows.some((f) => f.profileId === profileId);
}

export function mySocialStats() {
  const data = store();
  return {
    likesGiven: data.likes.length,
    followsGiven: data.follows.length,
    likesReceived: data.incomingLikes.length,
    followsReceived: data.incomingFollows.length,
    incomingLikes: data.incomingLikes,
    incomingFollows: data.incomingFollows
  };
}

export function mergeIncomingSocial(payload: {
  incomingLikes?: ProfileSocialEntry[];
  incomingFollows?: ProfileSocialEntry[];
}): void {
  const data = store();
  save({
    ...data,
    incomingLikes: payload.incomingLikes ?? data.incomingLikes,
    incomingFollows: payload.incomingFollows ?? data.incomingFollows
  });
}
