import type { OperatingExpenseRecord } from "../../../types/financeOperations";

type ExpenseCardProps = {
  expenses: OperatingExpenseRecord[];
};

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function ExpenseCard({ expenses }: ExpenseCardProps) {
  const total = expenses.reduce((sum, item) => sum + item.amountNgn, 0);

  return (
    <section className="finance-card expense-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Expenses</h3>
        <p>Operating expense tracking — {formatNgn(total)} recorded.</p>
      </header>
      <ul className="finance-list">
        {expenses.map((expense) => (
          <li key={expense.id} className="finance-list__item">
            <div>
              <strong>{expense.expenseRef}</strong>
              <span>{expense.category}</span>
            </div>
            <div className="finance-list__meta">
              <span>{formatNgn(expense.amountNgn)}</span>
              <span>{expense.vendor ?? "—"}</span>
              <span>{new Date(expense.incurredAt).toLocaleDateString()}</span>
            </div>
            <p>{expense.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
