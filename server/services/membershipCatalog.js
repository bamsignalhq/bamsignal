/**
 * Experience membership catalog — DB-backed prices with platform_settings mirror.
 * Discover plans still fulfill via existing premium / premium_until path.
 */
import { getPlatformSetting, query, setPlatformSetting } from "../db.js";
import { DEFAULT_PREMIUM_PLANS, normalizePlans } from "../pricing.js";

export const DISCOVER_PRODUCT_ID = "discover";
export const DISCREET_PRODUCT_ID = "discreet";
export const DEFAULT_CONSULTATION_FEE_NGN = 100_000;

function nairaFromKobo(priceKobo) {
  return Math.max(0, Math.round(Number(priceKobo || 0) / 100));
}

function planRowToSetting(row) {
  return {
    id: String(row.id || "").trim(),
    name: String(row.name || row.id || "").trim(),
    price: nairaFromKobo(row.price_kobo ?? row.priceKobo ?? (Number(row.price) || 0) * 100),
    days: Math.max(1, Math.round(Number(row.days) || 1)),
    highlight: String(row.highlight || "").trim() || "",
    active: row.active !== false,
    visibility: row.visibility === "hidden" ? "hidden" : "public"
  };
}

export async function tablesReady() {
  try {
    await query("select 1 from membership_plans limit 1");
    return true;
  } catch {
    return false;
  }
}

export async function listMembershipPlans(productId, { forSaleOnly = false } = {}) {
  const ready = await tablesReady();
  if (!ready) {
    if (productId === DISCOVER_PRODUCT_ID) {
      return normalizePlans(DEFAULT_PREMIUM_PLANS).map((plan) => ({
        ...plan,
        active: plan.id !== "quarterly",
        visibility: plan.id === "quarterly" ? "hidden" : "public"
      }));
    }
    if (productId === DISCREET_PRODUCT_ID) {
      return [
        {
          id: "monthly",
          name: "Monthly Discreet Membership",
          price: 9999,
          priceLabel: "₦9,999",
          days: 30,
          amountKobo: 999_900,
          highlight: undefined,
          active: true,
          visibility: "public"
        }
      ];
    }
    return [];
  }

  const result = await query(
    `select id, product_id, name, interval_label, price_kobo, days, active, visibility, highlight, sort_order
     from membership_plans
     where product_id = $1
     order by sort_order asc, id asc`,
    [productId]
  );

  let rows = (result.rows || []).map((row) => {
    const price = nairaFromKobo(row.price_kobo);
    return {
      id: row.id,
      name: row.name,
      price,
      priceLabel: `₦${price.toLocaleString("en-NG")}`,
      days: Number(row.days),
      amountKobo: Number(row.price_kobo),
      highlight: row.highlight || undefined,
      active: row.active !== false,
      visibility: row.visibility === "hidden" ? "hidden" : "public"
    };
  });

  if (forSaleOnly) {
    rows = rows.filter((row) => row.active && row.visibility === "public");
  }

  return rows;
}

export async function upsertMembershipPlans(productId, plans = []) {
  const ready = await tablesReady();
  const normalized = normalizePlans(plans).map((plan, index) => ({
    ...plan,
    active: plans.find((p) => p.id === plan.id)?.active !== false,
    visibility: plans.find((p) => p.id === plan.id)?.visibility === "hidden" ? "hidden" : "public",
    sortOrder: index
  }));

  if (ready) {
    for (const plan of normalized) {
      await query(
        `insert into membership_plans (
           id, product_id, name, interval_label, price_kobo, days, active, visibility, highlight, sort_order, updated_at
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
         on conflict (product_id, id) do update set
           name = excluded.name,
           interval_label = excluded.interval_label,
           price_kobo = excluded.price_kobo,
           days = excluded.days,
           active = excluded.active,
           visibility = excluded.visibility,
           highlight = excluded.highlight,
           sort_order = excluded.sort_order,
           updated_at = now()`,
        [
          plan.id,
          productId,
          plan.name,
          plan.id === "weekly" ? "weekly" : plan.id === "quarterly" ? "quarterly" : "monthly",
          plan.amountKobo,
          plan.days,
          plan.active !== false,
          plan.visibility === "hidden" ? "hidden" : "public",
          plan.highlight || null,
          plan.sortOrder
        ]
      );
    }
  }

  if (productId === DISCOVER_PRODUCT_ID) {
    await setPlatformSetting(
      "premium_plans",
      normalized.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        days: plan.days,
        highlight: plan.highlight || "",
        active: plan.active !== false,
        visibility: plan.visibility
      }))
    );
  }

  if (productId === DISCREET_PRODUCT_ID) {
    await setPlatformSetting(
      "discreet_plans",
      normalized.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        days: plan.days,
        highlight: plan.highlight || "",
        active: plan.active !== false,
        visibility: plan.visibility
      }))
    );
  }

  return listMembershipPlans(productId);
}

