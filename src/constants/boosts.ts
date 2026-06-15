export type BoostProductId =
  | "signal-boost"
  | "priority-signal-once"
  | "profile-boost"
  | "city-boost"
  | "city-spotlight";

/** Products shown in member boost shop (compact fintech catalog). */
export const SHOP_BOOST_IDS = ["signal-boost", "priority-signal-once", "profile-boost"] as const;

export type ShopBoostProductId = (typeof SHOP_BOOST_IDS)[number];

export type BoostProductInput = {
  id: BoostProductId;
  name: string;
  price: number;
  description: string;
  cta: string;
};

export type BoostProduct = BoostProductInput & {
  priceLabel: string;
  amountKobo: number;
};

export function hydrateBoost(raw: BoostProductInput): BoostProduct {
  const price = Math.max(0, Math.round(raw.price));
  return {
    ...raw,
    price,
    priceLabel: `₦${price.toLocaleString("en-NG")}`,
    amountKobo: price * 100
  };
}

export const DEFAULT_BOOST_INPUTS: BoostProductInput[] = [
  {
    id: "signal-boost",
    name: "Signal Boost",
    price: 350,
    description: "24-hour visibility boost in your city.",
    cta: "Boost visibility"
  },
  {
    id: "priority-signal-once",
    name: "Priority Signal",
    price: 250,
    description: "Your next Signal appears first.",
    cta: "Send priority"
  },
  {
    id: "profile-boost",
    name: "Profile Boost",
    price: 750,
    description: "48-hour featured placement in your city.",
    cta: "Go featured"
  }
];

export const DEFAULT_BOOST_PRODUCTS: BoostProduct[] = DEFAULT_BOOST_INPUTS.map(hydrateBoost);

export function shopBoostDescription(product: BoostProduct, cityLabel: string): string {
  const place = cityLabel.trim() || "your city";
  switch (product.id) {
    case "signal-boost":
      return `24-hour visibility boost in ${place}.`;
    case "priority-signal-once":
      return "Your next Signal appears first.";
    case "profile-boost":
      return `48-hour featured placement in ${place}.`;
    default:
      return product.description;
  }
}

export function boostNeedsMemberCity(id: BoostProductId): boolean {
  return id === "signal-boost" || id === "profile-boost";
}
