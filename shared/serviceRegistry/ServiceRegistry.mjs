/**
 * Enterprise Service Registry — centralized dependency lifecycle.
 * @see docs/operations/service-registry-lifecycle.md
 */

/** @typedef {'critical'|'important'|'optional'|'runtime'} ServiceTier */
/** @typedef {'disabled'|'enabled'|'unavailable'} ServiceFeatureState */
/** @typedef {'registered'|'initializing'|'initialized'|'shutting_down'|'shutdown'} ServiceLifecycleState */

/**
 * @typedef {Object} ServiceMetrics
 * @property {number|null} initializationTimeMs
 * @property {number|null} startupDurationMs
 * @property {string|null} lastHealthCheckAt
 * @property {number} errorCount
 * @property {number} restartCount
 * @property {number|null} availability
 */

/**
 * @typedef {Object} ServiceDefinition
 * @property {string} id
 * @property {string} label
 * @property {ServiceTier} tier
 * @property {string} [productFeature]
 * @property {string[]} [dependsOn]
 * @property {number} [shutdownPriority]
 * @property {(env: Record<string, string|undefined>) => ServiceFeatureState} evaluateFeatureState
 * @property {(env: Record<string, string|undefined>) => Promise<void>|void} [initialize]
 * @property {(env: Record<string, string|undefined>) => Promise<{ ok: boolean, reason?: string }>|{ ok: boolean, reason?: string }} [health]
 * @property {(env: Record<string, string|undefined>) => Promise<boolean>|boolean} [ready]
 * @property {() => Promise<void>|void} [shutdown]
 * @property {() => Record<string, unknown>} [metadata]
 */

function createEmptyMetrics() {
  return {
    initializationTimeMs: null,
    startupDurationMs: null,
    lastHealthCheckAt: null,
    errorCount: 0,
    restartCount: 0,
    availability: null
  };
}

