import { PROFILE_PROMPT_ANSWER_MAX, PROFILE_PROMPT_MAX, PROFILE_PROMPT_OPTIONS } from "../../constants/profilePrompts";
import type { DatingProfile } from "../../types";
import { validateUserText } from "../../utils/contactGuard";

type ProfilePromptsEditorProps = {
  prompts: DatingProfile["profilePrompts"];
  onChange: (prompts: DatingProfile["profilePrompts"]) => void;
  onBlocked?: (message: string) => void;
};

export function ProfilePromptsEditor({ prompts = [], onChange, onBlocked }: ProfilePromptsEditorProps) {
  const entries = prompts.slice(0, PROFILE_PROMPT_MAX);

  const updateAnswer = (prompt: string, answer: string) => {
    const trimmed = answer.slice(0, PROFILE_PROMPT_ANSWER_MAX);
    const leakError = validateUserText(trimmed);
    if (leakError) {
      onBlocked?.(leakError);
      return;
    }
    const rest = entries.filter((e) => e.prompt !== prompt);
    const next = trimmed
      ? [...rest, { prompt, answer: trimmed }]
      : rest;
    onChange(next.slice(0, PROFILE_PROMPT_MAX));
  };

  const addPrompt = (prompt: string) => {
    if (entries.length >= PROFILE_PROMPT_MAX) return;
    if (entries.some((e) => e.prompt === prompt)) return;
    onChange([...entries, { prompt, answer: "" }]);
  };

  const available = PROFILE_PROMPT_OPTIONS.filter((p) => !entries.some((e) => e.prompt === p));

  return (
    <div className="profile-prompts-editor">
      {entries.map((entry) => (
        <label key={entry.prompt} className="profile-prompts-editor__item">
          <span>{entry.prompt}</span>
          <textarea
            value={entry.answer}
            onChange={(e) => updateAnswer(entry.prompt, e.target.value)}
            rows={2}
            maxLength={PROFILE_PROMPT_ANSWER_MAX}
            placeholder="A few honest lines…"
          />
        </label>
      ))}

      {entries.length < PROFILE_PROMPT_MAX && available.length > 0 ? (
        <div className="profile-prompts-editor__add">
          <span>Add a prompt</span>
          <div className="intent-tags selectable">
            {available.map((prompt) => (
              <button key={prompt} type="button" className="intent-tag" onClick={() => addPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProfilePromptsDisplay({ prompts = [] }: { prompts?: DatingProfile["profilePrompts"] }) {
  const filled = prompts.filter((p) => p.answer.trim());
  if (!filled.length) return null;

  return (
    <section className="profile-prompts-display">
      {filled.map((entry) => (
        <div key={entry.prompt} className="profile-prompts-display__item">
          <strong>{entry.prompt}</strong>
          <p>{entry.answer}</p>
        </div>
      ))}
    </section>
  );
}
