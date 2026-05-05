export type Deal = {
  id: string;
  dealName: string;
  company: string;
  owner: string;
  stage: string;
  value: number;
  closeDate: string;
  lastActivityDate: string;
  stageDurationDays: number;
  nextStep: string;
};

export type RiskSignal = {
  severity: "high" | "medium";
  reason: string;
  explanation: string;
};

export type ScoredDeal = Deal & {
  riskScore: number;
  confidence: "low" | "medium" | "high";
  signals: RiskSignal[];
  explanation: string;
};

export const mockDeals: Deal[] = [
  {
    id: "DL-1001",
    dealName: "Atlas expansion",
    company: "Atlas Foods",
    owner: "Maya Chen",
    stage: "Proposal",
    value: 128000,
    closeDate: "2026-04-25",
    lastActivityDate: "2026-04-09",
    stageDurationDays: 34,
    nextStep: "",
  },
  {
    id: "DL-1002",
    dealName: "Northstar rollout",
    company: "Northstar Bio",
    owner: "Eli Brooks",
    stage: "Negotiation",
    value: 91000,
    closeDate: "2026-05-22",
    lastActivityDate: "2026-04-16",
    stageDurationDays: 18,
    nextStep: "Legal review",
  },
  {
    id: "DL-1003",
    dealName: "Juniper platform",
    company: "Juniper Works",
    owner: "Priya Shah",
    stage: "Discovery",
    value: 54000,
    closeDate: "2026-06-12",
    lastActivityDate: "2026-05-01",
    stageDurationDays: 9,
    nextStep: "Security workshop",
  },
  {
    id: "DL-1004",
    dealName: "Helio renewal",
    company: "HelioGrid",
    owner: "Noah Reed",
    stage: "Procurement",
    value: 214000,
    closeDate: "2026-05-03",
    lastActivityDate: "2026-04-02",
    stageDurationDays: 42,
    nextStep: "",
  },
  {
    id: "DL-1005",
    dealName: "Cobalt pilot",
    company: "Cobalt Systems",
    owner: "Ava Morgan",
    stage: "Solution fit",
    value: 38000,
    closeDate: "2026-06-04",
    lastActivityDate: "2026-04-20",
    stageDurationDays: 31,
    nextStep: "Pilot scope",
  },
  {
    id: "DL-1006",
    dealName: "Summit migration",
    company: "Summit Logistics",
    owner: "Luis Ortega",
    stage: "Proposal",
    value: 76000,
    closeDate: "2026-05-28",
    lastActivityDate: "2026-05-02",
    stageDurationDays: 12,
    nextStep: "Pricing call",
  },
];

const day = 24 * 60 * 60 * 1000;

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function scoreDeal(deal: Deal, now = new Date()): ScoredDeal {
  const signals: RiskSignal[] = [];
  const closeDate = parseDate(deal.closeDate);
  const lastActivityDate = parseDate(deal.lastActivityDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (closeDate && closeDate < today) {
    signals.push({
      severity: "high",
      reason: "Close date in past",
      explanation: "The expected close date has already passed.",
    });
  }

  if (lastActivityDate) {
    const inactiveDays = Math.floor((today.getTime() - lastActivityDate.getTime()) / day);
    if (inactiveDays > 14) {
      signals.push({
        severity: "medium",
        reason: "No activity in 14 days",
        explanation: `No logged activity for ${inactiveDays} days.`,
      });
    }
  }

  if (deal.stageDurationDays > 30) {
    signals.push({
      severity: "high",
      reason: "Stage duration >30 days",
      explanation: `The deal has been in ${deal.stage} for ${deal.stageDurationDays} days.`,
    });
  }

  if (!deal.nextStep.trim()) {
    signals.push({
      severity: "high",
      reason: "Missing next step",
      explanation: "No next step is recorded for the deal.",
    });
  }

  const riskScore = Math.min(
    100,
    signals.reduce((score, signal) => score + (signal.severity === "high" ? 35 : 20), 0),
  );
  const confidence =
    signals.length > 1 ? "high" : signals.length === 1 && signals[0].severity === "medium" ? "low" : signals.length === 1 ? "medium" : "low";
  const explanation = signals.length
    ? signals.map((signal) => signal.explanation).join(" ")
    : "No rule-based risk signals detected.";

  return { ...deal, riskScore, confidence, signals, explanation };
}

export function scoreDeals(deals: Deal[], now = new Date()) {
  return deals.map((deal) => scoreDeal(deal, now));
}

export function summarizeDeals(scoredDeals: ScoredDeal[]) {
  const highRiskDeals = scoredDeals.filter((deal) => deal.riskScore >= 70);
  const reasonCounts = new Map<string, number>();

  for (const deal of scoredDeals) {
    for (const signal of deal.signals) {
      reasonCounts.set(signal.reason, (reasonCounts.get(signal.reason) ?? 0) + 1);
    }
  }

  return {
    totalDeals: scoredDeals.length,
    highRiskDeals: highRiskDeals.length,
    valueAtRisk: highRiskDeals.reduce((total, deal) => total + deal.value, 0),
    topReasons: [...reasonCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason, count]) => ({ reason, count })),
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function parsePipelineCsv(csv: string): Deal[] {
  const rows = parseCsvRows(csv).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((row, index) => {
    const record = new Map(headers.map((header, headerIndex) => [header, row[headerIndex] ?? ""]));

    return {
      id: record.get("id") || `CSV-${index + 1}`,
      dealName: record.get("dealname") || record.get("deal") || "Untitled deal",
      company: record.get("company") || "Unknown company",
      owner: record.get("owner") || "Unassigned",
      stage: record.get("stage") || "Unknown",
      value: Number(record.get("value") || record.get("amount") || 0),
      closeDate: record.get("closedate") || "",
      lastActivityDate: record.get("lastactivitydate") || record.get("lastactivity") || "",
      stageDurationDays: Number(record.get("stagedurationdays") || record.get("stageduration") || 0),
      nextStep: record.get("nextstep") || "",
    };
  });
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseCsvRows(csv: string) {
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
