import type { AuditIssue, AuditObjectType, CanonicalField, CsvRecord, FieldMapping, FieldProfile } from "@/types/audit";
import { getMappedField } from "./fieldMapper";

type IssueContext = {
  objectType: AuditObjectType;
  profiles: FieldProfile[];
  mappings: FieldMapping[];
  rows: CsvRecord[];
};

export function detectIssues(context: IssueContext): AuditIssue[] {
  const issues = [
    ...schemaMappingIssues(context),
    ...fieldUsageIssues(context),
    ...namingConfusionIssues(context),
    ...arrReliabilityIssues(context),
    ...processIntegrityIssues(context),
  ];

  return issues.map((issue, index) => ({ ...issue, id: `${issue.category.toUpperCase()}-${index + 1}` }));
}

function schemaMappingIssues({ objectType, mappings }: IssueContext): AuditIssue[] {
  const required: CanonicalField[] =
    objectType === "arr_revenue"
      ? ["accountName", "arr", "revenueStatus", "contractStartDate", "contractEndDate"]
      : ["opportunityId", "accountName", "stageName", "amount", "closeDate", "owner"];
  const mapped = new Set(mappings.map((mapping) => mapping.canonicalField));

  return required
    .filter((field) => !mapped.has(field))
    .map((field) => ({
      id: "",
      category: "schema_mapping",
      severity: field === "opportunityId" || field === "arr" ? "high" : "medium",
      title: `Missing canonical mapping for ${field}`,
      description: `The audit could not confidently map a source column to ${field}.`,
      affectedFields: [],
      affectedRows: 0,
      recommendation: `Add or rename a column that clearly represents ${field}.`,
    }));
}

function fieldUsageIssues({ profiles }: IssueContext): AuditIssue[] {
  return profiles
    .filter((profile) => profile.totalRows >= 3 && profile.emptyRate >= 0.4)
    .map((profile) => ({
      id: "",
      category: "field_usage",
      severity: profile.emptyRate >= 0.7 ? "high" : "medium",
      title: `${profile.fieldName} is underused`,
      description: `${profile.emptyRows} of ${profile.totalRows} rows are blank in this field.`,
      affectedFields: [profile.fieldName],
      affectedRows: profile.emptyRows,
      recommendation: `Clarify ownership and required usage for ${profile.fieldName}.`,
    }));
}

function namingConfusionIssues({ profiles }: IssueContext): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const fields = profiles.map((profile) => profile.fieldName);
  const amountLike = fields.filter((field) => /amount|arr|mrr|acv|tcv|revenue|value/i.test(field));
  const accountLike = fields.filter((field) => /account|company|customer/i.test(field));
  const dateLike = fields.filter((field) => /close|renewal|end date|contract end|expected/i.test(field));

  if (amountLike.length >= 3) {
    issues.push({
      id: "",
      category: "naming_confusion",
      severity: "high",
      title: "Multiple revenue amount fields create ambiguity",
      description: `Found overlapping amount fields: ${amountLike.join(", ")}.`,
      affectedFields: amountLike,
      affectedRows: 0,
      recommendation: "Define one canonical booked amount and one canonical recurring revenue field.",
    });
  }

  if (accountLike.length >= 3) {
    issues.push({
      id: "",
      category: "naming_confusion",
      severity: "medium",
      title: "Multiple customer identity fields may not reconcile",
      description: `Found overlapping account/customer fields: ${accountLike.join(", ")}.`,
      affectedFields: accountLike,
      affectedRows: 0,
      recommendation: "Map CRM account, billing account, and display customer name as separate canonical fields.",
    });
  }

  if (dateLike.length >= 3) {
    issues.push({
      id: "",
      category: "naming_confusion",
      severity: "medium",
      title: "Multiple close or contract date fields need definitions",
      description: `Found several date fields that can be confused: ${dateLike.join(", ")}.`,
      affectedFields: dateLike,
      affectedRows: 0,
      recommendation: "Document which date drives forecast, renewal, billing, and contract reporting.",
    });
  }

  return issues;
}

