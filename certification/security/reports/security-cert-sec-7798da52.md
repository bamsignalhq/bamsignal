# Security Certification™

**Run ID:** sec-7798da52  
**Generated:** 2026-06-26T22:58:53.484Z  
**Security score:** 88%  
**Release gate:** BLOCKED

## Severity counts

| Severity | Count |
|----------|------:|
| Critical | 1 |
| High | 1 |
| Medium | 0 |
| Low | 0 |

## Failed checks

| Check | Severity | Title | Detail |
|-------|----------|-------|--------|
| owasp-top-10 | CRITICAL | OWASP Top 10 baseline | 1 critical/high OWASP-aligned finding(s) require remediation. |
| dependency-audit | HIGH | High dependency vulnerabilities | 1 high npm advisory(ies): vite |

## Recommendations

- **Fix OWASP Top 10 baseline** (critical): 1 critical/high OWASP-aligned finding(s) require remediation.
- **Fix High dependency vulnerabilities** (high): 1 high npm advisory(ies): vite

---
Command: `npm run certify:security`
