import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "../constants/seo";

export type SeoHeadInput = {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
};

function upsertMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeJsonLdScript(id: string) {
  document.getElementById(id)?.remove();
}

export function applySeoHead(input: SeoHeadInput, jsonLdScriptId = "seo-jsonld") {
  const pageTitle = input.title.includes(SITE_NAME) ? input.title : `${input.title} | ${SITE_NAME}`;
  document.title = pageTitle;

  upsertMeta("description", input.description);
  if (input.keywords?.length) {
    upsertMeta("keywords", input.keywords.join(", "));
  }

  const canonical = absoluteUrl(input.canonicalPath);
  upsertLink("canonical", canonical);

  const ogImage = input.ogImage ?? DEFAULT_OG_IMAGE;
  upsertMeta("og:title", input.ogTitle ?? pageTitle, true);
  upsertMeta("og:description", input.ogDescription ?? input.description, true);
  upsertMeta("og:url", canonical, true);
  upsertMeta("og:type", input.ogType ?? "website", true);
  upsertMeta("og:image", ogImage, true);
  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", input.ogTitle ?? pageTitle);
  upsertMeta("twitter:description", input.ogDescription ?? input.description);
  upsertMeta("twitter:image", ogImage);

  upsertMeta("robots", input.noindex ? "noindex,follow" : "index,follow");

  removeJsonLdScript(jsonLdScriptId);
  if (input.jsonLd) {
    const script = document.createElement("script");
    script.id = jsonLdScriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(
      Array.isArray(input.jsonLd) ? input.jsonLd : input.jsonLd
    );
    document.head.appendChild(script);
  }
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function buildArticleJsonLd(page: {
  title: string;
  description: string;
  canonicalPath: string;
  lastUpdated: string;
  headline?: string;
}): Record<string, unknown> {
  const date = page.lastUpdated;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.headline ?? page.title,
    description: page.description,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(page.canonicalPath)
    }
  };
}

export function buildFaqJsonLd(
  faqs: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function buildWebPageJsonLd(page: {
  title: string;
  description: string;
  canonicalPath: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(page.canonicalPath)
  };
}

export function buildPlaceJsonLd(page: {
  title: string;
  description: string;
  canonicalPath: string;
  city?: string;
  state?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: page.city ?? page.title,
    description: page.description,
    url: absoluteUrl(page.canonicalPath),
    address: {
      "@type": "PostalAddress",
      addressLocality: page.city,
      addressRegion: page.state,
      addressCountry: "NG"
    }
  };
}
