import type { AuditResult } from "@/types/audit";
import { parseAuditCsv } from "./csvParser";
import { detectObjectType, mapFields } from "./fieldMapper";
import { detectIssues } from "./issueEngine";
import { recommendedActions, scoreAudit } from "./scoring";
import { profileSchema } from "./schemaProfiler";

export function runAudit(csv: string): AuditResult {
  const parsed = parseAuditCsv(csv);
  const profiles = profileSchema(parsed.headers, parsed.rows);
  const mappings = mapFields(profiles);
  const objectType = detectObjectType(mappings, profiles);
  const issues = detectIssues({
    objectType,
    profiles,
    mappings,
    rows: parsed.rows,
  });
  const score = scoreAudit(issues, profiles, mappings);

  return {
    objectType,
    rowCount: parsed.rowCount,
    fieldCount: parsed.headers.length,
    fields: parsed.headers,
    profiles,
    mappings,
    issues,
    score,
    recommendedActions: recommendedActions(issues),
    generatedAt: "2026-05-07T00:00:00.000Z",
  };
}
