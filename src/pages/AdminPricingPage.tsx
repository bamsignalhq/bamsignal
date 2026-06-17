import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { BoostProductInput } from "../constants/boosts";
import { DEFAULT_BOOST_INPUTS } from "../constants/boosts";
import { durationLabel } from "../constants/plans";
import type { PremiumPlanInput } from "../constants/plans";
import { usePlans } from "../context/PlansContext";
import { saveBoostProductsAdmin, fetchBoostProducts } from "../services/boosts";
import { savePremiumPlansAdmin, verifyAdminSession } from "../services/plans";
import {
  fetchSubscriptionCatalog,
  saveSubscriptionCatalogAdmin,
  type SubscriptionCatalog,
  type SubscriptionProduct
} from "../services/subscriptionCatalog";
import { supabase } from "../services/supabase";
import { useAdminConsent } from "../components/admin/AdminConsentProvider";

type AdminPricingPageProps = {
  onBack: () => void;
  embedded?: boolean;
};

function productById(catalog: SubscriptionCatalog, id: string): SubscriptionProduct | undefined {
  return catalog.products.find((item) => item.id === id);
}

export function AdminPricingPage({ onBack, embedded }: AdminPricingPageProps) {
  const { plans, refreshPlans } = usePlans();
  const { ensureConsent } = useAdminConsent();
  const [draft, setDraft] = useState<PremiumPlanInput[]>([]);
  const [catalogDraft, setCatalogDraft] = useState<SubscriptionCatalog | null>(null);
  const [boostDraft, setBoostDraft] = useState<BoostProductInput[]>(DEFAULT_BOOST_INPUTS);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    setDraft(
      plans.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        days: p.days,
        highlight: p.highlight
      }))
    );
  }, [plans]);

  useEffect(() => {
    void fetchSubscriptionCatalog().then((catalog) => {
      if (catalog) setCatalogDraft(catalog);
    });
  }, []);

  useEffect(() => {
    void fetchBoostProducts().then((products) => {
      setBoostDraft(
        products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          cta: p.cta
        }))
      );
    });
  }, []);

  useEffect(() => {
    supabase?.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      const ok = await verifyAdminSession(token);
      setAuthorized(ok);
      if (!ok) setMessage("Console access required.");
    });
  }, []);

  const updatePlan = (index: number, patch: Partial<PremiumPlanInput>) => {
    setDraft((current) => current.map((plan, i) => (i === index ? { ...plan, ...patch } : plan)));
  };

  const updateBoost = (index: number, patch: Partial<BoostProductInput>) => {
    setBoostDraft((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const updateCatalogProduct = (productId: string, patch: Partial<SubscriptionProduct>) => {
    setCatalogDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        products: current.products.map((product) =>
          product.id === productId ? { ...product, ...patch } : product
        )
      };
    });
  };

  const updateCatalogPlan = (
    productId: string,
    planId: string,
    patch: Partial<SubscriptionProduct["plans"][number]>
  ) => {
    setCatalogDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        products: current.products.map((product) => {
          if (product.id !== productId) return product;
          return {
            ...product,
            plans: product.plans.map((plan) => (plan.id === planId ? { ...plan, ...patch } : plan))
          };
        })
      };
    });
  };

  const savePlans = async (label: string) => {
    setSavingKey(label);
    setMessage("");
    if (!(await ensureConsent("Save pricing changes."))) {
      setSavingKey(null);
      setMessage("Console PIN required.");
      return;
    }
    const { data } = (await supabase?.auth.getSession()) || { data: { session: null } };
    const result = await savePremiumPlansAdmin(draft, data.session?.access_token);
    setSavingKey(null);
    if (result.ok) {
      await refreshPlans();
      setMessage(result.error ? `Plans saved. ${result.error}` : "Signal passes saved.");
    } else {
      setMessage(result.error || "Could not save plans.");
    }
  };

  const saveCatalog = async (label: string) => {
    if (!catalogDraft) return;
    setSavingKey(label);
    setMessage("");
    if (!(await ensureConsent("Save subscription catalog."))) {
      setSavingKey(null);
      setMessage("Console PIN required.");
      return;
    }
    const { data } = (await supabase?.auth.getSession()) || { data: { session: null } };
    const result = await saveSubscriptionCatalogAdmin(catalogDraft, data.session?.access_token);
    setSavingKey(null);
    if (result.ok) {
      await refreshPlans();
      setMessage("Subscription catalog saved.");
    } else {
      setMessage(result.error || "Could not save catalog.");
    }
  };

  const saveBoosts = async (label: string) => {
    setSavingKey(label);
    setMessage("");
    const result = await saveBoostProductsAdmin(boostDraft);
    setSavingKey(null);
    if (result.ok) {
      setMessage(result.error ? `Boosts saved. ${result.error}` : "Boost products saved.");
    } else {
      setMessage(result.error || "Could not save boosts.");
    }
  };

  const signalProduct = catalogDraft ? productById(catalogDraft, "signal_pass") : undefined;
  const fastConnectionProduct = catalogDraft ? productById(catalogDraft, "fast_connection_pass") : undefined;

  if (authorized === null) {
    return (
      <div className="page admin-page empty-state">
        <Loader2 className="spin" size={32} />
        <p>Authenticating…</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="page admin-page">
        <button type="button" className="admin-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="card">
          <h2>Console access required</h2>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`page admin-page ${embedded ? "admin-page--embedded" : ""}`}>
      {!embedded && (
        <button type="button" className="admin-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to app
        </button>
      )}

      <header className="page-header">
        <h2>Pricing & boosts</h2>
        <p>Configure passes, free exchange limits, and one-time boosts — no code deploy required.</p>
      </header>

      {catalogDraft ? (
        <section className="card admin-plan-row">
          <div className="admin-plan-row__head">
            <span className="admin-plan-id">free_exchange</span>
            <button
              type="button"
              className="btn-secondary btn-sm admin-row-save"
              disabled={savingKey === "policy"}
              onClick={() => void saveCatalog("policy")}
            >
              {savingKey === "policy" ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
              Save policy
            </button>
          </div>
          <label>
            Free contact exchanges per window
            <input
              type="number"
              min={0}
              max={99}
              value={catalogDraft.contactExchangePolicy.freeLimit}
              onChange={(e) =>
                setCatalogDraft({
                  ...catalogDraft,
                  contactExchangePolicy: {
                    ...catalogDraft.contactExchangePolicy,
                    freeLimit: Number(e.target.value)
                  }
                })
              }
            />
          </label>
          <label>
            Window length (days)
            <input
              type="number"
              min={1}
              max={365}
              value={catalogDraft.contactExchangePolicy.windowDays}
              onChange={(e) =>
                setCatalogDraft({
                  ...catalogDraft,
                  contactExchangePolicy: {
                    ...catalogDraft.contactExchangePolicy,
                    windowDays: Number(e.target.value)
                  }
                })
              }
            />
          </label>
        </section>
      ) : null}

      {signalProduct ? (
        <>
          <header className="page-header">
            <h3>{signalProduct.name}</h3>
            <p>{signalProduct.description}</p>
          </header>
          <section className="card admin-plan-row">
            <label className="admin-toggle-row">
              <input
                type="checkbox"
                checked={signalProduct.active}
                onChange={(e) => updateCatalogProduct("signal_pass", { active: e.target.checked })}
              />
              Active
            </label>
            <label>
              Visibility
              <select
                value={signalProduct.visibility}
                onChange={(e) =>
                  updateCatalogProduct("signal_pass", {
                    visibility: e.target.value as "public" | "hidden"
                  })
                }
              >
                <option value="public">Public</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            <label>
              Features (one per line)
              <textarea
                rows={6}
                value={signalProduct.features.join("\n")}
                onChange={(e) =>
                  updateCatalogProduct("signal_pass", {
                    features: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean)
                  })
                }
              />
            </label>
            <button
              type="button"
              className="btn-secondary btn-sm admin-row-save"
              disabled={savingKey === "signal_pass"}
              onClick={() => void saveCatalog("signal_pass")}
            >
              {savingKey === "signal_pass" ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
              Save Signal Pass
            </button>
          </section>
        </>
      ) : null}

      <div className="admin-plan-editor">
        {draft.map((plan, index) => (
          <section key={plan.id} className="card admin-plan-row">
            <div className="admin-plan-row__head">
              <span className="admin-plan-id">{plan.id}</span>
              <button
                type="button"
                className="btn-secondary btn-sm admin-row-save"
                disabled={savingKey === `plan-${plan.id}`}
                onClick={() => void savePlans(`plan-${plan.id}`)}
              >
                {savingKey === `plan-${plan.id}` ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                Save pass
              </button>
            </div>
            <label>
              Plan name
              <input value={plan.name} onChange={(e) => updatePlan(index, { name: e.target.value })} />
            </label>
            <label>
              Price (₦)
              <input
                type="number"
                min={100}
                step={1}
                value={plan.price}
                onChange={(e) => {
                  const price = Number(e.target.value);
                  updatePlan(index, { price });
                  updateCatalogPlan("signal_pass", plan.id, { price });
                }}
              />
            </label>
            <label>
              Duration (days)
              <input
                type="number"
                min={1}
                max={370}
                value={plan.days}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  updatePlan(index, { days });
                  updateCatalogPlan("signal_pass", plan.id, { days });
                }}
              />
              <small>{durationLabel(plan.days)}</small>
            </label>
            <label>
              Badge (optional)
              <input
                value={plan.highlight || ""}
                onChange={(e) => {
                  updatePlan(index, { highlight: e.target.value });
                  updateCatalogPlan("signal_pass", plan.id, { highlight: e.target.value });
                }}
                placeholder="Popular, Best value..."
              />
            </label>
            <p className="admin-plan-preview">
              Preview: <strong>{plan.name}</strong> — ₦{plan.price.toLocaleString("en-NG")} /{" "}
              {durationLabel(plan.days)}
            </p>
          </section>
        ))}
      </div>

      {fastConnectionProduct ? (
        <>
          <header className="page-header">
            <h3>{fastConnectionProduct.name}</h3>
            <p>{fastConnectionProduct.description}</p>
          </header>
          <section className="card admin-plan-row">
            <label className="admin-toggle-row">
              <input
                type="checkbox"
                checked={fastConnectionProduct.active}
                onChange={(e) => updateCatalogProduct("fast_connection_pass", { active: e.target.checked })}
              />
              Active
            </label>
            <label>
              Badge text
              <input
                value={fastConnectionProduct.badgeText || ""}
                onChange={(e) => updateCatalogProduct("fast_connection_pass", { badgeText: e.target.value })}
              />
            </label>
            <label>
              Features (one per line)
              <textarea
                rows={5}
                value={fastConnectionProduct.features.join("\n")}
                onChange={(e) =>
                  updateCatalogProduct("fast_connection_pass", {
                    features: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean)
                  })
                }
              />
            </label>
            {fastConnectionProduct.plans.map((plan) => (
              <div key={plan.id} className="admin-plan-row admin-plan-row--nested">
                <span className="admin-plan-id">{plan.id}</span>
                <label>
                  Plan name
                  <input
                    value={plan.name}
                    onChange={(e) => updateCatalogPlan("fast_connection_pass", plan.id, { name: e.target.value })}
                  />
                </label>
                <label>
                  Price (₦)
                  <input
                    type="number"
                    min={100}
                    value={plan.price}
                    onChange={(e) =>
                      updateCatalogPlan("fast_connection_pass", plan.id, { price: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Duration (days)
                  <input
                    type="number"
                    min={1}
                    value={plan.days}
                    onChange={(e) =>
                      updateCatalogPlan("fast_connection_pass", plan.id, { days: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary btn-sm admin-row-save"
              disabled={savingKey === "fast_connection_pass"}
              onClick={() => void saveCatalog("fast_connection_pass")}
            >
              {savingKey === "fast_connection_pass" ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
              Save Fast Connection Pass
            </button>
          </section>
        </>
      ) : null}

      <header className="page-header">
        <h3>Signal boosts</h3>
      </header>

      <div className="admin-plan-editor">
        {boostDraft.map((product, index) => (
          <section key={product.id} className="card admin-plan-row">
            <div className="admin-plan-row__head">
              <span className="admin-plan-id">{product.id}</span>
              <button
                type="button"
                className="btn-secondary btn-sm admin-row-save"
                disabled={savingKey === `boost-${product.id}`}
                onClick={() => void saveBoosts(`boost-${product.id}`)}
              >
                {savingKey === `boost-${product.id}` ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                Save boost
              </button>
            </div>
            <label>
              Product name
              <input value={product.name} onChange={(e) => updateBoost(index, { name: e.target.value })} />
            </label>
            <label>
              Price (₦)
              <input
                type="number"
                min={50}
                step={1}
                value={product.price}
                onChange={(e) => updateBoost(index, { price: Number(e.target.value) })}
              />
            </label>
            <label>
              Description
              <input
                value={product.description}
                onChange={(e) => updateBoost(index, { description: e.target.value })}
              />
            </label>
            <label>
              Button label
              <input value={product.cta} onChange={(e) => updateBoost(index, { cta: e.target.value })} />
            </label>
            <p className="admin-plan-preview">
              Preview: <strong>{product.name}</strong> — ₦{product.price.toLocaleString("en-NG")}
            </p>
          </section>
        ))}
      </div>

      {message && <p className="admin-message">{message}</p>}
    </div>
  );
}
