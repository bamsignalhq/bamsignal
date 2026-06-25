import { useMemo, useState } from "react";
import {
  API_PLATFORM_FUTURE_ARCHITECTURE,
  API_PLATFORM_SECTIONS
} from "../../../constants/apiPlatform";
import {
  API_PLATFORM_ADMIN_BRAND,
  API_PLATFORM_ADMIN_PATH
} from "../../../constants/apiPlatformAdmin";
import type { ApiPlatformSectionId } from "../../../constants/apiPlatform";
import { buildApiPlatformBundle } from "../../../utils/apiPlatformEngine";
import { ApiCatalogCard } from "./ApiCatalogCard";
import { ApiUsageCard } from "./ApiUsageCard";
import { IntegrationCard } from "./IntegrationCard";
import { RateLimitCard } from "./RateLimitCard";
import { SecurityCard } from "./SecurityCard";
import { WebhookCard } from "./WebhookCard";

export function ApiPlatformPage() {
  const [section, setSection] = useState<ApiPlatformSectionId>("catalog");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildApiPlatformBundle(section);
  }, [section, refreshKey]);

  const showCatalog = section === "catalog" || section === "versions";
  const showKeys = section === "catalog" || section === "keys";
  const showClients = section === "catalog" || section === "clients" || section === "integrations";
  const showRateLimits = section === "catalog" || section === "rate-limits";
  const showWebhooks = section === "catalog" || section === "webhooks" || section === "integrations";
  const showUsage = section === "catalog" || section === "usage" || section === "errors";

  return (
    <div className="api-platform-page">
      <header className="api-platform-page__head">
        <div>
          <h2>{API_PLATFORM_ADMIN_BRAND}</h2>
          <p>
            Centralized institutional API layer — every external integration passes through one
            standardized platform. No scattered endpoints.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <nav className="api-platform-page__sections" aria-label="API platform sections">
        {API_PLATFORM_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`api-platform-page__section-btn${
              section === item.id ? " is-active" : ""
            }`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === "catalog" ? (
        <SecurityCard summary={bundle.summary} keys={bundle.keys} />
      ) : null}

      <div className="api-platform-page__body">
        <div className="api-platform-page__column">
          {showCatalog ? <ApiCatalogCard catalog={bundle.catalog} /> : null}
          {showClients ? <IntegrationCard clients={bundle.clients} /> : null}
          {showWebhooks ? <WebhookCard webhooks={bundle.webhooks} /> : null}
        </div>
        <div className="api-platform-page__column">
          {showUsage ? <ApiUsageCard summary={bundle.summary} usage={bundle.usage} /> : null}
          {showRateLimits ? <RateLimitCard rateLimits={bundle.rateLimits} /> : null}
          {showKeys && section !== "catalog" ? (
            <SecurityCard summary={bundle.summary} keys={bundle.keys} />
          ) : null}
        </div>
      </div>

      <footer className="api-platform-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{API_PLATFORM_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {API_PLATFORM_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
