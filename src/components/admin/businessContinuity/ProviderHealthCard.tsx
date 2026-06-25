import { CONTINUITY_HEALTH_STATUS_LABELS } from "../../../constants/businessContinuity";
import type { ProviderStatusRecord } from "../../../types/businessContinuity";
import { formatProviderLabel } from "../../../utils/businessContinuityLogic";

type ProviderHealthCardProps = {
  providers: ProviderStatusRecord[];
};

export function ProviderHealthCard({ providers }: ProviderHealthCardProps) {
  return (
    <section className="continuity-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Provider health</h3>
        <p>Supabase, Paystack, calendar, meetings, messaging, storage, auth, and cron monitoring.</p>
      </header>
      <ul className="continuity-provider-list">
        {providers.map((provider) => (
          <li key={provider.id} className={`continuity-provider continuity-provider--${provider.status}`}>
            <div>
              <strong>{formatProviderLabel(provider.providerId)}</strong>
              {provider.detail ? <span>{provider.detail}</span> : null}
            </div>
            <div className="continuity-provider__meta">
              <span className={`continuity-pill continuity-pill--${provider.status}`}>
                {CONTINUITY_HEALTH_STATUS_LABELS[provider.status]}
              </span>
              {provider.latencyMs != null ? <span>{provider.latencyMs}ms</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
