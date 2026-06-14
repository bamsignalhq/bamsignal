/** Simple addition captcha — operands 1–9 only */
export type AdditionPuzzle = {
  a: number;
  b: number;
  answer: number;
};

export function createAdditionPuzzle(): AdditionPuzzle {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export function parseCaptchaAnswer(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}
