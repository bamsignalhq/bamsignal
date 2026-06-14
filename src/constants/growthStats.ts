import { getCms } from "./cms";
import { whatsappHref } from "../utils/whatsapp";

export type StatHighlight = {
  label: string;
  value: string;
  href?: string;
};

export function getGrowthStats(): StatHighlight[] {
  const cms = getCms();
  return [
    { label: "Verified profiles", value: cms.growthVerifiedProfiles },
    { label: "Cities live", value: cms.growthCitiesLive },
    { label: "Signals sent", value: cms.growthSignalsSent }
  ];
}

export function getContactHighlights(): StatHighlight[] {
  const cms = getCms();
  const whatsapp = cms.supportWhatsapp.trim();
  return [
    { label: "Response time", value: cms.supportResponseTime },
    { label: "Support hours", value: cms.supportHours },
    {
      label: "Quick Response",
      value: "WhatsApp",
      href: whatsapp ? whatsappHref(whatsapp) : undefined
    }
  ];
}
