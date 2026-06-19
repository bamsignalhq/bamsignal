import type { SeoFAQ, SeoPage, SeoSection } from "./seoPages";

export const SEO_LAST_UPDATED = "2026-06-19";

export function helpPage(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  sections: SeoSection[],
  faqs: SeoFAQ[],
  keywords: string[]
): SeoPage {
  return {
    slug,
    title,
    description,
    h1,
    intro,
    sections,
    faqs,
    category: "Help",
    lastUpdated: SEO_LAST_UPDATED,
    canonicalPath: `/help/${slug}`,
    keywords,
    schemaType: "Article"
  };
}

export function safetyPage(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  sections: SeoSection[],
  faqs: SeoFAQ[],
  keywords: string[]
): SeoPage {
  return {
    slug,
    title,
    description,
    h1,
    intro,
    sections,
    faqs,
    category: "Safety",
    lastUpdated: SEO_LAST_UPDATED,
    canonicalPath: `/safety/${slug}`,
    keywords,
    schemaType: "Article"
  };
}

export function featurePage(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  sections: SeoSection[],
  faqs: SeoFAQ[],
  keywords: string[]
): SeoPage {
  return {
    slug,
    title,
    description,
    h1,
    intro,
    sections,
    faqs,
    category: "Features",
    lastUpdated: SEO_LAST_UPDATED,
    canonicalPath: `/features/${slug}`,
    keywords,
    schemaType: "Article"
  };
}

export function premiumPage(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  sections: SeoSection[],
  faqs: SeoFAQ[],
  keywords: string[]
): SeoPage {
  return {
    slug,
    title,
    description,
    h1,
    intro,
    sections,
    faqs,
    category: "Premium",
    lastUpdated: SEO_LAST_UPDATED,
    canonicalPath: `/premium/${slug}`,
    keywords,
    schemaType: "Article"
  };
}

export function guidePage(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  sections: SeoSection[],
  faqs: SeoFAQ[],
  keywords: string[]
): SeoPage {
  return {
    slug,
    title,
    description,
    h1,
    intro,
    sections,
    faqs,
    category: "Guides",
    lastUpdated: SEO_LAST_UPDATED,
    canonicalPath: `/guides/${slug}`,
    keywords,
    schemaType: "Article"
  };
}

export function comparePage(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  sections: SeoSection[],
  faqs: SeoFAQ[],
  keywords: string[]
): SeoPage {
  return {
    slug,
    title,
    description,
    h1,
    intro,
    sections,
    faqs,
    category: "Compare",
    lastUpdated: SEO_LAST_UPDATED,
    canonicalPath: `/compare/${slug}`,
    keywords,
    schemaType: "Article"
  };
}
