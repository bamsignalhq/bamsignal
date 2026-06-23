import type { AuditActor } from "../../../types/auditEngine";

type AuditActorCardProps = {
  actor: AuditActor;
  ipAddress?: string;
};

export function AuditActorCard({ actor, ipAddress }: AuditActorCardProps) {
  return (
    <section className="institutional-audit-actor-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-audit-actor-card__head">
        <h3>Actor</h3>
        <p>Operator identity for this audit record.</p>
      </header>
      <dl className="institutional-audit-actor-card__grid">
        <div>
          <dt>Name</dt>
          <dd>{actor.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{actor.email}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{actor.role}</dd>
        </div>
        <div>
          <dt>Actor ID</dt>
          <dd>
            <code>{actor.id}</code>
          </dd>
        </div>
        {ipAddress ? (
          <div>
            <dt>IP address</dt>
            <dd>{ipAddress}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
