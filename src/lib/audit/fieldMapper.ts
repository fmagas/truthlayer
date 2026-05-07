import type { AuditObjectType, CanonicalField, FieldMapping, FieldProfile } from "@/types/audit";

const synonyms: Record<CanonicalField, string[]> = {
  opportunityId: ["opportunityid", "opportunity id", "oppid", "opp id", "dealid", "deal id"],
  accountName: ["accountname", "account name", "company", "customer", "customername"],
  stageName: ["stage", "stagename", "stage name", "opportunitystage"],
  amount: ["amount", "opportunityamount", "dealvalue", "deal value", "bookingamount"],
  arr: ["arr", "annual recurring revenue", "annualrecurringrevenue", "subscriptionarr"],
  mrr: ["mrr", "monthly recurring revenue", "monthlyrecurringrevenue"],
  closeDate: ["closedate", "close date", "expectedclosedate", "expected close date"],
  createdDate: ["createddate", "created date", "opportunitycreateddate"],
  owner: ["owner", "opportunityowner", "accountowner", "ae", "salesrep"],
  lastActivityDate: ["lastactivitydate", "last activity date", "lastactivity", "last touch", "lasttouchdate"],
  nextStep: ["nextstep", "next step", "nextaction", "next action"],
  forecastCategory: ["forecastcategory", "forecast category", "forecast"],
  region: ["region", "territory", "market"],
  source: ["source", "leadsource", "lead source", "opportunitysource"],
  renewalDate: ["renewaldate", "renewal date", "next renewal date"],
  contractStartDate: ["contractstartdate", "contract start date", "startdate", "start date"],
  contractEndDate: ["contractenddate", "contract end date", "enddate", "end date"],
  revenueStatus: ["revenuestatus", "revenue status", "billingstatus", "billing status", "subscriptionstatus"],
  billingAccountId: ["billingaccountid", "billing account id", "billingid", "billing id"],
  crmAccountId: ["crmaccountid", "crm account id", "accountid", "account id"],
};

export function mapFields(profiles: FieldProfile[]): FieldMapping[] {
  const mappings: FieldMapping[] = [];

  for (const canonicalField of Object.keys(synonyms) as CanonicalField[]) {
    const best = findBestField(canonicalField, profiles.map((profile) => profile.fieldName));
    if (best) mappings.push(best);
  }

  return mappings;
}

export function detectObjectType(mappings: FieldMapping[], profiles: FieldProfile[]): AuditObjectType {
  const canonicalFields = new Set(mappings.map((mapping) => mapping.canonicalField));
  const fieldText = profiles.map((profile) => normalize(profile.fieldName)).join(" ");

  const opportunityScore = Number(canonicalFields.has("opportunityId")) + Number(canonicalFields.has("stageName")) + Number(canonicalFields.has("closeDate"));
  const revenueScore =
    Number(canonicalFields.has("arr")) +
    Number(canonicalFields.has("mrr")) +
    Number(canonicalFields.has("billingAccountId")) +
    Number(canonicalFields.has("revenueStatus")) +
    Number(fieldText.includes("subscription"));

  if (opportunityScore >= 2 && opportunityScore >= revenueScore) return "opportunity";
  if (revenueScore >= 2) return "arr_revenue";
  return "unknown";
}

export function getMappedField(mappings: FieldMapping[], canonicalField: CanonicalField) {
  return mappings.find((mapping) => mapping.canonicalField === canonicalField)?.sourceField;
}

function findBestField(canonicalField: CanonicalField, fields: string[]): FieldMapping | null {
  const candidates = synonyms[canonicalField];
  let best: FieldMapping | null = null;

  for (const field of fields) {
    const normalizedField = normalize(field);
    for (const candidate of candidates) {
      const normalizedCandidate = normalize(candidate);
      if (normalizedField === normalizedCandidate) {
        return {
          canonicalField,
          sourceField: field,
          confidence: "high",
          reason: `Exact match for ${candidate}.`,
        };
      }

      if (normalizedField.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedField)) {
        best = {
          canonicalField,
          sourceField: field,
          confidence: "medium",
          reason: `Partial match for ${candidate}.`,
        };
      }
    }
  }

  return best;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
