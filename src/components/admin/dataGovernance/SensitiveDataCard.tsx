import { DATA_CLASS_LABELS } from "../../../constants/dataGovernanceCenter";
import type { SensitiveDataRegister } from "../../../types/dataGovernanceCenter";

type SensitiveDataCardProps = {
  registers: SensitiveDataRegister[];
};

export function SensitiveDataCard({ registers }: SensitiveDataCardProps) {
  return (
    <section className="data-governance-card sensitive-data-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Sensitive data</h3>
        <p>PII, consultation notes, financial data, and restricted access registers.</p>
      </header>
      {registers.length ? (
        <ul className="data-governance-card__list">
          {registers.map((register) => (
            <li key={register.id}>
              <div className="data-governance-card__row">
                <strong>{register.dataType}</strong>
                <span className={`data-class data-class--${register.dataClass}`}>
                  {DATA_CLASS_LABELS[register.dataClass]}
                </span>
              </div>
              <p>{register.registerRef}</p>
              <p>{register.systems.join(", ")}</p>
              <div className="data-governance-card__meta">
                {register.encryptionRequired ? <span>Encrypted</span> : null}
                {register.accessRestricted ? <span>Access restricted</span> : null}
                <span>Audited {new Date(register.lastAuditAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No sensitive data registers on record.</p>
      )}
    </section>
  );
}
