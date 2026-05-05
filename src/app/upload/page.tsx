"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mockDeals, parsePipelineCsv, scoreDeals, type Deal } from "@/lib/pipeline";
import { saveDeals } from "@/lib/storage";

const sampleCsv = `id,dealName,company,owner,stage,value,closeDate,lastActivityDate,stageDurationDays,nextStep
DL-2001,Enterprise renewal,Acme Health,Dana Lee,Negotiation,156000,2026-04-26,2026-04-10,35,
DL-2002,Platform pilot,Vector Labs,Sam King,Discovery,42000,2026-06-18,2026-05-01,8,Technical workshop
DL-2003,Global rollout,Marble Retail,Iris Wong,Procurement,238000,2026-05-02,2026-04-05,45,`;

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const preview = useMemo(() => scoreDeals(deals).slice(0, 3), [deals]);

  function acceptDeals(nextDeals: Deal[], name: string) {
    if (!nextDeals.length) {
      setError("The CSV did not include any deal rows.");
      return;
    }

    setDeals(nextDeals);
    setFileName(name);
    setError("");
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    acceptDeals(parsePipelineCsv(text), file.name);
  }

  function useSampleCsv() {
    acceptDeals(parsePipelineCsv(sampleCsv), "sample-pipeline.csv");
  }

  function useMockData() {
    acceptDeals(mockDeals, "mock-pipeline.csv");
  }

  function analyze() {
    const selectedDeals = deals.length ? deals : mockDeals;
    saveDeals(selectedDeals);
    router.push("/results");
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-50">
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Upload pipeline CSV</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Bring a simple pipeline export into TruthLayer. Analysis runs locally in the browser using the reliability rules defined for this prototype.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="border border-slate-200 bg-white p-6 shadow-sm">
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="focus-ring flex min-h-56 w-full flex-col items-center justify-center border border-dashed border-slate-300 bg-slate-50 px-6 text-center hover:border-teal-600 hover:bg-teal-50"
            >
              <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-xl font-semibold text-teal-700 shadow-sm">+</span>
              <span className="mt-4 text-lg font-semibold text-slate-950">Upload CSV</span>
              <span className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Expected columns: dealName, company, owner, stage, value, closeDate, lastActivityDate, stageDurationDays, nextStep.
              </span>
            </button>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={useSampleCsv} className="focus-ring rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Load sample CSV
              </button>
              <button type="button" onClick={useMockData} className="focus-ring rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Use mock dataset
              </button>
            </div>

            {fileName ? <p className="mt-5 text-sm font-medium text-teal-800">{fileName} ready for analysis.</p> : null}
            {error ? <p className="mt-5 text-sm font-medium text-red-700">{error}</p> : null}
          </section>

          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-950">Upload preview</h2>
                <p className="mt-1 text-sm text-slate-500">{deals.length || mockDeals.length} deals available</p>
              </div>
              <button type="button" onClick={analyze} className="focus-ring rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                Analyze deals
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Deal</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3">Risk</th>
                    <th className="px-5 py-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(preview.length ? preview : scoreDeals(mockDeals).slice(0, 3)).map((deal) => (
                    <tr key={deal.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">{deal.dealName}</p>
                        <p className="mt-1 text-slate-500">{deal.company}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{deal.stage}</td>
                      <td className="px-5 py-4 font-semibold text-slate-950">{deal.riskScore}</td>
                      <td className="px-5 py-4 capitalize text-slate-700">{deal.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