export async function loadDiscoverPlansForCheckout({ forSaleOnly = false } = {}) {
  const fromTable = await listMembershipPlans(DISCOVER_PRODUCT_ID, { forSaleOnly: false });
  if (fromTable.length) {
    return forSaleOnly
      ? fromTable.filter((plan) => plan.active !== false && plan.visibility !== "hidden")
      : fromTable;
  }

  const stored = await getPlatformSetting("premium_plans", null);
  const withFlags = normalizePlans(stored).map((plan) => {
    const raw = Array.isArray(stored) ? stored.find((row) => row?.id === plan.id) : null;
    const active = raw && typeof raw.active === "boolean" ? raw.active : plan.id !== "quarterly";
    const visibility =
      raw?.visibility === "hidden" || plan.id === "quarterly" ? "hidden" : "public";
    return { ...plan, active, visibility };
  });

  if (forSaleOnly) {
    return withFlags.filter((plan) => plan.active !== false && plan.visibility !== "hidden");
  }
  return withFlags;
}

export async function loadDiscreetPlansForCheckout({ forSaleOnly = true } = {}) {
  const fromTable = await listMembershipPlans(DISCREET_PRODUCT_ID, { forSaleOnly });
  if (fromTable.length) return fromTable;
  const stored = await getPlatformSetting("discreet_plans", null);
  if (Array.isArray(stored) && stored.length) {
    return normalizePlans(stored).map((plan) => ({
      ...plan,
      active: true,
      visibility: "public"
    }));
  }
  return listMembershipPlans(DISCREET_PRODUCT_ID, { forSaleOnly });
}

export async function getConsultationFeeNgn() {
  const stored = await getPlatformSetting("consultation_fee_ngn", DEFAULT_CONSULTATION_FEE_NGN);
  const value = typeof stored === "number" ? stored : Number(stored);
  return Math.max(1, Math.round(Number.isFinite(value) ? value : DEFAULT_CONSULTATION_FEE_NGN));
}

export async function getConsultationFeeAmountKobo() {
  return (await getConsultationFeeNgn()) * 100;
}

export async function setConsultationFeeNgn(amountNgn) {
  const value = Math.max(1, Math.round(Number(amountNgn) || DEFAULT_CONSULTATION_FEE_NGN));
  await setPlatformSetting("consultation_fee_ngn", value);
  return value;
}

export async function listConciergePackages({ activeOnly = false } = {}) {
  try {
    const result = await query(
      `select id, name, tagline, description, price_kobo, active, sort_order, benefits, regions, retired_at
       from concierge_packages
       where ($1::boolean = false or (active = true and retired_at is null))
       order by sort_order asc, name asc`,
      [activeOnly]
    );
    return (result.rows || []).map((row) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline || "",
      description: row.description || "",
      priceKobo: Number(row.price_kobo),
      priceLabel: `₦${nairaFromKobo(row.price_kobo).toLocaleString("en-NG")}`,
      active: row.active !== false,
      sortOrder: Number(row.sort_order) || 0,
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      regions: Array.isArray(row.regions) ? row.regions : [],
      retiredAt: row.retired_at || null
    }));
  } catch {
    return [];
  }
}

export async function upsertConciergePackage(input = {}) {
  const id = String(input.id || "").trim();
  if (!id) throw new Error("Package id is required");
  const name = String(input.name || id).trim();
  const priceKobo = Math.max(1, Math.round(Number(input.priceKobo || input.price_kobo || 0)));
  if (!priceKobo) throw new Error("Package price is required");

  await query(
    `insert into concierge_packages (
       id, name, tagline, description, price_kobo, active, sort_order, benefits, regions, retired_at, updated_at
     ) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10, now())
     on conflict (id) do update set
       name = excluded.name,
       tagline = excluded.tagline,
       description = excluded.description,
       price_kobo = excluded.price_kobo,
       active = excluded.active,
       sort_order = excluded.sort_order,
       benefits = excluded.benefits,
       regions = excluded.regions,
       retired_at = excluded.retired_at,
       updated_at = now()`,
    [
      id,
      name,
      String(input.tagline || "").trim(),
      String(input.description || "").trim(),
      priceKobo,
      input.active !== false,
      Math.max(0, Math.round(Number(input.sortOrder) || 0)),
      JSON.stringify(Array.isArray(input.benefits) ? input.benefits : []),
      JSON.stringify(Array.isArray(input.regions) ? input.regions : []),
      input.active === false ? input.retiredAt || new Date().toISOString() : null
    ]
  );

  const packages = await listConciergePackages();
  return packages.find((row) => row.id === id) || null;
}

export function toPlatformPlanSettings(plans) {
  return plans.map(planRowToSetting);
}
