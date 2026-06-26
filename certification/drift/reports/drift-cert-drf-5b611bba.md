# Operational Drift Certification™

**Run ID:** drf-5b611bba  
**Generated:** 2026-06-26T16:47:16.766Z  
**Mode:** static  
**Drift score:** 0%  
**Release gate:** BLOCKED

## Summary

| Metric | Value |
|--------|------:|
| Unexpected drift | 1 |
| Unauthorized changes | 0 |
| Configuration mismatches | 0 |
| Missing secrets | 14 |
| Unused secrets | 67 |

## Domains

| Domain | Findings | Critical | Status |
|--------|----------:|---------:|--------|
| Environment variables | 67 | 0 | PASS |
| Feature Flags | 1 | 0 | PASS |
| Remote Config | 2 | 0 | PASS |
| Permissions | 1 | 0 | PASS |
| Roles | 1 | 0 | PASS |
| Notification templates | 1 | 0 | PASS |
| Payment configuration | 5 | 5 | FAIL |
| Sendchamp | 1 | 0 | PASS |
| Resend | 1 | 0 | PASS |
| Firebase | 1 | 0 | PASS |
| Supabase | 7 | 7 | FAIL |
| Storage buckets | 1 | 0 | PASS |
| Cron schedules | 2 | 1 | FAIL |

## Open findings

| Domain | Title | Severity | Compare | Detail |
|--------|-------|----------|---------|--------|
| environment-variables | Unused secret | warning | current | GOMODCACHE present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | _ZO_DOCTOR present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | PUPPETEER_CACHE_DIR present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | VSCODE_CRASH_REPORTER_PROCESS_TYPE present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | NODE present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | INIT_CWD present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | ANDROID_HOME present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | TERM present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | SHELL present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | VSCODE_PROCESS_TITLE present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | TMPDIR present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | CURSOR_WORKSPACE_LABEL present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | PIP_CACHE_DIR present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | MallocNanoZone present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | COLOR present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | NO_COLOR present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | CURSOR_LAYOUT present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | CURSOR_CONVERSATION_ID present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | NX_CACHE_DIRECTORY present in current environment but not in registry or .env.example. |
| environment-variables | Unused secret | warning | current | CYPRESS_CACHE_FOLDER present in current environment but not in registry or .env.example. |

## Unused secrets

- GOMODCACHE
- _ZO_DOCTOR
- PUPPETEER_CACHE_DIR
- VSCODE_CRASH_REPORTER_PROCESS_TYPE
- NODE
- INIT_CWD
- ANDROID_HOME
- TERM
- SHELL
- VSCODE_PROCESS_TITLE
- TMPDIR
- CURSOR_WORKSPACE_LABEL
- PIP_CACHE_DIR
- MallocNanoZone
- COLOR
- NO_COLOR
- CURSOR_LAYOUT
- CURSOR_CONVERSATION_ID
- NX_CACHE_DIRECTORY
- CYPRESS_CACHE_FOLDER
- USER
- CCACHE_DIR
- COMMAND_MODE
- YARN_CACHE_FOLDER
- SSH_AUTH_SOCK
- __CF_USER_TEXT_ENCODING
- BUN_INSTALL_CACHE_DIR
- HOMEBREW_CACHE
- PATH
- _
- __CFBundleIdentifier
- CP_HOME_DIR
- PWD
- VSCODE_HANDLES_UNCAUGHT_ERRORS
- EDITOR
- VSCODE_ESM_ENTRYPOINT
- CONDA_PKGS_DIRS
- CURSOR_AGENT
- LANG
- PLAYWRIGHT_BROWSERS_PATH
- XPC_FLAGS
- FORCE_COLOR
- MACH_PORT_RENDEZVOUS_PEER_VALDATION
- GEM_SPEC_CACHE
- XPC_SERVICE_NAME
- GRADLE_USER_HOME
- SHLVL
- HOME
- VSCODE_NLS_CONFIG
- PNPM_STORE_PATH
- BUNDLE_PATH
- TURBO_CACHE_DIR
- NUGET_PACKAGES
- NPM_CONFIG_CACHE
- LOGNAME
- GOCACHE
- CURSOR_RIPGREP_PATH
- VSCODE_IPC_HOOK
- VSCODE_CODE_CACHE_PATH
- CARGO_TARGET_DIR
- VSCODE_PID
- AGENT_TRANSCRIPTS
- OSLogRateLimit
- POETRY_CACHE_DIR
- COMPOSER_HOME
- VSCODE_CWD
- UV_CACHE_DIR

## Recommendations

- [critical] Missing secret: DATABASE_URL required for production but unset.
- [critical] Missing secret: SUPABASE_URL required for production but unset.
- [critical] Missing secret: SUPABASE_SERVICE_ROLE_KEY required for production but unset.
- [critical] Missing secret: COMMAND_CENTER_PIN required for production but unset.
- [critical] Missing secret: PAYSTACK_SECRET_KEY required for production but unset.
- [critical] Missing secret: VITE_PAYSTACK_PUBLIC_KEY required for production but unset.
- [critical] Missing secret: CRON_SECRET required for production but unset.
- [critical] Missing secret: DATABASE_URL required for staging but unset.
- [critical] Missing secret: SUPABASE_URL required for staging but unset.
- [critical] Missing secret: SUPABASE_SERVICE_ROLE_KEY required for staging but unset.
- [critical] Missing secret: COMMAND_CENTER_PIN required for staging but unset.
- [critical] Missing secret: PAYSTACK_SECRET_KEY required for staging but unset.
- [critical] Missing secret: VITE_PAYSTACK_PUBLIC_KEY required for staging but unset.
- [critical] Missing secret: CRON_SECRET required for staging but unset.
- [critical] Paystack secret missing: PAYSTACK_SECRET_KEY not set in current environment.
- [critical] Supabase configuration gap: Missing: SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL.
- [critical] Cron secret missing: CRON_SECRET unset — scheduled job authentication may fail.
- [medium] Review unused secret: GOMODCACHE is not documented in .env.example or ENV_REGISTRY.
- [medium] Review unused secret: _ZO_DOCTOR is not documented in .env.example or ENV_REGISTRY.
- [medium] Review unused secret: PUPPETEER_CACHE_DIR is not documented in .env.example or ENV_REGISTRY.
- [medium] Review unused secret: VSCODE_CRASH_REPORTER_PROCESS_TYPE is not documented in .env.example or ENV_REGISTRY.
- [medium] Review unused secret: NODE is not documented in .env.example or ENV_REGISTRY.
- [medium] Review unused secret: INIT_CWD is not documented in .env.example or ENV_REGISTRY.

---
Command: `npm run certify:drift`
