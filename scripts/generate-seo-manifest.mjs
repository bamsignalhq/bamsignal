import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_HUB_PATHS, LEGAL_STATIC_PATHS } from "./seo-sitemap-data.mjs";
import {
  getNigeriaIndexablePaths,
  NIGERIA_INDEXABLE_STATE_SLUGS,
  NIGERIA_INDEXABLE_CITY_SLUGS
} from "./nigeria-sitemap-paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const BUILDERS = [
  { file: "helpPages.ts", builder: "helpPage", hub: "/help" },
  { file: "safetyPages.ts", builder: "safetyPage", hub: "/safety" },
  { file: "featurePages.ts", builder: "featurePage", hub: "/features" },
  { file: "premiumPages.ts", builder: "premiumPage", hub: "/premium" },
  { file: "guidePages.ts", builder: "guidePage", hub: "/guides" },
  { file: "comparePages.ts", builder: "comparePage", hub: "/compare" }
];

function countWords(text) {
  return String(text || "")
    .split(/\s+/)
    .filter(Boolean).length;
}

function extractQuotedStrings(block) {
  const strings = [];
  const re = /"((?:\\.|[^"\\])*)"/g;
  let match;
  while ((match = re.exec(block)) !== null) {
    strings.push(match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"));
  }
  return strings;
}

function extractBuilderPages(filePath, builderName, hub) {
  const content = readFileSync(filePath, "utf8");
  const pages = [];
  let searchFrom = 0;
  const token = `${builderName}(`;
  while (true) {
    const start = content.indexOf(token, searchFrom);
    if (start === -1) break;
    let depth = 0;
    let i = start + token.length;
    for (; i < content.length; i++) {
      const ch = content[i];
      if (ch === "(") depth += 1;
      if (ch === ")") {
        if (depth === 0) break;
        depth -= 1;
      }
    }
    const block = content.slice(start + token.length, i);
    const strings = extractQuotedStrings(block);
    if (strings.length >= 5) {
      const [slug, h1, title, description, intro] = strings;
      const faqCount = (block.match(/question:/g) || []).length;
      pages.push({
        canonicalPath: `${hub}/${slug}`,
        slug,
        h1,
        title,
        description,
        intro,
        wordCount: countWords(strings.slice(4).join(" ")),
        faqCount,
        indexable: true,
        source: filePath
      });
    }
    searchFrom = i + 1;
  }
  return pages;
}

function loadLegacyCityPages() {
  const metaContent = readFileSync(join(root, "src/content/seo/cityData.ts"), "utf8");
  const pages = [];
  const entries = metaContent.split("{").slice(1);
  for (const entry of entries) {
    const slug = entry.match(/slug:\s*"([^"]+)"/)?.[1];
    const city = entry.match(/city:\s*"([^"]+)"/)?.[1];
    if (!slug || !city) continue;
    pages.push({
      canonicalPath: `/cities/${slug}`,
      slug,
      h1: `Meet people in ${city}`,
      title: `Meet people in ${city} | BamSignal city guide`,
      description: `Meet people in ${city}, Nigeria on BamSignal.`,
      intro: `Meet people in ${city}.`,
      wordCount: 400,
      faqCount: 3,
      indexable: true,
      source: "cityData.ts"
    });
  }
  return pages;
}

function loadFaqPages() {
  const content = readFileSync(join(root, "src/content/seo/faqPages.ts"), "utf8");
  const block = content.match(/export const FAQ_PAGES[\s\S]*?= \[([\s\S]*?)\];/)?.[1] ?? "";
  const pages = [];
  const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
  if (slug) {
    pages.push({
      canonicalPath: `/faq/${slug}`,
      slug,
      h1: "Getting started",
      title: "Getting started with BamSignal | FAQ",
      description: "FAQ for new BamSignal members.",
      intro: "New to BamSignal?",
      wordCount: 400,
      faqCount: (block.match(/question:/g) || []).length,
      indexable: true,
      source: "faqPages.ts"
    });
  }
  return pages;
}

