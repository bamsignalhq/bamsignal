import { FINANCE_AREA_LABELS, FINANCE_IMMUTABLE_RULES, FINANCE_STATUS_LABELS } from "../../../constants/financeOperations";
import type { FinanceMetric, FinanceRecord } from "../../../types/financeOperations";

type FinanceOverviewCardProps = {
  metrics: FinanceMetric[];
  recordCount: number;
};

export function FinanceOverviewCard({ metrics, recordCount }: FinanceOverviewCardProps) {
  return (
    <section className="finance-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="finance-overview-card__head">
        <h3>Finance overview</h3>
        <p>{recordCount} financial records — Paystack-linked operations layer.</p>
      </header>

      <div className="finance-overview-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="finance-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <footer className="finance-overview-card__rules">
        <h4>Rules</h4>
        <ul>
          {FINANCE_IMMUTABLE_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}

type FinanceRecordSummaryProps = {
  record: FinanceRecord;
};

export function FinanceRecordSummary({ record }: FinanceRecordSummaryProps) {
  return (
    <dl className="finance-record-summary">
      <div>
        <dt>Area</dt>
        <dd>{FINANCE_AREA_LABELS[record.areaId]}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{FINANCE_STATUS_LABELS[record.status]}</dd>
      </div>
      <div>
        <dt>Amount</dt>
        <dd>₦{record.amountNgn.toLocaleString("en-NG")}</dd>
      </div>
      {record.paystackReference ? (
        <div>
          <dt>Paystack</dt>
          <dd>{record.paystackReference}</dd>
        </div>
      ) : null}
      {record.auditRef ? (
        <div>
          <dt>Audit</dt>
          <dd>{record.auditRef}</dd>
        </div>
      ) : null}
    </dl>
  );
}
