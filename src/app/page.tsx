import Link from "next/link";
import { mockDeals, scoreDeals, summarizeDeals, formatCurrency } from "@/lib/pipeline";

const scoredDeals = scoreDeals(mockDeals);
const summary = summarizeDeals(scoredDeals);

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 md:text-6xl">
            Find unreliable pipeline before it finds your forecast
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            TruthLayer reviews uploaded sales pipeline data with transparent rule-based logic, then scores each deal for risk and confidence so leaders can inspect the shaky revenue first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/observability" className="focus-ring rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
              Audit CRM export
            </Link>
            <Link href="/upload" className="focus-ring rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
              Upload CSV
            </Link>
            <Link href="/results" className="focus-ring rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              View mock results
            </Link>
          </div>
        </div>

        <div className="border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-950">Pipeline reliability scan</p>
            <p className="mt-1 text-sm text-slate-500">Mock dataset preview</p>
          </div>
          <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
            <Metric label="Total deals" value={summary.totalDeals.toString()} />
            <Metric label="High-risk deals" value={summary.highRiskDeals.toString()} tone="red" />
            <Metric label="Value at risk" value={formatCurrency(summary.valueAtRisk)} tone="amber" />
          </div>
          <div className="divide-y divide-slate-100">
            {scoredDeals.slice(0, 4).map((deal) => (
              <div key={deal.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium text-slate-950">{deal.dealName}</p>
                  <p className="mt-1 text-sm text-slate-500">{deal.company} · {deal.stage}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${deal.riskScore >= 70 ? "bg-red-600" : deal.riskScore > 0 ? "bg-amber-500" : "bg-green-600"}`} />
                  <span className="text-sm font-semibold text-slate-900">{deal.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "red" | "amber" }) {
  const color = tone === "red" ? "text-red-700" : tone === "amber" ? "text-amber-700" : "text-slate-950";

  return (
    <div className="bg-white px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
