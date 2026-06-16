export const PROFILE_PROMPT_OPTIONS = [
  "A perfect weekend for me...",
  "I'm happiest when...",
  "One thing people appreciate about me...",
  "I'm hoping to find...",
  "Family means...",
  "My faith/life values matter because...",
  "A meaningful connection looks like..."
] as const;

export const PROFILE_PROMPT_MAX = 3;
export const PROFILE_PROMPT_ANSWER_MAX = 180;

export type ProfilePromptId = (typeof PROFILE_PROMPT_OPTIONS)[number];

export type ProfilePromptAnswer = {
  prompt: ProfilePromptId;
  answer: string;
};
