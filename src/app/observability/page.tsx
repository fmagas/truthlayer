"use client";

import { useMemo, useState } from "react";
import type { AuditIssue, AuditResult, FieldProfile } from "@/types/audit";
import { mockOpportunityCsv, mockRevenueCsv } from "@/lib/audit/mockData";
import { runAudit } from "@/lib/audit/runAudit";

type MockKey = "opportunity" | "revenue";

const mockOptions: Record<MockKey, { label: string; csv: string }> = {
  opportunity: {
    label: "Load mock opportunity CRM export",
    csv: mockOpportunityCsv,
  },
  revenue: {
    label: "Load mock ARR/revenue export",
    csv: mockRevenueCsv,
  },
};

export default function ObservabilityPage() {
  const [selectedMock, setSelectedMock] = useState<MockKey>("opportunity");
  const [csv, setCsv] = useState(mockOpportunityCsv);
  const audit = useMemo(() => runAudit(csv), [csv]);

  function loadMock(key: MockKey) {
    setSelectedMock(key);
    setCsv(mockOptions[key].csv);
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-50">
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">Phase 1 CRM Observability</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal text-slate-950">Revenue data model audit</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Deterministic audit engine for CSV-style CRM and revenue exports. It profiles fields, maps canonical concepts,
              identifies integrity issues, and recommends cleanup actions before any risk model is trained.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(mockOptions) as MockKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => loadMock(key)}
                className={`focus-ring rounded-md px-4 py-2 text-sm font-semibold ${
                  selectedMock === key ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                }`}
              >
                {mockOptions[key].label}
              </button>
            ))}
          </div>
        </div>

        <SummaryCards audit={audit} />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">Field usage profile</h2>
              <p className="mt-1 text-sm text-slate-500">Completeness and inferred type by source field.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Field</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Usage</th>
                    <th className="px-5 py-3">Distinct</th>
                    <th className="px-5 py-3">Examples</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {audit.profiles.map((profile) => (
                    <FieldRow key={profile.fieldName} profile={profile} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">Top issues</h2>
              <p className="mt-1 text-sm text-slate-500">{audit.issues.length} findings detected in this export.</p>
            </div>
            <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto">
              {audit.issues.slice(0, 12).map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Recommended actions</h2>
            <div className="mt-4 space-y-3">
              {audit.recommendedActions.map((action) => (
                <div key={action} className="border-l-2 border-teal-600 pl-3 text-sm leading-6 text-slate-700">
                  {action}
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">Raw audit JSON</h2>
              <p className="mt-1 text-sm text-slate-500">Developer-facing output from the deterministic audit engine.</p>
            </div>
            <pre className="max-h-[520px] overflow-auto bg-slate-950 p-5 text-xs leading-5 text-slate-100">
              {JSON.stringify(audit, null, 2)}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}

function SummaryCards({ audit }: { audit: AuditResult }) {
  return (
    <section className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 shadow-sm md:grid-cols-5">
      <SummaryCard label="System health" value={`${audit.score.systemHealthScore}`} tone={audit.score.systemHealthScore < 55 ? "red" : "teal"} />
      <SummaryCard label="Detected object" value={objectTypeLabel(audit.objectType)} />
      <SummaryCard label="Fields profiled" value={audit.fieldCount.toString()} />
      <SummaryCard label="Findings" value={audit.issues.length.toString()} tone="amber" />
      <SummaryCard label="Completeness" value={`${audit.score.completenessScore}%`} />
    </section>
  );
}

function SummaryCard({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "teal" | "amber" | "red" }) {
  const color =
    tone === "teal" ? "text-teal-700" : tone === "amber" ? "text-amber-700" : tone === "red" ? "text-red-700" : "text-slate-950";

  return (
    <div className="bg-white px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function FieldRow({ profile }: { profile: FieldProfile }) {
  const usage = profile.totalRows ? Math.round((profile.populatedRows / profile.totalRows) * 100) : 0;
  const barColor = usage < 50 ? "bg-red-600" : usage < 80 ? "bg-amber-500" : "bg-teal-600";

  return (
    <tr>
      <td className="px-5 py-4 font-medium text-slate-950">{profile.fieldName}</td>
      <td className="px-5 py-4 capitalize text-slate-700">{profile.inferredType}</td>
      <td className="px-5 py-4">
        <div className="flex min-w-36 items-center gap-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full ${barColor}`} style={{ width: `${usage}%` }} />
          </div>
          <span className="w-10 text-right font-semibold text-slate-950">{usage}%</span>
        </div>
      </td>
      <td className="px-5 py-4 text-slate-700">{profile.distinctCount}</td>
      <td className="max-w-sm px-5 py-4 text-slate-500">{profile.examples.join(", ") || "No populated examples"}</td>
    </tr>
  );
}

function IssueCard({ issue }: { issue: AuditIssue }) {
  return (
    <article className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-950">{issue.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{issue.description}</p>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${severityClass(issue.severity)}`}>{issue.severity}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{issue.category.replace("_", " ")}</span>
        {issue.affectedRows ? <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{issue.affectedRows} rows</span> : null}
      </div>
      <p className="mt-3 text-sm font-medium text-teal-800">{issue.recommendation}</p>
    </article>
  );
}

function objectTypeLabel(value: AuditResult["objectType"]) {
  if (value === "arr_revenue") return "ARR/revenue";
  if (value === "opportunity") return "Opportunity";
  return "Unknown";
}

function severityClass(severity: AuditIssue["severity"]) {
  if (severity === "critical") return "bg-red-100 text-red-800";
  if (severity === "high") return "bg-amber-100 text-amber-800";
  if (severity === "medium") return "bg-slate-100 text-slate-700";
  return "bg-teal-100 text-teal-800";
}
