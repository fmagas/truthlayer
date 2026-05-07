import type { CsvRecord, FieldProfile } from "@/types/audit";

export function profileSchema(headers: string[], rows: CsvRecord[]): FieldProfile[] {
  return headers.map((fieldName) => {
    const values = rows.map((row) => row[fieldName] ?? "");
    const populated = values.filter((value) => value.trim() !== "");
    const distinctValues = new Set(populated.map((value) => value.trim().toLowerCase()));

    return {
      fieldName,
      totalRows: rows.length,
      populatedRows: populated.length,
      emptyRows: rows.length - populated.length,
      emptyRate: rows.length ? (rows.length - populated.length) / rows.length : 0,
      distinctCount: distinctValues.size,
      inferredType: inferType(populated),
      examples: [...new Set(populated.map((value) => value.trim()).filter(Boolean))].slice(0, 3),
    };
  });
}

function inferType(values: string[]): FieldProfile["inferredType"] {
  if (values.length === 0) return "empty";

  const normalized = values.map((value) => value.trim());
  const numberCount = normalized.filter((value) => value !== "" && !Number.isNaN(Number(stripCurrency(value)))).length;
  const dateCount = normalized.filter((value) => !Number.isNaN(Date.parse(value))).length;
  const booleanCount = normalized.filter((value) => /^(true|false|yes|no|y|n)$/i.test(value)).length;
  const threshold = Math.max(1, Math.ceil(values.length * 0.8));

  if (numberCount >= threshold) return "number";
  if (dateCount >= threshold) return "date";
  if (booleanCount >= threshold) return "boolean";
  return "text";
}

function stripCurrency(value: string) {
  return value.replace(/[$,]/g, "");
}
