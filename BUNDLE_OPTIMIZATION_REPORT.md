# Production Bundle Optimization Report

Generated: 2026-06-26T17:29:34.410Z

## Initial load (entry index chunks)

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Initial JS | 724.0 KB | 686.7 KB | 37.3 KB (5%) |
| Initial CSS | 1028.0 KB | 430.4 KB | 597.6 KB (58%) |
| Initial total | 1752.0 KB | 1117.1 KB | 634.9 KB (36%) |

## Largest JS chunks (deferred load acceptable)

- `heic2any-CN0yrWM7.js` — 1321.1 KB
- `index-DU8kscGD.js` — 686.7 KB
- `supabase-Be25SE7n.js` — 207.4 KB
- `PublicMarketingRoutes-C7nnMuY_.js` — 160.3 KB
- `ConsultantDashboardPage-i1nKUmqj.js` — 159.8 KB
- `react-C5bXTfMn.js` — 130.8 KB
- `AdminConsoleRoot-2nsWYyfK.js` — 115.5 KB
- `RelationshipFollowUpPage-BwIqcEgl.js` — 88.1 KB

## Largest CSS chunks

- `index-BQFrxSmL.css` — 430.4 KB
- `AdminConsoleRoot-B8f6QQfW.css` — 341.8 KB
- `BamSignalInstitutePageShell-DMniHLFP.css` — 153.0 KB
- `PublicMarketingRoutes-QmSmrI0X.css` — 53.3 KB
- `SignalConciergePageShell-wfZyAtSN.css` — 44.2 KB
- `ConsultantPortalRoot-b_3tUtcX.css` — 16.7 KB
- `LegalPage-DhCVMZ6d.css` — 11.7 KB
- `SupportCenterPageShell-BsqQ5zBG.css` — 7.5 KB

## Deferred route chunks (sample)

- `heic2any-CN0yrWM7.js` — 1321.1 KB
- `supabase-Be25SE7n.js` — 207.4 KB
- `PublicMarketingRoutes-C7nnMuY_.js` — 160.3 KB
- `ConsultantDashboardPage-i1nKUmqj.js` — 159.8 KB
- `react-C5bXTfMn.js` — 130.8 KB
- `AdminConsoleRoot-2nsWYyfK.js` — 115.5 KB

## Largest image (served)

- `public/showcase/backdrop.png` — 1597.9 KB (production uses WebP where available)

## Optimizations applied

- CSS code-split: admin, public marketing, institute, careers, support, concierge, and moment styles load with their lazy routes
- Voice Vibe page lazy-loaded from App shell
- react-easy-crop dynamically imported in cover photo modal
- Vite manual chunks: tensorflow, photo-crop, heic2any isolated from initial bundle
- modulePreload polyfill disabled (modern browsers only)

