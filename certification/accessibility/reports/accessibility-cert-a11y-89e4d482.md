# Accessibility Certification™

**Run ID:** a11y-89e4d482  
**Generated:** 2026-06-27T11:11:43.906Z  
**Accessibility score:** 87%  
**Release gate:** PASS

## Summary

| Metric | Value |
|--------|------:|
| Domains verified | 10 |
| Total findings | 32 |
| Violations | 1 |
| Critical failures | 0 |
| High failures | 1 |

## Domains

| Domain | Score | Open | Critical | Status |
|--------|------:|-----:|---------:|--------|
| Keyboard Navigation | 100% | 0 | 0 | PASS |
| Focus Order | 100% | 0 | 0 | PASS |
| ARIA Labels | 100% | 0 | 0 | PASS |
| Color Contrast | 100% | 0 | 0 | PASS |
| Screen Readers | 100% | 0 | 0 | PASS |
| Touch Targets | 100% | 0 | 0 | PASS |
| Reduced Motion | 50% | 1 | 0 | PASS |
| Form Labels | 100% | 0 | 0 | PASS |
| Error Messaging | 100% | 0 | 0 | PASS |
| Modal Focus Trapping | 88% | 1 | 0 | PASS |

## Violations

- **[high]** Member motion tokens loaded in app shell: main.tsx imports member-motion.css.

## Open findings

| Domain | Severity | Title | Detail |
|--------|----------|-------|--------|
| reduced-motion | high | Member motion tokens loaded in app shell | main.tsx imports member-motion.css. |
| modal-focus-trapping | warning | Centralized modal focus trap utility | No shared focus-trap utility — verify manual Tab cycling in QA. |

## Recommendations

- [high] Member motion tokens loaded in app shell: main.tsx imports member-motion.css.
- [medium] Centralized modal focus trap utility: No shared focus-trap utility — verify manual Tab cycling in QA.

---
Command: `npm run certify:accessibility`
