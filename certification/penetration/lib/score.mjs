import { PENETRATION_CERT_BLOCK_ON_EXPLOIT } from "../../../shared/productionPenetrationCertification.mjs";

export function buildPenetrationScore(attacks) {
  const exploited = attacks.filter((item) => item.exploited);
  const penalty =
    exploited.filter((item) => item.severity === "critical").length * 25 +
    exploited.filter((item) => item.severity === "high").length * 15 +
    exploited.filter((item) => item.severity === "medium").length * 8;
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function evaluatePenetrationGate(attacks) {
  if (!PENETRATION_CERT_BLOCK_ON_EXPLOIT) return true;
  return !attacks.some(
    (item) =>
      item.exploited && (item.severity === "critical" || item.severity === "high" || item.critical)
  );
}

export function buildPenetrationFixes(attacks) {
  return attacks.map((attack) => ({
    id: `fix_${attack.id}`,
    attackId: attack.id,
    label: attack.label,
    exploited: attack.exploited,
    priority: attack.exploited
      ? attack.severity === "critical"
        ? "critical"
        : "high"
      : "maintain",
    fix: attack.fix,
    detail: attack.detail
  }));
}

export function buildResidualRisks(attacks) {
  const risks = attacks
    .map((attack) => ({
      id: `risk_${attack.id}`,
      attackId: attack.id,
      label: attack.label,
      severity: attack.exploited ? attack.severity : "low",
      residualRisk: attack.residualRisk
    }))
    .filter((item) => item.residualRisk);

  const exploited = attacks.filter((item) => item.exploited);
  if (exploited.length) {
    risks.unshift({
      id: "risk_open_exploits",
      attackId: "summary",
      label: "Open exploits",
      severity: "critical",
      residualRisk: `${exploited.length} attack(s) succeeded in this run — remediate before production release.`
    });
  }

  return risks;
}