function arrReliabilityIssues({ objectType, rows, mappings }: IssueContext): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const arrField = getMappedField(mappings, "arr");
  const mrrField = getMappedField(mappings, "mrr");
  const amountField = getMappedField(mappings, "amount");
  const statusField = getMappedField(mappings, "revenueStatus");
  const billingIdField = getMappedField(mappings, "billingAccountId");
  const crmIdField = getMappedField(mappings, "crmAccountId");

  if (arrField) {
    const invalidArrRows = rows.filter((row) => toNumber(row[arrField]) <= 0).length;
    if (invalidArrRows > 0) {
      issues.push({
        id: "",
        category: "arr_reliability",
        severity: "critical",
        title: "ARR contains zero or negative values",
        description: `${invalidArrRows} rows have ARR less than or equal to zero.`,
        affectedFields: [arrField],
        affectedRows: invalidArrRows,
        recommendation: "Separate active, churned, cancelled, and placeholder subscriptions before using ARR for health scoring.",
      });
    }
  }

  if (arrField && mrrField) {
    const mismatchRows = rows.filter((row) => {
      const arr = toNumber(row[arrField]);
      const mrr = toNumber(row[mrrField]);
      return arr > 0 && mrr > 0 && Math.abs(arr - mrr * 12) > Math.max(1000, arr * 0.08);
    }).length;

    if (mismatchRows > 0) {
      issues.push({
        id: "",
        category: "arr_reliability",
        severity: "high",
        title: "ARR and MRR do not reconcile",
        description: `${mismatchRows} rows have ARR that does not align with MRR x 12.`,
        affectedFields: [arrField, mrrField],
        affectedRows: mismatchRows,
        recommendation: "Choose a system of record for recurring revenue and add reconciliation rules.",
      });
    }
  }

  if (arrField && amountField) {
    const mismatchRows = rows.filter((row) => {
      const arr = toNumber(row[arrField]);
      const amount = toNumber(row[amountField]);
      return arr > 0 && amount > 0 && Math.abs(arr - amount) > Math.max(5000, arr * 0.35);
    }).length;

    if (mismatchRows > 0) {
      issues.push({
        id: "",
        category: "arr_reliability",
        severity: "medium",
        title: "Opportunity amount and ARR diverge",
        description: `${mismatchRows} rows show material variance between amount and ARR.`,
        affectedFields: [arrField, amountField],
        affectedRows: mismatchRows,
        recommendation: "Label one field as booked amount and another as recurring revenue to avoid mixed reporting.",
      });
    }
  }

  if (statusField && arrField) {
    const activeZeroRows = rows.filter((row) => /active|live|booked/i.test(row[statusField] ?? "") && toNumber(row[arrField]) <= 0).length;
    if (activeZeroRows > 0) {
      issues.push({
        id: "",
        category: "arr_reliability",
        severity: "high",
        title: "Active revenue rows have no ARR",
        description: `${activeZeroRows} active revenue rows have no positive ARR value.`,
        affectedFields: [statusField, arrField],
        affectedRows: activeZeroRows,
        recommendation: "Block active revenue status unless ARR is populated and reconciled.",
      });
    }
  }

  if (objectType === "arr_revenue" && billingIdField && crmIdField) {
    const missingLinkRows = rows.filter((row) => !row[billingIdField]?.trim() || !row[crmIdField]?.trim()).length;
    if (missingLinkRows > 0) {
      issues.push({
        id: "",
        category: "arr_reliability",
        severity: "high",
        title: "Revenue rows are missing CRM or billing account links",
        description: `${missingLinkRows} rows cannot be reliably joined across CRM and billing systems.`,
        affectedFields: [billingIdField, crmIdField],
        affectedRows: missingLinkRows,
        recommendation: "Require both CRM account ID and billing account ID for revenue reporting tables.",
      });
    }
  }

  return issues;
}

