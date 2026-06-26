import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ACCESSIBILITY_CERT_DOMAINS,
  ACCESSIBILITY_CERT_MEMBER_MODALS
} from "../../../shared/accessibilityCertificationDomains.mjs";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const rootPath = join(moduleDir, "../../..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function fileExists(relativePath) {
  return statSync(join(rootPath, relativePath), { throwIfNoEntry: false })?.isFile();
}

function finding(partial) {
  return {
    passed: true,
    severity: "low",
    detail: "",
    ...partial
  };
}

function walkSourceFiles(dir, files = []) {
  const absoluteDir = join(rootPath, dir);
  if (!statSync(absoluteDir, { throwIfNoEntry: false })?.isDirectory()) return files;
  for (const entry of readdirSync(absoluteDir)) {
    const fullPath = join(absoluteDir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
      walkSourceFiles(relative(rootPath, fullPath), files);
      continue;
    }
    if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(relative(rootPath, fullPath));
    }
  }
  return files;
}

function stripCommentsAndStrings(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/`[^`]*`/g, "")
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "''");
}

function countMatches(source, pattern) {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
}

function checkKeyboardNavigation() {
  const findings = [];
  const otpSource = read("src/components/OtpDigitInput.tsx");
  const authFieldSource = read("src/components/AuthField.tsx");

  findings.push(
    finding({
      id: "keyboard-otp-backspace",
      domainId: "keyboard-navigation",
      title: "OTP inputs support keyboard navigation",
      detail: "OtpDigitInput handles Backspace and digit entry for PIN/verification flows.",
      passed: otpSource.includes("Backspace") && otpSource.includes("onKeyDown"),
      severity: "critical"
    })
  );

  findings.push(
    finding({
      id: "keyboard-native-inputs",
      domainId: "keyboard-navigation",
      title: "Auth fields use native keyboard-focusable inputs",
      detail: "AuthField renders standard <input> elements without removing tab focus.",
      passed: authFieldSource.includes("<input") && !authFieldSource.includes("tabIndex={-1}"),
      severity: "high"
    })
  );

  const bottomNavSource = read("src/components/BottomNav.tsx");
  findings.push(
    finding({
      id: "keyboard-bottom-nav-buttons",
      domainId: "keyboard-navigation",
      title: "Primary navigation uses native buttons",
      detail: "BottomNav items are <button> elements reachable via keyboard Tab.",
      passed: bottomNavSource.includes("<button") && bottomNavSource.includes('type="button"'),
      severity: "high"
    })
  );

  return findings;
}

function checkFocusOrder() {
  const memberFiles = walkSourceFiles("src/components").concat(walkSourceFiles("src/pages"));
  let positiveTabIndex = 0;
  let memberFileCount = 0;

  for (const file of memberFiles) {
    if (file.includes("/admin/")) continue;
    memberFileCount += 1;
    const source = read(file);
    positiveTabIndex += countMatches(source, /tabIndex=\{[1-9]/g);
  }

  return [
    finding({
      id: "focus-order-no-positive-tabindex",
      domainId: "focus-order",
      title: "Member UI avoids positive tabindex overrides",
      detail:
        positiveTabIndex === 0
          ? "No positive tabindex values detected in member surfaces."
          : `${positiveTabIndex} positive tabindex value(s) may disrupt natural focus order.`,
      passed: positiveTabIndex <= 2,
      severity: positiveTabIndex > 5 ? "high" : "warning"
    }),
    finding({
      id: "focus-order-dom-coverage",
      domainId: "focus-order",
      title: "Member component tree scanned for focus order",
      detail: `Scanned ${memberFileCount} member-facing component/page files.`,
      passed: memberFileCount > 20,
      severity: "low"
    })
  ];
}

function checkAriaLabels() {
  const findings = [];
  const bottomNavSource = read("src/components/BottomNav.tsx");
  const preloaderSource = read("src/components/Preloader.tsx");
  const authPageSource = read("src/pages/AuthPage.tsx");

  findings.push(
    finding({
      id: "aria-bottom-nav",
      domainId: "aria-labels",
      title: "Main navigation landmark labeled",
      detail: 'BottomNav exposes aria-label="Main navigation".',
      passed: bottomNavSource.includes('aria-label="Main navigation"'),
      severity: "critical"
    })
  );

  findings.push(
    finding({
      id: "aria-preloader",
      domainId: "aria-labels",
      title: "Loading state labeled for assistive tech",
      detail: 'Preloader exposes aria-label="Loading BamSignal".',
      passed: preloaderSource.includes('aria-label="Loading BamSignal"'),
      severity: "high"
    })
  );

  findings.push(
    finding({
      id: "aria-auth-home",
      domainId: "aria-labels",
      title: "Auth brand control has accessible name",
      detail: "Auth home/back controls include aria-label text.",
      passed: authPageSource.includes('aria-label="Back to BamSignal home"'),
      severity: "high"
    })
  );

  const memberComponentFiles = walkSourceFiles("src/components").filter(
    (file) => !file.includes("/admin/")
  );
  let iconButtons = 0;
  let unlabeledIconButtons = 0;

  for (const file of memberComponentFiles) {
    const source = read(file);
    const buttonMatches = source.match(/<button[^>]*className="[^"]*icon-btn[^"]*"[^>]*>/g) || [];
    for (const buttonTag of buttonMatches) {
      iconButtons += 1;
      if (!/aria-label=/.test(buttonTag)) {
        unlabeledIconButtons += 1;
      }
    }
  }

  const labelRatio = iconButtons === 0 ? 1 : (iconButtons - unlabeledIconButtons) / iconButtons;
  findings.push(
    finding({
      id: "aria-icon-buttons",
      domainId: "aria-labels",
      title: "Icon buttons include accessible names",
      detail:
        iconButtons === 0
          ? "No icon-btn patterns detected in static scan."
          : `${iconButtons - unlabeledIconButtons}/${iconButtons} icon buttons include aria-label.`,
      passed: labelRatio >= 0.7,
      severity: labelRatio < 0.5 ? "high" : "warning"
    })
  );

  return findings;
}

function checkColorContrast() {
  const findings = [];
  const mainSource = read("src/main.tsx");
  const themeContrast = read("src/styles/theme-contrast.css");
  const memberFintech = read("src/styles/member-fintech.css");

  findings.push(
    finding({
      id: "contrast-theme-import",
      domainId: "color-contrast",
      title: "Theme contrast stylesheet loaded globally",
      detail: "main.tsx imports theme-contrast.css for member text contrast fixes.",
      passed: mainSource.includes('import "./styles/theme-contrast.css"'),
      severity: "critical"
    })
  );

  findings.push(
    finding({
      id: "contrast-tokens",
      domainId: "color-contrast",
      title: "Member design tokens define readable text colors",
      detail: "theme-contrast.css and member-fintech.css reference --text and surface tokens.",
      passed:
        themeContrast.includes("var(--text)") &&
        memberFintech.includes("--bs-text") &&
        memberFintech.includes("--bs-surface"),
      severity: "high"
    })
  );

  findings.push(
    finding({
      id: "contrast-auth-errors",
      domainId: "color-contrast",
      title: "Auth error text styled for visibility",
      detail: "AuthField renders dedicated error styles for invalid fields.",
      passed: read("src/components/AuthField.tsx").includes("auth-field__error"),
      severity: "medium"
    })
  );

  return findings;
}

function checkScreenReaders() {
  const authPageSource = read("src/pages/AuthPage.tsx");
  const authFieldSource = read("src/components/AuthField.tsx");
  const bottomNavSource = read("src/components/BottomNav.tsx");

  return [
    finding({
      id: "sr-auth-status",
      domainId: "screen-readers",
      title: "Auth flows expose status regions",
      detail: 'AuthPage uses role="status" for verification and reset messaging.',
      passed: countMatches(authPageSource, /role="status"/g) >= 2,
      severity: "high"
    }),
    finding({
      id: "sr-error-alerts",
      domainId: "screen-readers",
      title: "Form errors announced as alerts",
      detail: 'AuthField errors use role="alert" for screen reader announcement.',
      passed: authFieldSource.includes('role="alert"'),
      severity: "critical"
    }),
    finding({
      id: "sr-nav-current-page",
      domainId: "screen-readers",
      title: "Navigation exposes current page",
      detail: "BottomNav sets aria-current on the active tab.",
      passed: bottomNavSource.includes("aria-current"),
      severity: "high"
    })
  ];
}

function checkTouchTargets() {
  const memberFintech = read("src/styles/member-fintech.css");
  const bottomNavSource = read("src/components/BottomNav.tsx");

  return [
    finding({
      id: "touch-target-min-height",
      domainId: "touch-targets",
      title: "Member tap targets meet 44px minimum",
      detail: "member-fintech.css defines 44px min-height for primary controls.",
      passed: memberFintech.includes("min-height: 44px"),
      severity: "critical"
    }),
    finding({
      id: "touch-target-bottom-nav",
      domainId: "touch-targets",
      title: "Bottom navigation uses full-width tap rows",
      detail: "BottomNav buttons span the nav bar for thumb-friendly targets.",
      passed: bottomNavSource.includes("<nav") && bottomNavSource.includes("<button"),
      severity: "medium"
    })
  ];
}

function checkReducedMotion() {
  const memberMotion = read("src/styles/member-motion.css");
  const mainSource = read("src/main.tsx");

  return [
    finding({
      id: "motion-member-stylesheet",
      domainId: "reduced-motion",
      title: "Member motion stylesheet respects reduced motion",
      detail: "member-motion.css includes prefers-reduced-motion media queries.",
      passed: memberMotion.includes("@media (prefers-reduced-motion: reduce)"),
      severity: "critical"
    }),
    finding({
      id: "motion-global-import",
      domainId: "reduced-motion",
      title: "Member motion tokens loaded in app shell",
      detail: "main.tsx imports member-motion.css.",
      passed: mainSource.includes('import "./styles/member-motion.css"'),
      severity: "high"
    })
  ];
}

function checkFormLabels() {
  const authPageSource = read("src/pages/AuthPage.tsx");
  const authFieldSource = read("src/components/AuthField.tsx");
  const loginSection = authPageSource.slice(
    authPageSource.indexOf('label="Username"'),
    authPageSource.indexOf("Forgot PIN?")
  );

  return [
    finding({
      id: "form-labels-authfield",
      domainId: "form-labels",
      title: "AuthField associates labels with inputs",
      detail: "AuthField wraps inputs in <label> with visible label text.",
      passed:
        authFieldSource.includes("<label") &&
        authFieldSource.includes("<input") &&
        authFieldSource.includes("<span>{label}</span>"),
      severity: "critical"
    }),
    finding({
      id: "form-labels-login",
      domainId: "form-labels",
      title: "Login form uses Username and PIN labels",
      detail: 'Login surface exposes label="Username" and label="PIN" (not password).',
      passed: loginSection.includes('label="Username"') && loginSection.includes('label="PIN"'),
      severity: "critical"
    }),
    finding({
      id: "form-labels-pin-copy",
      domainId: "form-labels",
      title: "Login copy avoids password terminology",
      detail: "User-facing login strings use PIN, not password.",
      passed:
        !/>\s*Password\s*</.test(stripCommentsAndStrings(authPageSource)) &&
        authPageSource.includes("Forgot PIN?"),
      severity: "critical"
    })
  ];
}

function checkErrorMessaging() {
  const authFieldSource = read("src/components/AuthField.tsx");
  const authPageSource = read("src/pages/AuthPage.tsx");

  return [
    finding({
      id: "error-authfield-aria",
      domainId: "error-messaging",
      title: "Field errors linked via aria-describedby",
      detail: "AuthField wires aria-invalid and aria-describedby to error text.",
      passed:
        authFieldSource.includes("aria-invalid") && authFieldSource.includes("aria-describedby"),
      severity: "critical"
    }),
    finding({
      id: "error-auth-messages",
      domainId: "error-messaging",
      title: "Auth validation uses plain-language errors",
      detail: 'Auth handlers return messages like "Invalid username or PIN."',
      passed:
        authPageSource.includes("Invalid username or PIN.") &&
        authPageSource.includes("Enter your PIN."),
      severity: "high"
    })
  ];
}

function checkModalFocusTrapping() {
  const findings = [];
  const codebaseFiles = walkSourceFiles("src");

  let modalDialogs = 0;
  let labeledDialogs = 0;

  for (const file of codebaseFiles) {
    if (file.includes("/admin/")) continue;
    const source = read(file);
    modalDialogs += countMatches(source, /role="dialog"/g);
    if (/role="dialog"/.test(source) && /aria-modal="true"/.test(source)) {
      labeledDialogs += 1;
    }
  }

  findings.push(
    finding({
      id: "modal-dialog-semantics",
      domainId: "modal-focus-trapping",
      title: "Member modals expose dialog semantics",
      detail: `${labeledDialogs} member files combine role="dialog" with aria-modal="true".`,
      passed: labeledDialogs >= 8,
      severity: "critical"
    })
  );

  for (const modalPath of ACCESSIBILITY_CERT_MEMBER_MODALS) {
    if (!fileExists(modalPath)) {
      findings.push(
        finding({
          id: `modal-tracked-${modalPath}`,
          domainId: "modal-focus-trapping",
          title: `Tracked modal present: ${modalPath}`,
          detail: "Expected member modal file is missing from the tree.",
          passed: false,
          severity: "high"
        })
      );
      continue;
    }

    const source = read(modalPath);
    const hasSemantics = source.includes('role="dialog"') && source.includes('aria-modal="true"');
    findings.push(
      finding({
        id: `modal-semantics-${modalPath}`,
        domainId: "modal-focus-trapping",
        title: `Modal dialog semantics: ${modalPath.split("/").pop()}`,
        detail: hasSemantics
          ? "aria-modal dialog pattern detected."
          : "Missing aria-modal and/or role=dialog.",
        passed: hasSemantics,
        severity: "critical"
      })
    );
  }

  const hasFocusTrapUtility = codebaseFiles.some((file) => {
    const source = read(file);
    return /\buseFocusTrap\b|\bFocusTrap\b|focus-trap-react/.test(source);
  });

  findings.push(
    finding({
      id: "modal-focus-trap-utility",
      domainId: "modal-focus-trapping",
      title: "Centralized modal focus trap utility",
      detail: hasFocusTrapUtility
        ? "Focus trap helper detected for keyboard containment."
        : "No shared focus-trap utility — verify manual Tab cycling in QA.",
      passed: hasFocusTrapUtility,
      severity: "warning"
    })
  );

  return findings;
}

export function runAllAccessibilityChecks() {
  const findings = [
    ...checkKeyboardNavigation(),
    ...checkFocusOrder(),
    ...checkAriaLabels(),
    ...checkColorContrast(),
    ...checkScreenReaders(),
    ...checkTouchTargets(),
    ...checkReducedMotion(),
    ...checkFormLabels(),
    ...checkErrorMessaging(),
    ...checkModalFocusTrapping()
  ];

  const domainIds = new Set(ACCESSIBILITY_CERT_DOMAINS.map((item) => item.id));
  for (const findingItem of findings) {
    if (!domainIds.has(findingItem.domainId)) {
      throw new Error(`Unknown accessibility domain: ${findingItem.domainId}`);
    }
  }

  return { findings };
}

export function buildRecommendations(findings) {
  const recommendations = [];
  const seen = new Set();

  for (const item of findings) {
    if (item.passed) continue;
    const key = `${item.severity}:${item.title}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const priority =
      item.severity === "critical"
        ? "critical"
        : item.severity === "high"
          ? "high"
          : item.severity === "warning"
            ? "medium"
            : "low";

    recommendations.push({
      id: `rec-${item.id}`,
      priority,
      title: item.title,
      detail: item.detail
    });
  }

  return recommendations.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

export function buildViolations(findings) {
  return findings
    .filter((item) => !item.passed && (item.severity === "critical" || item.severity === "high"))
    .map((item) => ({
      id: item.id,
      domainId: item.domainId,
      title: item.title,
      detail: item.detail,
      severity: item.severity
    }));
}
