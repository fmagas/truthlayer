# TruthLayer

TruthLayer is a minimal SaaS prototype for analyzing sales pipeline CSV data and detecting unreliable deals with transparent rule-based logic.

The app highlights risk signals per deal, assigns a 0-100 risk score, adds a confidence rating, and explains why each deal was flagged. It is intentionally frontend-only: no authentication, backend database, CRM integration, or forecasting model is included.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Steps

1. Start on the landing page to review the product positioning and mock reliability preview.
2. Go to `Upload` and choose a CSV file, load the sample CSV, or use the mock dataset.
3. Click `Analyze deals`.
4. Review the results dashboard:
   - total deals uploaded
   - high-risk deals
   - pipeline value at risk
   - top 3 flagged reasons
   - deal-level risk score, confidence, and explanation

## CSV Columns

TruthLayer accepts these columns:

```csv
id,dealName,company,owner,stage,value,closeDate,lastActivityDate,stageDurationDays,nextStep
```

Aliases are supported for a few common fields, including `deal`, `amount`, `lastActivity`, and `stageDuration`.

## Risk Rules

- Close date in the past: high risk
- No activity in 14 days: medium risk
- Stage duration greater than 30 days: high risk
- Missing next step: high risk

## Confidence Rules

- Multiple detected signals: high confidence
- Single weak signal: low confidence
- Single high-severity signal: medium confidence

## Limitations

- CSV analysis runs entirely in the browser.
- Uploaded data is stored only in local browser storage for the demo flow.
- Scoring is rule-based and does not use predictive forecasting or machine learning.
- There is no user authentication, backend database, CRM sync, or production data validation.