function processIntegrityIssues({ objectType, rows, mappings }: IssueContext): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const stageField = getMappedField(mappings, "stageName");
  const closeDateField = getMappedField(mappings, "closeDate");
  const nextStepField = getMappedField(mappings, "nextStep");
  const lastActivityField = getMappedField(mappings, "lastActivityDate");
  const forecastField = getMappedField(mappings, "forecastCategory");
  const ownerField = getMappedField(mappings, "owner");
  const contractStartField = getMappedField(mappings, "contractStartDate");
  const contractEndField = getMappedField(mappings, "contractEndDate");

  if (objectType === "opportunity" && stageField && nextStepField) {
    const lateStageMissingNext = rows.filter((row) => /proposal|negotiation|procurement|commit|legal/i.test(row[stageField] ?? "") && !row[nextStepField]?.trim()).length;
    if (lateStageMissingNext > 0) {
      issues.push({
        id: "",
        category: "process_integrity",
        severity: "high",
        title: "Late-stage opportunities missing next step",
        description: `${lateStageMissingNext} late-stage opportunities do not have a next step.`,
        affectedFields: [stageField, nextStepField],
        affectedRows: lateStageMissingNext,
        recommendation: "Require next step before a deal can remain in late-stage forecast categories.",
      });
    }
  }

  if (objectType === "opportunity" && lastActivityField) {
    const staleRows = rows.filter((row) => daysSince(row[lastActivityField]) > 14).length;
    if (staleRows > 0) {
      issues.push({
        id: "",
        category: "process_integrity",
        severity: "medium",
        title: "CRM activity evidence is stale",
        description: `${staleRows} rows have no CRM activity in more than 14 days.`,
        affectedFields: [lastActivityField],
        affectedRows: staleRows,
        recommendation: "Treat this as an evidence gap unless email, calendar, call, or notes data is also checked.",
      });
    }
  }

  if (objectType === "opportunity" && closeDateField) {
    const pastCloseRows = rows.filter((row) => daysSince(row[closeDateField]) > 0).length;
    if (pastCloseRows > 0) {
      issues.push({
        id: "",
        category: "process_integrity",
        severity: "high",
        title: "Open pipeline contains past close dates",
        description: `${pastCloseRows} rows have close dates that are already in the past.`,
        affectedFields: [closeDateField],
        affectedRows: pastCloseRows,
        recommendation: "Create a close-date hygiene rule before forecast review.",
      });
    }
  }

  if (objectType === "opportunity" && forecastField && stageField) {
    const commitEarlyRows = rows.filter((row) => /commit|best case/i.test(row[forecastField] ?? "") && /discovery|qualification/i.test(row[stageField] ?? "")).length;
    if (commitEarlyRows > 0) {
      issues.push({
        id: "",
        category: "process_integrity",
        severity: "high",
        title: "Forecast category conflicts with sales stage",
        description: `${commitEarlyRows} committed or best-case deals are still in early sales stages.`,
        affectedFields: [forecastField, stageField],
        affectedRows: commitEarlyRows,
        recommendation: "Define allowed forecast categories by stage and flag exceptions.",
      });
    }
  }

  if (ownerField) {
    const missingOwnerRows = rows.filter((row) => !row[ownerField]?.trim()).length;
    if (missingOwnerRows > 0) {
      issues.push({
        id: "",
        category: "process_integrity",
        severity: "medium",
        title: "Rows are missing owner accountability",
        description: `${missingOwnerRows} rows do not have an owner.`,
        affectedFields: [ownerField],
        affectedRows: missingOwnerRows,
        recommendation: "Require owner assignment for every revenue object in the audit scope.",
      });
    }
  }

  if (objectType === "arr_revenue" && contractStartField && contractEndField) {
    const invalidTermRows = rows.filter((row) => {
      const start = Date.parse(row[contractStartField] ?? "");
      const end = Date.parse(row[contractEndField] ?? "");
      return !Number.isNaN(start) && !Number.isNaN(end) && end <= start;
    }).length;

    if (invalidTermRows > 0) {
      issues.push({
        id: "",
        category: "process_integrity",
        severity: "critical",
        title: "Contract end date is before start date",
        description: `${invalidTermRows} rows have invalid contract date order.`,
        affectedFields: [contractStartField, contractEndField],
        affectedRows: invalidTermRows,
        recommendation: "Prevent revenue records from entering reporting until contract dates are valid.",
      });
    }
  }

  return issues;
}

function toNumber(value: string | undefined) {
  return Number((value ?? "").replace(/[$,]/g, "")) || 0;
}

function daysSince(value: string | undefined) {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;
  const today = new Date("2026-05-07T00:00:00");
  return Math.floor((today.getTime() - parsed) / (24 * 60 * 60 * 1000));
}
