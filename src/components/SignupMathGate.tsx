type SignupMathGateProps = {
  a: number;
  b: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function SignupMathGate({
  a,
  b,
  answer,
  onAnswerChange,
  error,
  disabled
}: SignupMathGateProps) {
  return (
    <div className="signup-math-gate">
      <label className="signup-math-gate__label" htmlFor="signup-math-answer">
        Quick check: {a} + {b} = ?
      </label>
      <input
        id="signup-math-answer"
        className={`signup-math-gate__input${error ? " signup-math-gate__input--error" : ""}`}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Answer"
        value={answer}
        disabled={disabled}
        maxLength={2}
        onChange={(event) => onAnswerChange(event.target.value.replace(/\D/g, "").slice(0, 2))}
      />
      {error ? (
        <p className="signup-math-gate__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