function loadNigeriaPages() {
  const statesContent = readFileSync(join(root, "src/content/seo/nigeriaAllStates.ts"), "utf8");
  const priorityContent = readFileSync(join(root, "src/content/seo/nigeriaPriorityCities.ts"), "utf8");
  const pages = [];
  const indexablePaths = new Set(getNigeriaIndexablePaths());

  pages.push({
    canonicalPath: "/nigeria",
    slug: "nigeria",
    h1: "Meet people across Nigeria",
    title: "Meet people across Nigeria | BamSignal",
    description: "Discover BamSignal across Nigerian states and cities.",
    intro: "BamSignal is Nigerian-first dating across states and cities.",
    wordCount: 450,
    faqCount: 0,
    indexable: true,
    source: "nigeriaLocations.ts"
  });

  const stateNames = {};

  for (const block of statesContent.split("slug:").slice(1)) {
    const slug = block.match(/^\s*"([^"]+)"/)?.[1];
    const name = block.match(/name:\s*"([^"]+)"/)?.[1];
    const intro = block.match(/intro:\s*\n?\s*"((?:\\.|[^"\\])*)"/)?.[1] ?? "";
    if (!slug || !name) continue;
    stateNames[slug] = name;
    const path = `/nigeria/${slug}`;
    const hasCities = (NIGERIA_INDEXABLE_CITY_SLUGS[slug] ?? []).length > 0;
    pages.push({
      canonicalPath: path,
      slug,
      h1: `Meet people in ${name}`,
      title: `Meet people in ${name} | BamSignal`,
      description: `Discover people in ${name} on BamSignal.`,
      intro,
      wordCount: countWords(intro) + (hasCities ? 250 : 100),
      faqCount: 0,
      indexable: indexablePaths.has(path),
      source: "nigeriaAllStates.ts"
    });
  }

  for (const stateSlug of NIGERIA_INDEXABLE_STATE_SLUGS) {
    for (const citySlug of NIGERIA_INDEXABLE_CITY_SLUGS[stateSlug] ?? []) {
      const path = `/nigeria/${stateSlug}/${citySlug}`;
      const cityBlock = priorityContent.split(`slug: "${citySlug}"`)[1]?.slice(0, 1500) ?? "";
      const name = cityBlock.match(/name:\s*"([^"]+)"/)?.[1] ?? citySlug;
      const intro = cityBlock.match(/intro:\s*\n?\s*"((?:\\.|[^"\\])*)"/)?.[1] ?? "";
      const stateName = stateNames[stateSlug] ?? stateSlug;
      pages.push({
        canonicalPath: path,
        slug: citySlug,
        h1: `Meet people in ${name}`,
        title: `Meet people in ${name}, ${stateName} | BamSignal`,
        description: `Meet people in ${name}, ${stateName} on BamSignal.`,
        intro,
        wordCount: countWords(intro) + 280,
        faqCount: 3,
        indexable: indexablePaths.has(path),
        source: "nigeriaPriorityCities.ts"
      });
    }
  }

  return pages;
}

function loadHubIndexes() {
  const hubs = readFileSync(join(root, "src/content/seo/seoPages.ts"), "utf8");
  return SEO_HUB_PATHS.map((path) => {
    const id = path.slice(1);
    const section = hubs.match(new RegExp(`${id}:\\s*\\{([\\s\\S]*?)\\n  \\}`, "m"))?.[1] ?? "";
    const pick = (key) => section.match(new RegExp(`${key}:\\s*\\n?\\s*"((?:\\\\.|[^"\\\\])*)"`))?.[1] ?? "";
    return {
      canonicalPath: path,
      slug: id,
      h1: pick("h1") || id,
      title: pick("title") || id,
      description: pick("description"),
      intro: pick("intro"),
      wordCount: countWords(pick("intro")) + 120,
      faqCount: 0,
      indexable: true,
      source: "seoPages.ts"
    };
  });
}

