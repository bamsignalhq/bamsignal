import type { AIAssistedQuestion } from "../../types/aiAssistedConsultant";

type AIQuestionCardProps = {
  questions: AIAssistedQuestion[];
};

export function AIQuestionCard({ questions }: AIQuestionCardProps) {
  return (
    <section className="ai-assist-card ai-question-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Suggested Questions</h3>
        <p>Conversation starters — you choose what to ask.</p>
      </header>
      {questions.length === 0 ? (
        <p className="concierge-consultant__empty">No questions suggested yet.</p>
      ) : (
        <ul className="ai-assist-questions">
          {questions.map((item) => (
            <li key={item.id}>
              <strong>{item.question}</strong>
              <span>{item.context}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
