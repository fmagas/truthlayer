import type { AuditIssue, AuditScore, FieldMapping, FieldProfile } from "@/types/audit";

const severityPenalty = {
  critical: 18,
  high: 12,
  medium: 7,
  low: 3,
};

export function scoreAudit(issues: AuditIssue[], profiles: FieldProfile[], mappings: FieldMapping[]): AuditScore {
  const penalty = issues.reduce((total, issue) => total + severityPenalty[issue.severity], 0);
  const systemHealthScore = Math.max(0, 100 - penalty);
  const totalCells = profiles.reduce((total, profile) => total + profile.totalRows, 0);
  const populatedCells = profiles.reduce((total, profile) => total + profile.populatedRows, 0);

  return {
    systemHealthScore,
    issueCounts: {
      critical: issues.filter((issue) => issue.severity === "critical").length,
      high: issues.filter((issue) => issue.severity === "high").length,
      medium: issues.filter((issue) => issue.severity === "medium").length,
      low: issues.filter((issue) => issue.severity === "low").length,
    },
    coverageScore: Math.min(100, Math.round((mappings.length / 10) * 100)),
    completenessScore: totalCells ? Math.round((populatedCells / totalCells) * 100) : 0,
  };
}

export function recommendedActions(issues: AuditIssue[]) {
  return [...new Set(issues.map((issue) => issue.recommendation))].slice(0, 8);
}
