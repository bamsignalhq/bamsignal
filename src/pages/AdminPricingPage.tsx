import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { BoostProductInput } from "../constants/boosts";
import { DEFAULT_BOOST_INPUTS } from "../constants/boosts";
import { durationLabel } from "../constants/plans";
import type { PremiumPlanInput } from "../constants/plans";
import { usePlans } from "../context/PlansContext";
import { saveBoostProductsAdmin, fetchBoostProducts } from "../services/boosts";
import { savePremiumPlansAdmin, verifyAdminSession } from "../services/plans";
import { supabase } from "../services/supabase";
import { useAdminConsent } from "../components/admin/AdminConsentProvider";

type AdminPricingPageProps = {
  onBack: () => void;
  embedded?: boolean;
};

export function AdminPricingPage({ onBack, embedded }: AdminPricingPageProps) {
  const { plans, refreshPlans } = usePlans();
  const { ensureConsent } = useAdminConsent();
  const [draft, setDraft] = useState<PremiumPlanInput[]>([]);
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
        <p>Save each product on its own row — no scrolling required.</p>
      </header>

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
                onChange={(e) => updatePlan(index, { price: Number(e.target.value) })}
              />
            </label>
            <label>
              Duration (days)
              <input
                type="number"
                min={1}
                max={370}
                value={plan.days}
                onChange={(e) => updatePlan(index, { days: Number(e.target.value) })}
              />
              <small>{durationLabel(plan.days)}</small>
            </label>
            <label>
              Badge (optional)
              <input
                value={plan.highlight || ""}
                onChange={(e) => updatePlan(index, { highlight: e.target.value })}
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
