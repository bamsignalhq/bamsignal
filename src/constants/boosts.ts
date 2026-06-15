export type BoostProductId =
  | "signal-boost"
  | "priority-signal-once"
  | "profile-boost"
  | "city-boost"
  | "city-spotlight";

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
    description: "24-hour visibility spike across Discover in your city.",
    cta: "Boost visibility"
  },
  {
    id: "priority-signal-once",
    name: "Priority Signal",
    price: 250,
    description: "Your next signal lands first in their Likes inbox.",
    cta: "Send priority"
  },
  {
    id: "profile-boost",
    name: "Profile Boost",
    price: 750,
    description: "48-hour featured placement at the top of local results.",
    cta: "Go featured"
  },
  {
    id: "city-spotlight",
    name: "Hot",
    price: 500,
    description: "24 hours in Featured Members for your city — the horizontal spotlight row visitors browse.",
    cta: "Get Hot"
  },
  {
    id: "city-boost",
    name: "City Boost",
    price: 600,
    description: "48-hour visibility boost across Discover in your city.",
    cta: "Boost my city"
  }
];

export const DEFAULT_BOOST_PRODUCTS: BoostProduct[] = DEFAULT_BOOST_INPUTS.map(hydrateBoost);
