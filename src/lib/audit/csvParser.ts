import type { CsvParseResult, CsvRecord } from "@/types/audit";

export function parseAuditCsv(csv: string): CsvParseResult {
  const rows = parseRows(csv).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length === 0) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  const headers = rows[0].map((header, index) => header.trim() || `Column ${index + 1}`);
  const records: CsvRecord[] = rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, (row[index] ?? "").trim()])),
  );

  return {
    headers,
    rows: records,
    rowCount: records.length,
  };
}

function parseRows(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}
