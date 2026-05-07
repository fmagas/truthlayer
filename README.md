# TruthLayer

TruthLayer contains two prototype tracks that should stay separate.

## Phase 1: CRM Observability

Phase 1 audits CRM-style CSV exports before any deal-risk model is trained. It looks for data model health, field usage problems, naming confusion, ARR reliability problems, and process integrity gaps.

Route:

```text
/observability
```

The Phase 1 module is deterministic and modular:

```text
src/types/audit.ts
src/lib/audit/csvParser.ts
src/lib/audit/schemaProfiler.ts
src/lib/audit/fieldMapper.ts
src/lib/audit/issueEngine.ts
src/lib/audit/scoring.ts
src/lib/audit/mockData.ts
src/lib/audit/runAudit.ts
```

It currently supports:

- loading a mock opportunity CRM export
- loading a mock ARR/revenue export
- detected object type
- system health score
- field profiles
- canonical field mappings
- field usage issues
- naming confusion issues
- ARR reliability issues
- process integrity issues
- recommended actions
- raw audit JSON output

Phase 1 does not include LLM integration, backend persistence, or CRM integrations.

## Phase 2: Pipeline Deal Risk

Phase 2 is the existing minimal SaaS prototype for analyzing sales pipeline CSV data and detecting unreliable deals with transparent rule-based logic.

The app highlights risk signals per deal, assigns a 0-100 risk score, adds a confidence rating, and explains why each deal was flagged. It is intentionally frontend-only: no authentication, backend database, CRM integration, or forecasting model is included.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Steps

1. Open `/observability` to run the Phase 1 CRM/revenue data audit on mock exports.
2. Start on the landing page to review the Phase 2 product positioning and mock reliability preview.
3. Go to `Upload` and choose a CSV file, load the sample CSV, or use the mock dataset.
4. Click `Analyze deals`.
5. Review the results dashboard:
   - total deals uploaded
   - high-risk deals
   - pipeline value at risk
   - top 3 flagged reasons
   - deal-level risk score, confidence, and explanation

## Phase 2 CSV Columns

TruthLayer accepts these columns:

```csv
id,dealName,company,owner,stage,value,closeDate,lastActivityDate,stageDurationDays,nextStep
```

Aliases are supported for a few common fields, including `deal`, `amount`, `lastActivity`, and `stageDuration`.

## Phase 2 Risk Rules

- Close date in the past: high risk
- No activity in 14 days: medium risk
- Stage duration greater than 30 days: high risk
- Missing next step: high risk

## Phase 2 Confidence Rules

- Multiple detected signals: high confidence
- Single weak signal: low confidence
- Single high-severity signal: medium confidence

## Limitations

- CSV analysis runs entirely in the browser.
- Uploaded data is stored only in local browser storage for the demo flow.
- Scoring is rule-based and does not use predictive forecasting or machine learning.
- There is no user authentication, backend database, CRM sync, or production data validation.
