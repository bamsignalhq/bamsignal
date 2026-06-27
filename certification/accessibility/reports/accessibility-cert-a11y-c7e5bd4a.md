# Accessibility Certification™

**Run ID:** a11y-c7e5bd4a  
**Generated:** 2026-06-26T23:00:12.347Z  
**Accessibility score:** 97%  
**Release gate:** PASS

## Summary

| Metric | Value |
|--------|------:|
| Domains verified | 10 |
| Total findings | 32 |
| Violations | 0 |
| Critical failures | 0 |
| High failures | 0 |

## Domains

| Domain | Score | Open | Critical | Status |
|--------|------:|-----:|---------:|--------|
| Keyboard Navigation | 100% | 0 | 0 | PASS |
| Focus Order | 100% | 0 | 0 | PASS |
| ARIA Labels | 100% | 0 | 0 | PASS |
| Color Contrast | 100% | 0 | 0 | PASS |
| Screen Readers | 100% | 0 | 0 | PASS |
| Touch Targets | 100% | 0 | 0 | PASS |
| Reduced Motion | 100% | 0 | 0 | PASS |
| Form Labels | 100% | 0 | 0 | PASS |
| Error Messaging | 100% | 0 | 0 | PASS |
| Modal Focus Trapping | 88% | 1 | 0 | PASS |

## Violations

- None

## Open findings

| Domain | Severity | Title | Detail |
|--------|----------|-------|--------|
| modal-focus-trapping | warning | Centralized modal focus trap utility | No shared focus-trap utility — verify manual Tab cycling in QA. |

## Recommendations

- [medium] Centralized modal focus trap utility: No shared focus-trap utility — verify manual Tab cycling in QA.

---
Command: `npm run certify:accessibility`
