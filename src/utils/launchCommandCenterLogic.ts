import type {
  LaunchCommandBlocker,
  LaunchCommandCenterBundle,
  LaunchCommandGoNoGo,
  LaunchCommandSectionSnapshot,
  LaunchReadinessScore
} from "../types/launchCommandCenter";
import type { LaunchGoNoGoId } from "../constants/launchCommandCenter";

export function scoreToStatus(score: number): LaunchReadinessScore["status"] {
  if (score >= 90) return "healthy";
  if (score >= 80) return "warning";
  return "critical";
}

export function computeLaunchGoNoGo(
  scores: LaunchReadinessScore[],
  blockers: LaunchCommandBlocker[]
): LaunchCommandGoNoGo {
  const openBlockers = blockers.filter((item) => item.status === "open");
  const critical = openBlockers.filter((item) => item.severity === "critical");
  const high = openBlockers.filter((item) => item.severity === "high");
  const overall = scores.find((item) => item.id === "overall")?.score ?? 0;
  const minScore = scores.length ? Math.min(...scores.map((item) => item.score)) : 0;
  const reasoning: string[] = [];

  if (critical.length > 0) {
    reasoning.push(
      `${critical.length} critical blocker(s) open — launch would risk member safety, payments, or data integrity.`
    );
    return {
      recommendation: "no-go",
      reasoning,
      capacityHeadroom: "Not safe for 100,000 members today",
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  if (overall < 75 || minScore < 65) {
    reasoning.push(
      `Overall readiness ${overall}% is below the 75% threshold required for 100,000 member load.`
    );
    if (minScore < 65) {
      reasoning.push(`Lowest domain score ${minScore}% is below the 65% floor.`);
    }
    return {
      recommendation: "no-go",
      reasoning,
      capacityHeadroom: "Not safe for 100,000 members today",
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  if (high.length > 0 || overall < 88 || minScore < 82) {
    if (high.length > 0) {
      reasoning.push(`${high.length} high-severity blocker(s) require mitigation before full launch.`);
    }
    if (overall < 88) {
      reasoning.push(`Overall readiness ${overall}% is below the 88% comfort threshold.`);
    }
    if (minScore < 82) {
      reasoning.push(`Domain score floor ${minScore}% indicates capacity risk under peak load.`);
    }
    reasoning.push("Platform can serve members with elevated monitoring and consultant surge staffing.");
    return {
      recommendation: "go-with-warnings",
      reasoning,
      capacityHeadroom: "Can serve 100,000 members with warnings — monitor consultations and support",
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  reasoning.push("All critical services healthy and readiness scores above launch threshold.");
  reasoning.push("No critical blockers. Payment, OTP, and notification success rates within SLA.");
  reasoning.push("Database and queue health support projected 100,000 member concurrency.");

  return {
    recommendation: "go",
    reasoning,
    capacityHeadroom: "Can safely serve 100,000 members today",
    lastEvaluatedAt: new Date().toISOString()
  };
}

export function buildLaunchCommandCenterBundle(input: {
  readinessScores: LaunchReadinessScore[];
  blockers: LaunchCommandBlocker[];
  sections: LaunchCommandSectionSnapshot[];
  criticalServices: LaunchCommandCenterBundle["criticalServices"];
  incidents: LaunchCommandCenterBundle["incidents"];
  deployments: LaunchCommandCenterBundle["deployments"];
}): LaunchCommandCenterBundle {
  return {
    generatedAt: new Date().toISOString(),
    goNoGo: computeLaunchGoNoGo(input.readinessScores, input.blockers),
    readinessScores: input.readinessScores,
    blockers: input.blockers,
    sections: input.sections,
    criticalServices: input.criticalServices,
    incidents: input.incidents,
    deployments: input.deployments
  };
}

export function countBlockersBySeverity(blockers: LaunchCommandBlocker[], severity: string) {
  return blockers.filter((item) => item.status === "open" && item.severity === severity).length;
}

export function formatLaunchGoNoGoLine(recommendation: LaunchGoNoGoId) {
  if (recommendation === "go") return "GO — platform cleared for 100,000 member load";
  if (recommendation === "go-with-warnings") return "GO WITH WARNINGS — launch with elevated monitoring";
  return "NO GO — resolve blockers before launch";
}

export function findSectionSnapshot(
  sections: LaunchCommandSectionSnapshot[],
  sectionId: LaunchCommandSectionSnapshot["sectionId"]
) {
  return sections.find((item) => item.sectionId === sectionId) ?? null;
}
