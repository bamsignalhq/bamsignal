# Security Certification™

**Run ID:** sec-30a333e9  
**Generated:** 2026-07-22T15:40:42.903Z  
**Security score:** 82%  
**Release gate:** BLOCKED

## Severity counts

| Severity | Count |
|----------|------:|
| Critical | 2 |
| High | 1 |
| Medium | 0 |
| Low | 0 |

## Failed checks

| Check | Severity | Title | Detail |
|-------|----------|-------|--------|
| owasp-top-10 | CRITICAL | OWASP Top 10 baseline | 2 critical/high OWASP-aligned finding(s) require remediation. |
| dependency-audit | CRITICAL | Critical dependency vulnerabilities | 1 critical npm advisory(ies): tar |
| dependency-audit | HIGH | High dependency vulnerabilities | 1 high npm advisory(ies): brace-expansion |

## Recommendations

- **Fix OWASP Top 10 baseline** (critical): 2 critical/high OWASP-aligned finding(s) require remediation.
- **Fix Critical dependency vulnerabilities** (critical): 1 critical npm advisory(ies): tar
- **Fix High dependency vulnerabilities** (high): 1 high npm advisory(ies): brace-expansion

---
Command: `npm run certify:security`
