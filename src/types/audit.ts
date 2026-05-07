export type CsvRecord = Record<string, string>;

export type AuditObjectType = "opportunity" | "arr_revenue" | "unknown";

export type AuditSeverity = "critical" | "high" | "medium" | "low";

export type AuditCategory =
  | "field_usage"
  | "naming_confusion"
  | "arr_reliability"
  | "process_integrity"
  | "schema_mapping"
  | "data_quality";

export type CsvParseResult = {
  headers: string[];
  rows: CsvRecord[];
  rowCount: number;
};

export type FieldProfile = {
  fieldName: string;
  totalRows: number;
  populatedRows: number;
  emptyRows: number;
  emptyRate: number;
  distinctCount: number;
  inferredType: "number" | "date" | "boolean" | "text" | "empty";
  examples: string[];
};

export type CanonicalField =
  | "opportunityId"
  | "accountName"
  | "stageName"
  | "amount"
  | "arr"
  | "mrr"
  | "closeDate"
  | "createdDate"
  | "owner"
  | "lastActivityDate"
  | "nextStep"
  | "forecastCategory"
  | "region"
  | "source"
  | "renewalDate"
  | "contractStartDate"
  | "contractEndDate"
  | "revenueStatus"
  | "billingAccountId"
  | "crmAccountId";

export type FieldMapping = {
  canonicalField: CanonicalField;
  sourceField: string;
  confidence: "high" | "medium" | "low";
  reason: string;
};

export type AuditIssue = {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  description: string;
  affectedFields: string[];
  affectedRows: number;
  recommendation: string;
};

export type AuditScore = {
  systemHealthScore: number;
  issueCounts: Record<AuditSeverity, number>;
  coverageScore: number;
  completenessScore: number;
};

export type AuditResult = {
  objectType: AuditObjectType;
  rowCount: number;
  fieldCount: number;
  fields: string[];
  profiles: FieldProfile[];
  mappings: FieldMapping[];
  issues: AuditIssue[];
  score: AuditScore;
  recommendedActions: string[];
  generatedAt: string;
};
