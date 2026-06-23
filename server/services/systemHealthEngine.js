/**
 * Institutional System Health Engine™ — status resolution (server-side tests).
 */

const STATUS_RANK = {
  offline: 4,
  maintenance: 3,
  degraded: 2,
  healthy: 1
};

export function resolveWorstStatus(statuses) {
  return statuses.reduce((worst, current) => {
    return STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst;
  }, "healthy");
}

export function resolveLiveServiceStatus(serviceId, health) {
  if (!health) return null;

  switch (serviceId) {
    case "supabase":
      if (health.database !== "connected") return "offline";
      return health.signupEmail ? "healthy" : "degraded";
    case "paystack":
      return health.paystack ? "healthy" : "offline";
    case "resend":
      return health.resend ? "healthy" : "offline";
    case "sendchamp":
      return health.sendchamp ? "healthy" : "degraded";
    case "storage":
      return health.photoStorage ? "healthy" : "offline";
    case "email-queue":
      return health.resend ? "healthy" : "offline";
    case "whatsapp-queue":
      return health.sendchamp ? "healthy" : "degraded";
    case "background-jobs":
      return health.firebase ? "healthy" : "degraded";
    default:
      return null;
  }
}

export function countServicesByStatus(services) {
  return services.reduce(
    (counts, service) => {
      counts[service.status] = (counts[service.status] ?? 0) + 1;
      return counts;
    },
    { healthy: 0, degraded: 0, offline: 0, maintenance: 0 }
  );
}
