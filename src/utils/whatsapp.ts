/** Normalize Nigerian numbers for wa.me links */
export function whatsappHref(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "https://wa.me/";
  if (digits.startsWith("234")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/234${digits.slice(1)}`;
  return `https://wa.me/234${digits}`;
}

export function formatWhatsappDisplay(raw: string): string {
  const trimmed = raw.trim();
  return trimmed || "WhatsApp";
}
