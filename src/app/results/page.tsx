"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency, mockDeals, scoreDeals, summarizeDeals, type Deal, type ScoredDeal } from "@/lib/pipeline";
import { loadDeals } from "@/lib/storage";

export default function ResultsPage() {
  const [deals] = useState<Deal[]>(() => loadDeals() ?? mockDeals);

  const scoredDeals = useMemo(() => scoreDeals(deals), [deals]);
  const summary = useMemo(() => summarizeDeals(scoredDeals), [scoredDeals]);

  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-50">
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Results dashboard</h1>
            <p className="mt-3 text-base text-slate-600">Rule-based reliability scan for uploaded pipeline data.</p>
          </div>
          <Link href="/upload" className="focus-ring w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
            Upload another CSV
          </Link>
        </div>

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Executive summary</h2>
          </div>
          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <SummaryMetric label="Total deals uploaded" value={summary.totalDeals.toString()} />
            <SummaryMetric label="High-risk deals" value={summary.highRiskDeals.toString()} tone="red" />
            <SummaryMetric label="Pipeline value at risk" value={formatCurrency(summary.valueAtRisk)} tone="amber" />
            <div className="bg-white px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Top reasons flagged</p>
              <div className="mt-3 space-y-2">
                {summary.topReasons.length ? (
                  summary.topReasons.map((item) => (
                    <div key={item.reason} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700">{item.reason}</span>
                      <span className="font-semibold text-slate-950">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No flagged reasons.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-950">Deal reliability</h2>
              <p className="mt-1 text-sm text-slate-500">Flagged deals are highlighted by risk score and confidence.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="px-5 py-3">Deal</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scoredDeals.map((deal) => (
                  <DealRow key={deal.id} deal={deal} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function SummaryMetric({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "red" | "amber" }) {
  const color = tone === "red" ? "text-red-700" : tone === "amber" ? "text-amber-700" : "text-slate-950";

  return (
    <div className="bg-white px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function DealRow({ deal }: { deal: ScoredDeal }) {
  const flagged = deal.riskScore > 0;
  const riskColor = deal.riskScore >= 70 ? "bg-red-600" : deal.riskScore > 0 ? "bg-amber-500" : "bg-green-600";

  return (
    <tr className={flagged ? "bg-red-50/45" : "bg-white"}>
      <td className="px-5 py-4">
        <p className="font-medium text-slate-950">{deal.dealName}</p>
        <p className="mt-1 text-slate-500">{deal.company}</p>
      </td>
      <td className="px-5 py-4 text-slate-700">{deal.owner}</td>
      <td className="px-5 py-4 text-slate-700">{deal.stage}</td>
      <td className="px-5 py-4 font-medium text-slate-950">{formatCurrency(deal.value)}</td>
      <td className="px-5 py-4">
        <div className="flex min-w-32 items-center gap-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full ${riskColor}`} style={{ width: `${deal.riskScore}%` }} />
          </div>
          <span className="w-8 text-right font-semibold text-slate-950">{deal.riskScore}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex min-w-20 justify-center rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${confidenceClass(deal.confidence)}`}>
          {deal.confidence}
        </span>
      </td>
      <td className="max-w-lg px-5 py-4 text-slate-700">{deal.explanation}</td>
    </tr>
  );
}

function confidenceClass(confidence: ScoredDeal["confidence"]) {
  if (confidence === "high") return "bg-teal-100 text-teal-800";
  if (confidence === "medium") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}
