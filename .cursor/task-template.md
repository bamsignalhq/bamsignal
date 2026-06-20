# BamSignal Cursor Task Template

TASK:
[one exact fix only]

DO NOT TOUCH:
[list protected areas]

INSPECT FIRST:
[list files, routes, commands, or searches]

ROOT CAUSE TO CONFIRM:
[what must be proven before patching]

ACCEPTANCE TEST:
[what must pass]

COMMANDS:
npm run build
npm run test:server-import

EXTRA COMMANDS IF NEEDED:
- Android changes:
  npx cap sync android
  npm run android:verify-assets

- SEO changes:
  npm run seo:validate

COMMIT:
[commit message]

GIT SAFETY:
Run:
git status --short

Only stage files related to this task.
Leave unrelated dirty files unstaged and report them.

REPORT BACK:
- Root cause
- Files changed
- Why each file changed
- Commands run
- Test results
- Git status summary
- Commit hash
- Anything left unstaged and why

STOP after this task.
