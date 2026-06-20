type SignupMathGateProps = {
  a: number;
  b: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onRefresh?: () => void;
  error?: string;
  disabled?: boolean;
  refreshing?: boolean;
};

export function SignupMathGate({
  a,
  b,
  answer,
  onAnswerChange,
  onRefresh,
  error,
  disabled,
  refreshing = false
}: SignupMathGateProps) {
  return (
    <div className="signup-math-gate">
      <div className="signup-math-gate__row">
        <span className="signup-math-gate__prompt" id="signup-math-prompt">
          {a} + {b} =
        </span>
        <input
          id="signup-math-answer"
          className={`signup-math-gate__input${error ? " signup-math-gate__input--error" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-labelledby="signup-math-prompt"
          placeholder="Answer"
          value={answer}
          disabled={disabled}
          maxLength={2}
          onChange={(event) => onAnswerChange(event.target.value.replace(/\D/g, "").slice(0, 2))}
        />
        {onRefresh ? (
          <button
            type="button"
            className="signup-math-gate__refresh"
            onClick={onRefresh}
            disabled={disabled || refreshing}
            aria-label="Refresh quick check"
          >
            ↻
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="signup-math-gate__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
