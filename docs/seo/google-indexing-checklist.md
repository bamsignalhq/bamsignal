# Google Search Console — indexing checklist

Use this after deploying SEO changes to production.

## Submit and verify

- [ ] Open [Google Search Console](https://search.google.com/search-console) for `bamsignal.com`
- [ ] Submit sitemap: `https://bamsignal.com/sitemap.xml`
- [ ] Confirm sitemap status shows **Success** (allow 24–48 hours)
- [ ] Inspect URL: `https://bamsignal.com/`
- [ ] Inspect URL: `https://bamsignal.com/nigeria`
- [ ] Inspect URL: `https://bamsignal.com/nigeria/lagos/ikeja`
- [ ] Inspect URL: `https://bamsignal.com/nigeria/enugu/abakpa`
- [ ] Inspect URL: `https://bamsignal.com/nigeria/rivers/port-harcourt`
- [ ] Inspect URL: `https://bamsignal.com/help/create-profile`

## Technical checks

- [ ] `https://bamsignal.com/robots.txt` loads and lists sitemap
- [ ] Member routes are disallowed (`/home`, `/discover`, `/admin`, etc.)
- [ ] Sample pages include absolute canonical tags (`https://bamsignal.com/...`)
- [ ] Sample pages include `index,follow` (indexable) or `noindex,follow` (placeholders)
- [ ] BreadcrumbList JSON-LD present on hub and detail pages
- [ ] FAQPage JSON-LD matches visible FAQ content on help/safety/city pages
- [ ] Article JSON-LD on blog and guide pages

## Quality and UX

- [ ] Mobile-friendly test passes on homepage and `/nigeria`
- [ ] PageSpeed Insights reviewed (fix critical issues only)
- [ ] No thin or duplicate titles/descriptions flagged in Search Console
- [ ] Do **not** request indexing for `noindex` placeholder state pages

## After 7–14 days

- [ ] Review **Pages** → **Indexed** count in Search Console
- [ ] Review **Coverage** / **Page indexing** reports for errors
- [ ] Fix any “Duplicate without user-selected canonical” or “Crawled – currently not indexed” patterns
- [ ] Run locally: `npm run seo:validate`

## Local validation commands

```bash
npm run build
npm run test:server-import
npm run seo:validate
```
