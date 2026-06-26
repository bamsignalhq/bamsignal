import type { EnterpriseApiFailedJob } from "../../../types/enterpriseApiCenter";

type EnterpriseApiFailedJobsCardProps = {
  jobs: EnterpriseApiFailedJob[];
};

export function EnterpriseApiFailedJobsCard({ jobs }: EnterpriseApiFailedJobsCardProps) {
  const pending = jobs.filter((item) => item.status === "pending");

  return (
    <section className="enterprise-api-card enterprise-api-jobs-card concierge-consultant-card--glass cc-reveal">
      <header className="enterprise-api-card__head">
        <h3>Failed jobs</h3>
        <p>Background API jobs awaiting retry — use Retry failed jobs to re-queue.</p>
      </header>
      {pending.length ? (
        <ul className="enterprise-api-card__list">
          {pending.map((job) => (
            <li key={job.id}>
              <div className="enterprise-api-card__row">
                <strong>
                  <span className="enterprise-api-endpoints-card__method">{job.method}</span>{" "}
                  {job.endpointPath}
                </strong>
                <span className="enterprise-api-jobs-card__badge">{job.status}</span>
              </div>
              <div className="enterprise-api-card__meta">
                <span>{job.failureReason}</span>
                <span>{job.attempts} attempts</span>
                <span>{new Date(job.failedAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="enterprise-api-card__empty">No pending failed jobs.</p>
      )}
    </section>
  );
}
