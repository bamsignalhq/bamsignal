import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type LaunchLead = {
  id: string;
  email?: string;
  phone?: string;
  city?: string;
  at: string;
};

export function getLaunchLeads(): LaunchLead[] {
  return readJson<LaunchLead[]>(STORAGE_KEYS.launchLeads, []);
}

export function addLaunchLead(input: { email?: string; phone?: string; city?: string }): {
  ok: boolean;
  error?: string;
} {
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.replace(/\D/g, "");
  if (!email && !phone) {
    return { ok: false, error: "Add an email or phone number." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (phone && phone.length < 10) {
    return { ok: false, error: "Enter a valid phone number." };
  }

  const leads = getLaunchLeads();
  if (leads.some((l) => (email && l.email === email) || (phone && l.phone === phone))) {
    return { ok: false, error: "You're already on the list." };
  }

  leads.unshift({
    id: `lead-${Date.now()}`,
    email: email || undefined,
    phone: phone || undefined,
    city: input.city?.trim() || undefined,
    at: new Date().toISOString()
  });
  writeJson(STORAGE_KEYS.launchLeads, leads.slice(0, 500));
  return { ok: true };
}