function topologicalOrder(services) {
  const byId = new Map(services.map((service) => [service.id, service]));
  /** @type {string[]} */
  const ordered = [];
  /** @type {Set<string>} */
  const visiting = new Set();
  /** @type {Set<string>} */
  const visited = new Set();

  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Service dependency cycle detected at ${id}`);
    }
    visiting.add(id);
    const service = byId.get(id);
    for (const dependency of service?.dependsOn || []) {
      if (byId.has(dependency)) visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
    ordered.push(id);
  }

  for (const service of services) visit(service.id);
  return ordered.map((id) => byId.get(id));
}

export class ServiceRegistry {
  constructor() {
    /** @type {Map<string, ServiceDefinition & { lifecycleState: ServiceLifecycleState, featureState: ServiceFeatureState, metrics: ServiceMetrics, lastHealth?: { ok: boolean, reason?: string } }>} */
    this.services = new Map();
    this.initialized = false;
    this.shutdownInProgress = false;
    this.startupStartedAt = null;
    this.startupCompletedAt = null;
  }

  /** @param {ServiceDefinition} definition */
  register(definition) {
    if (this.services.has(definition.id)) {
      throw new Error(`Duplicate service registration: ${definition.id}`);
    }
    this.services.set(definition.id, {
      ...definition,
      lifecycleState: "registered",
      featureState: "disabled",
      metrics: createEmptyMetrics(),
      lastHealth: undefined
    });
    return this;
  }

  /** @param {string} id */
  get(id) {
    return this.services.get(id) || null;
  }

  /** @returns {string[]} */
  listIds() {
    return [...this.services.keys()];
  }

  /**
   * @param {Record<string, string|undefined>} env
   */
  evaluateFeatureStates(env = process.env) {
    for (const service of this.services.values()) {
      service.featureState = service.evaluateFeatureState(env);
    }
  }

  /**
   * @param {Record<string, string|undefined>} env
   */
  async initializeAll(env = process.env) {
    if (this.initialized) return { ok: true, skipped: true };
    this.startupStartedAt = Date.now();
    this.evaluateFeatureStates(env);

    const ordered = topologicalOrder([...this.services.values()]);
    /** @type {Array<{ id: string, ok: boolean, reason?: string, durationMs: number }>} */
    const results = [];

    for (const service of ordered) {
      if (service.featureState === "disabled") {
        service.lifecycleState = "registered";
        continue;
      }

      if (!service.initialize) {
        service.lifecycleState = "initialized";
        continue;
      }

      service.lifecycleState = "initializing";
      const started = Date.now();
      try {
        await service.initialize(env);
        const durationMs = Date.now() - started;
        service.metrics.initializationTimeMs = durationMs;
        service.metrics.startupDurationMs = durationMs;
        service.lifecycleState = "initialized";
        results.push({ id: service.id, ok: true, durationMs });
      } catch (error) {
        const durationMs = Date.now() - started;
        service.metrics.initializationTimeMs = durationMs;
        service.metrics.errorCount += 1;
        service.featureState = "unavailable";
        service.lifecycleState = "registered";
        const reason = error instanceof Error ? error.message : String(error);
        results.push({ id: service.id, ok: false, reason, durationMs });
      }
    }

    this.initialized = true;
    this.startupCompletedAt = Date.now();
    return { ok: results.every((item) => item.ok), results };
  }

  /**
   * @param {Record<string, string|undefined>} env
   */
  async healthCheckAll(env = process.env) {
    this.evaluateFeatureStates(env);
    /** @type {Record<string, { ok: boolean, featureState: ServiceFeatureState, reason?: string, tier: ServiceTier }>} */
    const health = {};
    const checkedAt = new Date().toISOString();

    for (const service of this.services.values()) {
      if (service.featureState === "disabled") {
        health[service.id] = {
          ok: service.tier !== "critical" && service.tier !== "runtime",
          featureState: "disabled",
          reason: "not configured",
          tier: service.tier
        };
        continue;
      }

      let result = { ok: true };
      if (service.health) {
        try {
          result = await service.health(env);
        } catch (error) {
          result = {
            ok: false,
            reason: error instanceof Error ? error.message : String(error)
          };
          service.metrics.errorCount += 1;
        }
      }

      if (!result.ok && service.featureState === "enabled") {
        service.featureState = "unavailable";
      } else if (result.ok && service.featureState === "unavailable") {
        service.featureState = "enabled";
      }

      service.lastHealth = result;
      service.metrics.lastHealthCheckAt = checkedAt;
      if (result.ok) {
        service.metrics.availability = 1;
      } else if (service.metrics.availability == null) {
        service.metrics.availability = 0;
      }

      health[service.id] = {
        ok: result.ok,
        featureState: service.featureState,
        reason: result.reason,
        tier: service.tier
      };
    }

    return health;
  }

  /**
   * @param {Record<string, string|undefined>} env
   */
  async isReady(env = process.env) {
    await this.healthCheckAll(env);
    const critical = [...this.services.values()].filter((service) => service.tier === "critical");
    const criticalConfigured = critical.every((service) => service.featureState !== "disabled");
    const criticalHealthy = critical.every((service) => {
      if (service.featureState === "disabled") return false;
      if (service.ready) return Boolean(service.ready(env));
      return service.lastHealth?.ok !== false;
    });
    return {
      ready: criticalConfigured && criticalHealthy,
      criticalConfigured,
      criticalHealthy
    };
  }

  async shutdownAll() {
    if (this.shutdownInProgress) return { ok: true, skipped: true };
    this.shutdownInProgress = true;

    const ordered = [...this.services.values()].sort(
      (left, right) => (right.shutdownPriority ?? 0) - (left.shutdownPriority ?? 0)
    );

    /** @type {Array<{ id: string, ok: boolean, reason?: string }>} */
    const results = [];

    for (const service of ordered) {
      if (!service.shutdown) continue;
      service.lifecycleState = "shutting_down";
      try {
        await service.shutdown();
        service.lifecycleState = "shutdown";
        results.push({ id: service.id, ok: true });
      } catch (error) {
        service.metrics.errorCount += 1;
        results.push({
          id: service.id,
          ok: false,
          reason: error instanceof Error ? error.message : String(error)
        });
      }
    }

    this.initialized = false;
    return { ok: results.every((item) => item.ok), results };
  }

  snapshot(env = process.env) {
    this.evaluateFeatureStates(env);
    return [...this.services.values()].map((service) => ({
      id: service.id,
      label: service.label,
      tier: service.tier,
      productFeature: service.productFeature,
      featureState: service.featureState,
      lifecycleState: service.lifecycleState,
      dependsOn: service.dependsOn || [],
      shutdownPriority: service.shutdownPriority ?? 0,
      lastHealth: service.lastHealth,
      metadata: service.metadata ? service.metadata() : {},
      metrics: { ...service.metrics }
    }));
  }

  startupTimingReport() {
    const totalMs =
      this.startupStartedAt && this.startupCompletedAt
        ? this.startupCompletedAt - this.startupStartedAt
        : null;
    return {
      startupStartedAt: this.startupStartedAt
        ? new Date(this.startupStartedAt).toISOString()
        : null,
      startupCompletedAt: this.startupCompletedAt
        ? new Date(this.startupCompletedAt).toISOString()
        : null,
      totalStartupMs: totalMs,
      services: this.snapshot().map((service) => ({
        id: service.id,
        initializationTimeMs: service.metrics.initializationTimeMs,
        featureState: service.featureState,
        lifecycleState: service.lifecycleState
      }))
    };
  }
}

/** @type {ServiceRegistry|null} */
let globalRegistry = null;

export function createServiceRegistry() {
  return new ServiceRegistry();
}

export function getGlobalServiceRegistry() {
  return globalRegistry;
}

/** @param {ServiceRegistry} registry */
export function setGlobalServiceRegistry(registry) {
  globalRegistry = registry;
}

export function resetGlobalServiceRegistryForTests() {
  globalRegistry = null;
}