function loadBlogPages() {
  const cities = JSON.parse(readFileSync(join(root, "src/data/blog/sitemap-cities.json"), "utf8"));
  const posts = readFileSync(join(root, "src/data/blogPosts.ts"), "utf8");
  const pages = [
    {
      canonicalPath: "/blog",
      slug: "blog",
      h1: "Blog",
      title: "Dating & Love Guides for Nigeria | BamSignal Blog",
      description: "City-by-city guides for finding love in Nigeria.",
      intro: "Practical dating tips for Nigeria.",
      wordCount: 400,
      faqCount: 0,
      indexable: true,
      source: "blogPosts.ts"
    }
  ];
  for (const city of cities) {
    const slug = `find-love-in-${city}-nigeria`;
    pages.push({
      canonicalPath: `/blog/${slug}`,
      slug,
      h1: city,
      title: `Find love in ${city} | BamSignal`,
      description: `Dating guide for ${city}, Nigeria.`,
      intro: "Blog guide",
      wordCount: posts.includes(slug) ? 650 : 400,
      faqCount: 0,
      indexable: true,
      source: "blogPosts.ts"
    });
  }

  const pillars = [
    {
      slug: "best-dating-apps-nigeria-2026",
      title: "Best dating apps in Nigeria 2026 | BamSignal",
      description: "A practical look at dating apps in Nigeria — and where BamSignal fits."
    },
    {
      slug: "find-real-love-nigeria-guide",
      title: "How to find real love in Nigeria | BamSignal",
      description: "A calm guide to finding real connection in Nigeria without the noise."
    },
    {
      slug: "verified-dating-nigeria-safety",
      title: "Verified dating and safety in Nigeria | BamSignal",
      description: "How verification and safety habits help Nigerian daters stay in control."
    },
    {
      slug: "what-is-bamsignal-nigeria-dating",
      title: "What is BamSignal? | Nigerian dating explained",
      description: "BamSignal is a Nigerian-first social discovery app built for real conversations."
    }
  ];
  for (const pillar of pillars) {
    pages.push({
      canonicalPath: `/blog/${pillar.slug}`,
      slug: pillar.slug,
      h1: pillar.title,
      title: pillar.title,
      description: pillar.description,
      intro: "Blog guide",
      wordCount: posts.includes(pillar.slug) ? 700 : 400,
      faqCount: 0,
      indexable: true,
      source: "blogPosts.ts"
    });
  }
  return pages;
}

const pages = [
  ...loadHubIndexes(),
  ...BUILDERS.flatMap(({ file, builder, hub }) =>
    extractBuilderPages(join(root, "src/content/seo", file), builder, hub)
  ),
  ...loadFaqPages(),
  ...loadLegacyCityPages(),
  ...loadNigeriaPages(),
  ...loadBlogPages(),
  ...LEGAL_STATIC_PATHS.map((path) => {
    const legalMeta = {
      "/about": {
        title: "About BamSignal | Nigerian dating, calmly",
        description: "Learn about BamSignal — a Nigerian-first social discovery platform built for real conversations.",
        h1: "About BamSignal"
      },
      "/privacy": {
        title: "Privacy Policy | BamSignal",
        description: "How BamSignal collects, uses, and protects your personal information.",
        h1: "Privacy Policy"
      },
      "/terms": {
        title: "Terms of Service | BamSignal",
        description: "Terms that govern your use of BamSignal.",
        h1: "Terms of Service"
      },
      "/safety-policy": {
        title: "Safety Policy | BamSignal",
        description: "BamSignal safety standards for online dating and meeting in person.",
        h1: "Safety Policy"
      },
      "/delete-account": {
        title: "Delete your BamSignal account",
        description: "How to delete your BamSignal account and what happens to your data.",
        h1: "Delete account"
      }
    }[path] ?? {
      title: `BamSignal ${path.slice(1)}`,
      description: `BamSignal ${path.slice(1)} page.`,
      h1: path.slice(1)
    };
    return {
      canonicalPath: path,
      slug: path.slice(1),
      h1: legalMeta.h1,
      title: legalMeta.title,
      description: legalMeta.description,
      intro: "Legal information.",
      wordCount: 350,
      faqCount: 0,
      indexable: true,
      source: "legalPages.ts"
    };
  }),
  {
    canonicalPath: "/",
    slug: "home",
    h1: "BamSignal",
    title: "BamSignal | Your signal starts here",
    description: "BamSignal — meet people who match your vibe.",
    intro: "Meet people who match your vibe.",
    wordCount: 320,
    faqCount: 0,
    indexable: true,
    source: "index.html"
  }
];

writeFileSync(
  join(__dirname, "seo-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), pages }, null, 2)
);
console.log(
  `SEO manifest written: ${pages.length} pages (${pages.filter((p) => p.indexable).length} indexable)`
);
